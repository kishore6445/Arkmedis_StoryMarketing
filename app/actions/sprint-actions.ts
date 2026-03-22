"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

interface CloseSprintPayload {
  sprintId: string
  destination: "new-sprint" | "backlog"
  newSprintName: string | null
  tasksToMigrate: string[]
}

export async function closeSprintAction(payload: CloseSprintPayload) {
  try {
    const { sprintId, destination, newSprintName, tasksToMigrate } = payload

    // 1. Get the current sprint to verify it exists
    const { data: sprint, error: sprintError } = await supabase
      .from("sprints")
      .select("*")
      .eq("id", sprintId)
      .single()

    if (sprintError || !sprint) {
      return { success: false, error: "Sprint not found" }
    }

    // 2. Archive all done tasks (soft delete or mark as archived)
    const { error: archiveError } = await supabase
      .from("tasks")
      .update({ status: "done", archived: true, archived_at: new Date().toISOString() })
      .eq("sprint_id", sprintId)
      .eq("status", "done")

    if (archiveError) {
      console.error("[v0] Error archiving done tasks:", archiveError)
      return { success: false, error: "Failed to archive done tasks" }
    }

    // 3. Handle migration of in-progress and in-review tasks
    let destinationSprintId: string | null = null

    if (destination === "new-sprint" && newSprintName) {
      // Create new sprint
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
        console.error("[v0] Error creating new sprint:", createError)
        return { success: false, error: "Failed to create new sprint" }
      }

      destinationSprintId = newSprint?.id
    }
    // If destination is "backlog", destinationSprintId stays null

    // 4. Migrate tasks
    if (tasksToMigrate.length > 0) {
      const { error: migrateError } = await supabase
        .from("tasks")
        .update({ sprint_id: destinationSprintId })
        .in("id", tasksToMigrate)

      if (migrateError) {
        console.error("[v0] Error migrating tasks:", migrateError)
        return { success: false, error: "Failed to migrate tasks" }
      }
    }

    // 5. Mark sprint as completed
    const { error: closeError } = await supabase
      .from("sprints")
      .update({ status: "completed", closed_at: new Date().toISOString() })
      .eq("id", sprintId)

    if (closeError) {
      console.error("[v0] Error closing sprint:", closeError)
      return { success: false, error: "Failed to close sprint" }
    }

    return {
      success: true,
      message: `Sprint closed. ${tasksToMigrate.length} tasks migrated, done tasks archived.`,
      newSprintId: destinationSprintId,
    }
  } catch (error) {
    console.error("[v0] Error in closeSprintAction:", error)
    return { success: false, error: "Internal server error" }
  }
}
