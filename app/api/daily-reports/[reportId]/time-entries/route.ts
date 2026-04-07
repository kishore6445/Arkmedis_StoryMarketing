import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reportId } = await params
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

    // Verify report ownership
    const { data: report } = await supabase
      .from("daily_reports")
      .select("id")
      .eq("id", reportId)
      .eq("user_id", authResult.user.id)
      .maybeSingle()

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Check report status - can't add entries to submitted reports
    const { data: reportStatus } = await supabase
      .from("daily_reports")
      .select("status")
      .eq("id", reportId)
      .single()

    if (reportStatus?.status === "submitted") {
      return NextResponse.json({ error: "Cannot edit submitted reports" }, { status: 400 })
    }

    // Create time entry
    const { data: entry, error } = await supabase
      .from("time_entries")
      .insert({
        report_id: reportId,
        client_id,
        sprint_id,
        task_id,
        hours,
        description,
        created_at: new Date().toISOString(),
      })
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
      console.error("[v0] Error creating time entry:", error)
      return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
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
    console.error("[v0] Error in POST time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
