'use server'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _adminClient: SupabaseClient | null = null
let _anonClient: SupabaseClient | null = null

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUUID(id: string | null | undefined): boolean {
  return !!id && UUID_REGEX.test(id)
}

function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const m = Reflect.get(error, 'message')
    if (typeof m === 'string' && m.trim()) return m
  }
  return 'Unknown error'
}

function toCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null) {
    const c = Reflect.get(error, 'code')
    if (typeof c === 'string' && c.trim()) return c
  }
  return null
}

function isNonFatal(error: unknown): boolean {
  const code = toCode(error)
  const msg = toMessage(error).toLowerCase()
  return (
    code === '42P01' ||
    code === '42501' ||
    code === 'PGRST205' ||
    msg.includes('does not exist') ||
    msg.includes('permission denied') ||
    msg.includes('row-level security') ||
    msg.includes('missing supabase')
  )
}

/**
 * Prefer service-role key (bypasses RLS – correct for server actions).
 * Falls back to anon key if the service key is not configured.
 */
function getClient(): { client: SupabaseClient | null; error: string | null } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY

  if (url && serviceKey) {
    if (!_adminClient) {
      _adminClient = createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    }
    return { client: _adminClient, error: null }
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (url && anonKey) {
    if (!_anonClient) _anonClient = createClient(url, anonKey)
    return { client: _anonClient, error: null }
  }

  return { client: null, error: 'Missing Supabase environment variables.' }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KBDBRecord {
  id: string
  user_id: string
  parent_id: string | null
  title: string
  content: string | null
  position: number
  completed: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface KBTreeNode {
  id: string
  text: string
  children: KBTreeNode[]
  completed: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

function buildTree(records: KBDBRecord[]): KBTreeNode[] {
  const map: Record<string, KBTreeNode> = {}
  const roots: KBTreeNode[] = []

  for (const r of records) {
    map[r.id] = {
      id: r.id,
      text: r.title,
      children: [],
      completed: r.completed ?? false,
      tags: [],
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    }
  }

  for (const r of records) {
    if (r.parent_id && map[r.parent_id]) {
      map[r.parent_id].children.push(map[r.id])
    } else {
      roots.push(map[r.id])
    }
  }

  const sort = (nodes: KBTreeNode[]) => {
    nodes.sort((a, b) => {
      const pa = records.find((r) => r.id === a.id)?.position ?? 0
      const pb = records.find((r) => r.id === b.id)?.position ?? 0
      return pa - pb
    })
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)

  return roots
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createKBNode(
  userId: string,
  parentId: string | null,
  text: string,
  position: number = 0,
): Promise<{ success: boolean; data: KBDBRecord | null; error?: string }> {
  try {
    const { client, error: connErr } = getClient()
    if (!client) {
      console.warn('[KB] No DB client, creating local-only node:', connErr)
      return { success: true, data: null }
    }

    if (!isValidUUID(userId)) {
      return { success: false, data: null, error: 'Please log in to save items.' }
    }

    if (parentId && !isValidUUID(parentId)) parentId = null

    const normalizedText = text.trim() || 'new item'

    const { data, error } = await client
      .from('kb_pages')
      .insert([
        {
          user_id: userId,
          parent_id: parentId,
          title: normalizedText,
          content: normalizedText,
          position,
          completed: false,
        },
      ])
      .select()
      .single()

    if (error) {
      if (isNonFatal(error)) {
        console.warn('[KB] Table not ready, local-only create:', toMessage(error))
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data }
  } catch (err) {
    console.error('[KB] createKBNode:', err)
    return { success: false, data: null, error: toMessage(err) }
  }
}

// ─── READ ─────────────────────────────────────────────────────────────────────

export async function fetchKBPages(
  userId: string,
): Promise<{ success: boolean; data: KBDBRecord[]; error?: string }> {
  try {
    if (!isValidUUID(userId)) return { success: true, data: [] }

    const { client } = getClient()
    if (!client) return { success: true, data: [] }

    const { data, error } = await client
      .from('kb_pages')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('position', { ascending: true })

    if (error) {
      if (isNonFatal(error)) return { success: true, data: [] }
      throw error
    }

    return { success: true, data: (data ?? []) as KBDBRecord[] }
  } catch (err) {
    console.error('[KB] fetchKBPages:', err)
    return { success: false, data: [], error: toMessage(err) }
  }
}

export async function fetchKBTree(
  userId: string,
): Promise<{ success: boolean; nodes: KBTreeNode[]; error?: string }> {
  const result = await fetchKBPages(userId)
  if (!result.success) return { success: false, nodes: [], error: result.error }
  return { success: true, nodes: buildTree(result.data) }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateKBNode(
  nodeId: string,
  userId: string,
  updates: { title?: string; content?: string; completed?: boolean },
): Promise<{ success: boolean; data: KBDBRecord | null; error?: string }> {
  try {
    if (!isValidUUID(nodeId)) return { success: true, data: null }
    if (!isValidUUID(userId)) return { success: false, data: null, error: 'Please log in.' }

    const { client } = getClient()
    if (!client) return { success: true, data: null }

    const { data, error } = await client
      .from('kb_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', nodeId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (isNonFatal(error)) return { success: true, data: null }
      throw error
    }

    return { success: true, data }
  } catch (err) {
    console.error('[KB] updateKBNode:', err)
    return { success: false, data: null, error: toMessage(err) }
  }
}

export async function toggleKBNodeComplete(
  nodeId: string,
  userId: string,
  completed: boolean,
): Promise<{ success: boolean; data: KBDBRecord | null; error?: string }> {
  return updateKBNode(nodeId, userId, { completed })
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteKBNode(
  nodeId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUUID(nodeId)) return { success: true }

    const { client } = getClient()
    if (!client) return { success: true }

    // Soft-delete: set deleted_at so data can be recovered; FK CASCADE handles children if hard delete is ever needed.
    const { error } = await client
      .from('kb_pages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', nodeId)
      .eq('user_id', userId)

    if (error) {
      if (isNonFatal(error)) return { success: true }
      throw error
    }

    return { success: true }
  } catch (err) {
    console.error('[KB] deleteKBNode:', err)
    return { success: false, error: toMessage(err) }
  }
}

// ─── TAGS ─────────────────────────────────────────────────────────────────────

export async function addKBNodeTag(
  nodeId: string,
  userId: string,
  tagName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUUID(nodeId) || !isValidUUID(userId)) return { success: true }

    const { client } = getClient()
    if (!client) return { success: true }

    // Upsert the tag (unique per user+name)
    const { data: existing } = await client
      .from('kb_tags')
      .select('id')
      .eq('user_id', userId)
      .eq('name', tagName)
      .maybeSingle()

    let tagId: string
    if (existing) {
      tagId = existing.id
    } else {
      const { data: newTag, error: insertErr } = await client
        .from('kb_tags')
        .insert([{ user_id: userId, name: tagName, color: 'blue' }])
        .select('id')
        .single()

      if (insertErr) {
        if (isNonFatal(insertErr)) return { success: true }
        throw insertErr
      }
      tagId = newTag.id
    }

    const { error: linkErr } = await client
      .from('kb_page_tags')
      .insert([{ page_id: nodeId, tag_id: tagId }])
      .select()
      .maybeSingle()

    if (linkErr && !isNonFatal(linkErr)) throw linkErr

    return { success: true }
  } catch (err) {
    console.error('[KB] addKBNodeTag:', err)
    return { success: false, error: toMessage(err) }
  }
}

export async function removeKBNodeTag(
  nodeId: string,
  tagId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isValidUUID(nodeId)) return { success: true }

    const { client } = getClient()
    if (!client) return { success: true }

    const { error } = await client
      .from('kb_page_tags')
      .delete()
      .eq('page_id', nodeId)
      .eq('tag_id', tagId)

    if (error && !isNonFatal(error)) throw error

    return { success: true }
  } catch (err) {
    console.error('[KB] removeKBNodeTag:', err)
    return { success: false, error: toMessage(err) }
  }
}
