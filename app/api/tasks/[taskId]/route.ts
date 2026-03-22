import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch a single task
export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    debugger;
    console.log("[v0] Received request to fetch task with ID:", params.taskId);
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.replace("Bearer ", "")
    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    // const { taskId } = await params
    // const taskId = params.taskId
    const resolvedParams = await params
    const taskId = resolvedParams.taskId
   //debugger;
    
    console.log("[v0] Fetching task here is the black sheep:", taskId)

    // Query the task directly without trying to join non-existent relationships
    const { data: task, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_id,
        title,
        description,
        status,
        due_date,
        due_time,
        promised_date,
        promised_time,
        assigned_to,
        client_id,
        section_id,
        priority,
        phase,
        sprint_id,
        created_at,
        updated_at
      `)
      .eq("id", taskId)
      .maybeSingle()

    console.log("[v0] Task fetch result:", { task, error, taskId })

    if (error || !task) {
      console.log("[v0] Task not found error:", error)
      return NextResponse.json({ error: "Task not found", details: error?.message || "No task exists for this id" }, { status: 404 })
    }

    // Enrich task with assignee information
    let enrichedTask = task
    if (task.assigned_to) {
      const { data: assignee } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("id", task.assigned_to)
        .single()
      
      enrichedTask = {
        ...task,
        assignee: assignee || null
      }
    }

    return NextResponse.json(enrichedTask)
  } catch (error) {
    console.error("[v0] Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

// PATCH - Update a task
export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.replace("Bearer ", "")
    const session = await validateSession(token)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = getSupabaseAdminClient()
    //const taskId = params.taskId
     const resolvedParams = await params
    const taskId = resolvedParams.taskId

    // Get current task to compare changes
    const { data: currentTask } = await supabase
      .from("tasks")
      .select("status, priority, phase")
      .eq("id", taskId)
      .single()

    const { data: task, error } = await supabase
      .from("tasks")
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error || !task) {
      return NextResponse.json({ error: "Failed to update task", details: error?.message }, { status: 400 })
    }

    // Log activity for significant changes
    if (currentTask) {
      if (currentTask.status !== body.status && body.status) {
        await supabase.from("task_activity").insert({
          task_id: taskId,
          created_by: session.userId,
          action_type: "status_changed",
          old_value: currentTask.status,
          new_value: body.status,
          description: `Status changed from ${currentTask.status} to ${body.status}`
        })
      }
      if (currentTask.priority !== body.priority && body.priority) {
        await supabase.from("task_activity").insert({
          task_id: taskId,
          created_by: session.userId,
          action_type: "priority_changed",
          old_value: currentTask.priority,
          new_value: body.priority,
          description: `Priority changed from ${currentTask.priority} to ${body.priority}`
        })
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[v0] Error updating task:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
