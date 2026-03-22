import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all sprints
    const { data: sprints, error } = await supabase
      .from("sprints")
      .select("id, name, status, start_date, end_date, client_id")
      .order("start_date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching sprints:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Fetched all sprints:", { count: sprints?.length || 0 })

    return NextResponse.json({
      sprints: sprints?.map((s: any) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        start_date: s.start_date,
        end_date: s.end_date,
        clientId: s.client_id,
      })) || [],
    })
  } catch (error) {
    console.error("[v0] Error in /api/all-sprints:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
