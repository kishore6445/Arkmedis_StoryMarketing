import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ reportId: string; entryId: string }> }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId, entryId } = await params
    const body = await request.json()
    const { client_id, sprint_id, task_id, hours, description } = body

    // Validation
    if (!client_id || !sprint_id || !task_id || !hours || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (hours < 0.25 || hours > 10) {
      return NextResponse.json({ error: "Hours must be between 0.25 and 10" }, { status: 400 })
    }

    if (description.trim().length < 10) {
      return NextResponse.json({ error: "Description must be at least 10 characters" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Verify report ownership and status
    const { data: report } = await supabase
      .from("daily_reports")
      .select("status")
      .eq("id", reportId)
      .eq("user_id", authResult.user.id)
      .maybeSingle()

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.status === "submitted") {
      return NextResponse.json({ error: "Cannot edit submitted reports" }, { status: 400 })
    }

    // Update time entry
    const { data: entry, error } = await supabase
      .from("time_entries")
      .update({
        client_id,
        sprint_id,
        task_id,
        hours,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .eq("report_id", reportId)
      .select(
        `
        *,
        clients(name),
        sprints(name),
        tasks(title)
      `
      )
      .single()

    if (error) {
      console.error("[v0] Error updating time entry:", error)
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 })
    }

    // Update total hours
    const { data: entries } = await supabase
      .from("time_entries")
      .select("hours")
      .eq("report_id", reportId)

    const totalHours = (entries || []).reduce((sum, e) => sum + (e.hours || 0), 0)

    await supabase
      .from("daily_reports")
      .update({ total_hours: totalHours })
      .eq("id", reportId)

    return NextResponse.json(entry)
  } catch (error) {
    console.error("[v0] Error in PUT time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ reportId: string; entryId: string }> }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId, entryId } = await params

    const supabase = getSupabaseAdminClient()

    // Verify report ownership and status
    const { data: report } = await supabase
      .from("daily_reports")
      .select("status")
      .eq("id", reportId)
      .eq("user_id", authResult.user.id)
      .maybeSingle()

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.status === "submitted") {
      return NextResponse.json({ error: "Cannot edit submitted reports" }, { status: 400 })
    }

    // Delete time entry
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", entryId)
      .eq("report_id", reportId)

    if (error) {
      console.error("[v0] Error deleting time entry:", error)
      return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
    }

    // Update total hours
    const { data: entries } = await supabase
      .from("time_entries")
      .select("hours")
      .eq("report_id", reportId)

    const totalHours = (entries || []).reduce((sum, e) => sum + (e.hours || 0), 0)

    await supabase
      .from("daily_reports")
      .update({ total_hours: totalHours })
      .eq("id", reportId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
