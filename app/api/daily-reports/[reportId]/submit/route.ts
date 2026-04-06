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

    const supabase = getSupabaseAdminClient()

    // Verify report ownership
    const { data: report } = await supabase
      .from("daily_reports")
      .select("*")
      .eq("id", reportId)
      .eq("user_id", authResult.user.id)
      .maybeSingle()

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Check if already submitted
    if (report.status === "submitted") {
      return NextResponse.json({ error: "Report already submitted" }, { status: 400 })
    }

    // Check total hours
    if (report.total_hours === 0) {
      return NextResponse.json({ error: "Add at least one time entry" }, { status: 400 })
    }

    // Update report status
    const { data: updatedReport, error } = await supabase
      .from("daily_reports")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error submitting report:", error)
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
    }

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("[v0] Error in submit report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
