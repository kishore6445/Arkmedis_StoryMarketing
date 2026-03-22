import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromToken } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch all tasks that are not assigned to any sprint (sprint_id is null)
    // and are not done or archived
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_id,
        title,
        status,
        promised_date,
        promised_time,
        client_id,
        clients (
          name
        )
      `)
      .is("sprint_id", null)
      .in("status", ["todo", "in_progress", "in_review"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching backlog tasks:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error: any) {
    console.error("[v0] Error in backlog GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
