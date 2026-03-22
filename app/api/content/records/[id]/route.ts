import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

function normalizeStatus(status?: string | null) {
  return (status || "planned").trim().toLowerCase()
}

function mapPayload(body: any) {
  return {
    client_id: body.clientId,
    owner_id: body.ownerId || null,
    title: body.title?.trim(),
    content_type: body.contentType?.trim() || null,
    platform: body.platform?.trim(),
    planning_month: body.month?.trim() || null,
    planning_week: body.week?.trim() || null,
    planned_date: body.plannedDate || null,
    scheduled_date: body.scheduledDate || null,
    published_date: body.publishedDate || null,
    attachment_url: body.attachmentUrl || null,
    attachment_name: body.attachmentName || null,
    attachment_type: body.attachmentType || null,
    attachment_size: body.attachmentSize || null,
    status: normalizeStatus(body.status),
    notes: body.notes?.trim() || null,
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const supabase = getSupabaseAdminClient()

    const { data: record, error } = await supabase
      .from("content_records")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ record })
  } catch (error) {
    console.error("[v0] Failed to fetch content record:", error)
    return NextResponse.json({ error: "Failed to fetch content record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = await context.params

    if (!body.clientId || !body.title?.trim() || !body.platform?.trim()) {
      return NextResponse.json({ error: "clientId, title, and platform are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: record, error } = await supabase
      .from("content_records")
      .update(mapPayload(body))
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Failed to update content record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("[v0] Failed to update content record:", error)
    return NextResponse.json({ error: "Failed to update content record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("content_records")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Failed to delete content record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete content record:", error)
    return NextResponse.json({ error: "Failed to delete content record" }, { status: 500 })
  }
}