import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if report already exists for this date
    const { data: existingReport } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", authResult.user.id)
      .eq("report_date", date)
      .maybeSingle()

    if (existingReport) {
      return NextResponse.json(existingReport)
    }

    // Create new report
    const { data: newReport, error } = await supabase
      .from("daily_reports")
      .insert({
        user_id: authResult.user.id,
        report_date: date,
        status: "draft",
        total_hours: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating daily report:", error)
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
    }

    return NextResponse.json(newReport)
  } catch (error) {
    console.error("[v0] Error in POST /api/daily-reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const date = url.searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: report, error } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", authResult.user.id)
      .eq("report_date", date)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error fetching report:", error)
      return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
    }

    if (!report) {
      // Create a new draft report
      const { data: newReport, error: createError } = await supabase
        .from("daily_reports")
        .insert({
          user_id: authResult.user.id,
          report_date: date,
          status: "draft",
          total_hours: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating report:", createError)
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
      }

      return NextResponse.json({ report: newReport, entries: [] })
    }

    // Fetch all time entries for this report
    const { data: entries, error: entriesError } = await supabase
      .from("time_entries")
      .select(
        `
        *,
        clients(name),
        sprints(name),
        tasks(title)
      `
      )
      .eq("report_id", report.id)
      .order("created_at", { ascending: false })

    if (entriesError) {
      console.error("[v0] Error fetching entries:", entriesError)
      return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 })
    }

    return NextResponse.json({ report, entries: entries || [] })
  } catch (error) {
    console.error("[v0] Error in GET /api/daily-reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
