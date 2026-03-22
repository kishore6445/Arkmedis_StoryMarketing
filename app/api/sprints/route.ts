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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    let query = supabase
      .from('sprints')
      .select(`
        *,
        client_id,
        clients (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data: sprints, error } = await query

    if (error) {
      console.error("[v0] Error fetching sprints:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch tasks for each sprint
    const sprintsWithTasks = await Promise.all(
      (sprints || []).map(async (sprint) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id,
            task_id,
            title,
            status,
            promised_date,
            promised_time
          `)
          .eq('sprint_id', sprint.id)
          .order('created_at', { ascending: false })

        return {
          ...sprint,
          tasks: tasks || [],
        }
      })
    )

    return NextResponse.json({ sprints: sprintsWithTasks || [] })
  } catch (error: any) {
    console.error("[v0] Error in sprints GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()

    const clientId = body.clientId || body.client_id
    const name = body.name
    const startDate = body.startDate || body.start_date
    const endDate = body.endDate || body.end_date
    const status = body.status || "planning"

    if (!clientId || !name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, name, startDate, endDate" },
        { status: 400 }
      )
    }

    const { data: sprint, error } = await supabase
      .from("sprints")
      .insert({
        client_id: clientId,
        name,
        start_date: startDate,
        end_date: endDate,
        status,
      })
      .select(`
        *,
        client_id,
        clients (
          name
        )
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating sprint:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(sprint)
  } catch (error: any) {
    console.error("[v0] Error in sprints POST:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
