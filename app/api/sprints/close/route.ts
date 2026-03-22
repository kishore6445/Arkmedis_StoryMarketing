import { NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/db"

interface CloseSprintRequest {
  sprintId: string
  destination: "new-sprint" | "backlog"
  newSprintName: string | null
  tasksToMigrate: string[]
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload: CloseSprintRequest = await request.json()
    const { sprintId, destination, newSprintName, tasksToMigrate } = payload

    if (!sprintId) {
      return NextResponse.json({ error: "Sprint ID required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Get the current sprint
    const { data: sprint, error: sprintError } = await supabase
      .from("sprints")
      .select("*")
      .eq("id", sprintId)
      .single()

    if (sprintError || !sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Archive completed tasks in the sprint.
    await supabase
      .from("tasks")
      .update({ status: "done", archived: true, archived_at: new Date().toISOString() })
      .eq("sprint_id", sprintId)
      .eq("status", "done")

    // Determine pending tasks server-side so closing a sprint works even if the
    // UI sends mismatched status labels or an empty tasksToMigrate array.
    const { data: pendingTasks, error: pendingTasksError } = await supabase
      .from("tasks")
      .select("id")
      .eq("sprint_id", sprintId)
      .in("status", ["todo", "in_progress", "in_review"])

    if (pendingTasksError) {
      console.error("[v0] Error fetching pending sprint tasks:", pendingTasksError)
      return NextResponse.json({ error: "Failed to fetch pending sprint tasks" }, { status: 500 })
    }

    const pendingTaskIds = (pendingTasks || []).map((task) => task.id)

    let destinationSprintId: string | null = null

    // Create new sprint if needed
    if (destination === "new-sprint" && newSprintName) {
      const { data: newSprint, error: createError } = await supabase
        .from("sprints")
        .insert({
          name: newSprintName,
          client_id: sprint.client_id,
          status: "planning",
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
        .select("id")
        .single()

      if (createError) {
        return NextResponse.json({ error: "Failed to create new sprint" }, { status: 500 })
      }

      destinationSprintId = newSprint?.id || null
    }

    // Migrate all pending tasks.
    if (pendingTaskIds.length > 0) {
      if (destination === "backlog") {
        // Move to backlog (set sprint_id to null)
        await supabase
          .from("tasks")
          .update({ sprint_id: null, status: "todo" })
          .in("id", pendingTaskIds)
      } else {
        // Move to new sprint
        await supabase
          .from("tasks")
          .update({ sprint_id: destinationSprintId })
          .in("id", pendingTaskIds)
      }
    }

    // Mark sprint as completed
    await supabase
      .from("sprints")
      .update({ status: "completed", closed_at: new Date().toISOString() })
      .eq("id", sprintId)

    return NextResponse.json({
      success: true,
      message: `Sprint closed. ${pendingTaskIds.length} tasks migrated.`,
      newSprintId: destinationSprintId,
    })
  } catch (error: any) {
    console.error("[v0] Error closing sprint:", error)
    return NextResponse.json({ error: error.message || "Failed to close sprint" }, { status: 500 })
  }
}
