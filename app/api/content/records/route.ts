import { type NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/db"

function normalizeStatus(status?: string | null) {
  return (status || "planned").trim().toLowerCase()
}

function formatStatus(status: string | null) {
  return (status || "planned").toUpperCase()
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const clientId = request.nextUrl.searchParams.get("clientId")
    const clientName = request.nextUrl.searchParams.get("client")
    const status = request.nextUrl.searchParams.get("status")
    const month = request.nextUrl.searchParams.get("month")
    const week = request.nextUrl.searchParams.get("week")
    const search = request.nextUrl.searchParams.get("search")
    const viewMode = request.nextUrl.searchParams.get("viewMode") || "all"

    console.log("[v0] Fetching content records:", { clientId, clientName, status, month, week, viewMode })

    let query = supabase
      .from("content_records")
      .select("*")
      .order("scheduled_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    if (month) {
      query = query.eq("planning_month", month)
    }

    if (week) {
      query = query.eq("planning_week", week)
    }

    if (status) {
      query = query.eq("status", normalizeStatus(status))
    }

    const { data: records, error } = await query

    if (error) {
      console.error("[v0] Error fetching content records:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const filteredByClientName = clientName && clientName !== "All Clients"
      ? (records || []).filter((record) => record.client_id)
      : (records || [])

    const clientIds = Array.from(new Set(filteredByClientName.map((record) => record.client_id).filter(Boolean)))
    const ownerIds = Array.from(new Set(filteredByClientName.map((record) => record.owner_id).filter(Boolean)))

    const [{ data: clients }, { data: owners }] = await Promise.all([
      clientIds.length
        ? supabase.from("clients").select("id, name").in("id", clientIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
      ownerIds.length
        ? supabase.from("users").select("id, full_name").in("id", ownerIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
    ])

    const clientMap = new Map((clients || []).map((client) => [client.id, client.name]))
    const ownerMap = new Map((owners || []).map((owner) => [owner.id, owner.full_name || "Unassigned"]))

    let transformedRecords = filteredByClientName
      .map((record) => ({
        id: record.id,
        clientId: record.client_id,
        client: clientMap.get(record.client_id) || "Unknown",
        title: record.title,
        contentType: record.content_type || "",
        platform: record.platform,
        plannedDate: record.planned_date || "",
        scheduledDate: record.scheduled_date || "",
        publishedDate: record.published_date || "",
        ownerId: record.owner_id,
        owner: ownerMap.get(record.owner_id) || "Unassigned",
        status: formatStatus(record.status),
        month: record.planning_month || "",
        week: record.planning_week || "",
        notes: record.notes || "",
        attachmentUrl: record.attachment_url || "",
        attachmentName: record.attachment_name || "",
        attachmentType: record.attachment_type || "",
        attachmentSize: record.attachment_size || 0,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
      }))
      .filter((record) => !clientName || clientName === "All Clients" || record.client === clientName)

    if (search) {
      const normalizedSearch = search.trim().toLowerCase()
      transformedRecords = transformedRecords.filter((record) =>
        [record.title, record.client, record.platform, record.owner, record.contentType]
          .some((value) => value.toLowerCase().includes(normalizedSearch))
      )
    }

    return NextResponse.json({
      records: transformedRecords,
      total: transformedRecords.length,
      viewMode,
    })
  } catch (error) {
    console.error("[v0] Content records error:", error)
    return NextResponse.json(
      { error: "Failed to fetch content records" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.clientId || !body.title?.trim() || !body.platform?.trim()) {
      return NextResponse.json({ error: "clientId, title, and platform are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: record, error } = await supabase
      .from("content_records")
      .insert({
        client_id: body.clientId,
        owner_id: body.ownerId || null,
        created_by: user.id,
        title: body.title.trim(),
        content_type: body.contentType?.trim() || null,
        platform: body.platform.trim(),
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
      })
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Failed to create content record:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, record }, { status: 201 })
  } catch (error) {
    console.error("[v0] Failed to create content record:", error)
    return NextResponse.json({ error: "Failed to create content record" }, { status: 500 })
  }
}
