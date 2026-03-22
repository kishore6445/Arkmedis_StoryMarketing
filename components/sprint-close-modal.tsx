"use client"

import { useState } from "react"
import { X, Archive, ArrowRight, AlertCircle } from "lucide-react"

interface Task {
  id: string
  title: string
  status: "todo" | "in-progress" | "in_progress" | "in-review" | "in_review" | "done"
}

interface Sprint {
  id: string
  name: string
}

interface SprintCloseModalProps {
  isOpen: boolean
  onClose: () => void
  sprint: Sprint | null
  tasks: Task[]
  sprints: Sprint[] // For migration options
  onSprintClosed: () => void
}

export function SprintCloseModal({
  isOpen,
  onClose,
  sprint,
  tasks,
  sprints,
  onSprintClosed,
}: SprintCloseModalProps) {
  const [selectedDestination, setSelectedDestination] = useState<"new-sprint" | "backlog">("backlog")
  const [isClosing, setIsClosing] = useState(false)
  const [newSprintName, setNewSprintName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const isInProgress = (status: Task["status"]) => status === "in-progress" || status === "in_progress"
  const isInReview = (status: Task["status"]) => status === "in-review" || status === "in_review"

  // Count tasks by status
  const tasksByStatus = {
    done: tasks.filter((t) => t.status === "done"),
    inProgress: tasks.filter((t) => isInProgress(t.status)),
    inReview: tasks.filter((t) => isInReview(t.status)),
    todo: tasks.filter((t) => t.status === "todo"),
  }

  const totalNeedsMigration = tasksByStatus.todo.length + tasksByStatus.inProgress.length + tasksByStatus.inReview.length

  const handleCloseSprint = async () => {
    console.log("[v0] ════════════════════════════════════════════════")
    console.log("[v0] SPRINT CLOSE WORKFLOW STARTED")
    console.log("[v0] ════════════════════════════════════════════════")
    console.log("[v0] Sprint Details:")
    console.log("[v0]   - Sprint ID: ", sprint?.id)
    console.log("[v0]   - Sprint Name: ", sprint?.name)
    console.log("[v0]")
    console.log("[v0] Task Summary:")
    console.log("[v0]   - Done tasks (to ARCHIVE): ", tasksByStatus.done.length)
    console.log("[v0]   - In Progress tasks (to MIGRATE): ", tasksByStatus.inProgress.length)
    console.log("[v0]   - In Review tasks (to MIGRATE): ", tasksByStatus.inReview.length)
    console.log("[v0]   - Total tasks to migrate: ", totalNeedsMigration)
    console.log("[v0]")
    console.log("[v0] User Selection:")
    console.log("[v0]   - Destination: ", selectedDestination)
    if (selectedDestination === "new-sprint") {
      console.log("[v0]   - New Sprint Name: ", newSprintName)
    }

    if (!sprint) {
      console.error("[v0] ERROR: No sprint selected")
      return
    }
    if (selectedDestination === "new-sprint" && !newSprintName.trim()) {
      setError("Please enter a name for the new sprint")
      return
    }

    setError(null)
    setIsClosing(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const payload = {
        sprintId: sprint.id,
        destination: selectedDestination,
        newSprintName: selectedDestination === "new-sprint" ? newSprintName : null,
        tasksToMigrate: [
          ...tasksByStatus.todo.map((t) => t.id),
          ...tasksByStatus.inProgress.map((t) => t.id),
          ...tasksByStatus.inReview.map((t) => t.id),
        ],
      }
      
      console.log("[v0]")
      console.log("[v0] SENDING REQUEST to /api/sprints/close")
      console.log("[v0] Payload:", payload)
      
      const response = await fetch("/api/sprints/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("[v0]")
      console.log("[v0] API RESPONSE RECEIVED")
      console.log("[v0] Status Code: ", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Response Data: ", data)
        console.log("[v0]")
        console.log("[v0] ✅ WORKFLOW SUCCESSFUL")
        console.log("[v0] Sprint Status: 'completed'")
        console.log("[v0] Done tasks: ARCHIVED with timestamp")
        if (selectedDestination === "backlog") {
          console.log("[v0] Pending tasks: MOVED TO BACKLOG (sprint_id = null)")
        } else {
          console.log("[v0] Pending tasks: MOVED TO NEW SPRINT")
          console.log("[v0] New Sprint ID: ", data.newSprintId)
        }
        console.log("[v0] ════════════════════════════════════════════════")
        onSprintClosed()
        onClose()
      } else {
        const data = await response.json()
        console.error("[v0] ❌ API ERROR")
        console.error("[v0] Error Response: ", data)
        console.log("[v0] ════════════════════════════════════════════════")
        setError(data.error || "Failed to close sprint")
      }
    } catch (error) {
      console.error("[v0] ❌ NETWORK ERROR")
      console.error("[v0] Error: ", error)
      console.log("[v0] ════════════════════════════════════════════════")
      setError("Error closing sprint. Please try again.")
    } finally {
      setIsClosing(false)
    }
  }

  if (!isOpen || !sprint) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#E5E5E7] flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-[#1D1D1F]">Close Sprint: {sprint.name}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#F5F5F7] rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-[#86868B]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* Task Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">Task Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Done Tasks */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">To Archive</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{tasksByStatus.done.length}</p>
                <p className="text-xs text-green-700 mt-1">Done items</p>
              </div>

              {/* Items to Migrate */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">To Migrate</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{totalNeedsMigration}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {tasksByStatus.todo.length} todo, {tasksByStatus.inProgress.length} in progress, {tasksByStatus.inReview.length} in review
                </p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          {totalNeedsMigration > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#1D1D1F] mb-3">Tasks to Migrate</h4>
              <div className="bg-[#F5F5F7] rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {tasksByStatus.todo.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                      Todo
                    </span>
                    <span className="text-[#1D1D1F]">{task.title}</span>
                  </div>
                ))}
                {tasksByStatus.inProgress.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                      In Progress
                    </span>
                    <span className="text-[#1D1D1F]">{task.title}</span>
                  </div>
                ))}
                {tasksByStatus.inReview.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      In Review
                    </span>
                    <span className="text-[#1D1D1F]">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Migration Destination */}
          {totalNeedsMigration > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#1D1D1F] mb-3">Move to...</h4>
              <div className="space-y-3">
                {/* New Sprint Option */}
                <label className="flex items-start gap-3 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="destination"
                    value="new-sprint"
                    checked={selectedDestination === "new-sprint"}
                    onChange={() => {
                      setSelectedDestination("new-sprint")
                      setError(null)
                    }}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1D1D1F]">Create New Sprint</p>
                    <p className="text-xs text-[#86868B]">Create a new sprint and move tasks there</p>
                  </div>
                </label>

                {/* New Sprint Name Input */}
                {selectedDestination === "new-sprint" && (
                  <div className="ml-7 mb-3">
                    <input
                      type="text"
                      value={newSprintName}
                      onChange={(e) => setNewSprintName(e.target.value)}
                      placeholder="Sprint name (e.g., Sprint 2 - Next Week)"
                      className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                  </div>
                )}

                {/* Backlog Option */}
                <label className="flex items-start gap-3 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="destination"
                    value="backlog"
                    checked={selectedDestination === "backlog"}
                    onChange={() => {
                      setSelectedDestination("backlog")
                      setError(null)
                    }}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1D1D1F]">Move to Backlog</p>
                    <p className="text-xs text-[#86868B]">Keep tasks in backlog for later planning</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">{tasksByStatus.done.length} tasks</span> will be archived.
              {totalNeedsMigration > 0 && (
                <>
                  {" "}
                  <span className="font-semibold">{totalNeedsMigration} tasks</span> will be moved to{" "}
                  <span className="font-semibold">
                    {selectedDestination === "new-sprint" ? "a new sprint" : "the backlog"}
                  </span>
                  .
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E5E5E7] flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isClosing}
            className="flex-1 px-4 py-2 bg-white border border-[#E5E5E7] text-[#1D1D1F] rounded-lg font-medium hover:bg-[#F5F5F7] disabled:opacity-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleCloseSprint}
            disabled={isClosing || (totalNeedsMigration > 0 && selectedDestination === "new-sprint" && !newSprintName.trim())}
            className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isClosing ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Closing...
              </>
            ) : (
              "Close Sprint"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
