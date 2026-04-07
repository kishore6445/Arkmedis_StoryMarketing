import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'YouTube',
  'Facebook',
  'Twitter/X',
  'TikTok',
  'Blog',
  'Email',
  'Website',
] as const

export type Platform = typeof PLATFORMS[number]

export interface ContentTarget {
  id: string
  client_id: string
  month: string
  year: number
  platform: Platform
  target_count: number
  created_at: string
  updated_at: string
}

/**
 * Get all targets for a client in a specific month
 */
export async function getClientTargets(
  clientId: string,
  month: string,
  year: number
): Promise<ContentTarget[]> {
  const { data, error } = await supabase
    .from('content_targets')
    .select('*')
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)

  if (error) {
    console.error('[v0] Error fetching targets:', error)
    return []
  }

  return data || []
}

/**
 * Get target count for a specific platform
 */
export async function getPlatformTarget(
  clientId: string,
  month: string,
  year: number,
  platform: Platform
): Promise<number> {
  const { data, error } = await supabase
    .from('content_targets')
    .select('target_count')
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)
    .eq('platform', platform)
    .single()

  if (error) return 0
  return data?.target_count || 0
}

/**
 * Get total target count across all platforms for a month
 */
export async function getTotalMonthlyTarget(
  clientId: string,
  month: string,
  year: number
): Promise<number> {
  const targets = await getClientTargets(clientId, month, year)
  return targets.reduce((sum, target) => sum + target.target_count, 0)
}

/**
 * Create or update a target
 */
export async function upsertTarget(
  clientId: string,
  month: string,
  year: number,
  platform: Platform,
  targetCount: number
): Promise<ContentTarget | null> {
  const { data, error } = await supabase
    .from('content_targets')
    .upsert(
      {
        client_id: clientId,
        month,
        year,
        platform,
        target_count: targetCount,
      },
      {
        onConflict: 'client_id,month,year,platform',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('[v0] Error upserting target:', error)
    return null
  }

  return data
}

/**
 * Batch update targets for a client-month
 */
export async function batchUpdateTargets(
  clientId: string,
  month: string,
  year: number,
  platformTargets: Record<Platform, number>
): Promise<ContentTarget[]> {
  const updates = Object.entries(platformTargets).map(([platform, count]) => ({
    client_id: clientId,
    month,
    year,
    platform,
    target_count: count,
  }))

  const { data, error } = await supabase
    .from('content_targets')
    .upsert(updates, {
      onConflict: 'client_id,month,year,platform',
    })
    .select()

  if (error) {
    console.error('[v0] Error batch updating targets:', error)
    return []
  }

  return data || []
}

/**
 * Delete a target
 */
export async function deleteTarget(
  clientId: string,
  month: string,
  year: number,
  platform: Platform
): Promise<boolean> {
  const { error } = await supabase
    .from('content_targets')
    .delete()
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)
    .eq('platform', platform)

  if (error) {
    console.error('[v0] Error deleting target:', error)
    return false
  }

  return true
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: string; year: number } {
  const now = new Date()
  const month = now.toLocaleString('default', { month: 'long' }).toLowerCase()
  const year = now.getFullYear()
  return { month, year }
}

/**
 * Format month name
 */
export function formatMonthYear(month: string, year: number): string {
  const date = new Date(`${month} 1, ${year}`)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}
