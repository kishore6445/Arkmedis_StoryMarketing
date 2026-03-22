"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MoreVertical, Copy, Edit, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskWorkspaceOverview } from "@/components/task-workspace-overview"
import { TaskWorkspaceDiscussion } from "@/components/task-workspace-discussion"
import { TaskWorkspaceActivity } from "@/components/task-workspace-activity"
import { TaskWorkspaceFiles } from "@/components/task-workspace-files"
import { TaskWorkspaceSidebar } from "@/components/task-workspace-sidebar"
import { TaskModalWithPKR, TaskFormData } from "@/components/task-modal-with-pkr"

type TabType = "overview" | "discussion" | "activity" | "files"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in_progress" | "in_review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assigned_to?: string
  assignee?: { id: string; name: string; email: string }
  client_id?: string
  client?: { id: string; name: string }
  sprint?: { id: string; name: string }
  phase?: string
  due_date?: string
  due_time?: string
  promised_date?: string
  promised_time?: string
  project?: string
  createdBy?: { id: string; name: string }
  created_at?: string
  updated_at?: string
}

export default function TaskWorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  
  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_review":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "todo":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low":
      default:
        return "bg-green-100 text-green-800 border-green-300"
    }
  }
  
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [task, setTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [statusBlocked, setStatusBlocked] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
               //  debugger;

        setIsLoading(true)
        const token = localStorage.getItem("sessionToken")
        console.log("[v0] Fetching task with ID:", taskId, "Token:", token ? "present" : "missing")
        
        if (!token) {
          console.error("[v0] No session token found in localStorage")
          setTask(null)
          return
        }

        console.log("[v0] Sending request to API for task:", taskId);
        
        const response = await fetch(`/api/tasks/${taskId}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
        console.log("[v0] Task API response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          // API returns { task: {...} } - extract the task object
          const taskData = data.task || data
          console.log("[v0] Task data received:", taskData)
          setTask(taskData)
        } else if (response.status === 401 || response.status === 403) {
          console.error("[v0] Authentication failed - session may have expired")
          localStorage.removeItem("sessionToken")
          setTask(null)
        } else {
          const errorData = await response.json()
          console.error("[v0] Task fetch failed with status:", response.status, "Error:", errorData)
          setTask(null)
        }
      } catch (error) {
        console.error("[v0] Error fetching task:", error)
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

  if (!taskId || taskId === "undefined") {
  console.log("[v0] Invalid taskId:", taskId)
  return
}

fetchTask()
  }, [taskId])

  const handleStatusChange = async (newStatus: "todo" | "in_progress" | "in_review" | "done") => {
    if (!task) return
    
    // Block moving to "in_review" if subtasks are incomplete
    if (newStatus === "in_review" && statusBlocked) {
      alert("Cannot move to Review. Please complete all subtasks first.")
      return
    }
    
    try {
      setIsChangingStatus(true)
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setTask({ ...task, status: newStatus })
        setShowStatusMenu(false)
      }
    } catch (error) {
      console.error("[v0] Error updating task status:", error)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const handleAssigneeChange = async (assigneeId: string | null) => {
    if (!task) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_to: assigneeId })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
        console.log("[v0] Task assignee updated:", updatedTask)
      }
    } catch (error) {
      console.error("[v0] Error updating assignee:", error)
    }
  }

  const handleEditTask = async (formData: TaskFormData) => {
    if (!task) return

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          phase: formData.phase,
          due_date: formData.dueDate,
          due_time: formData.dueTime,
          promised_date: formData.promisedDate,
          promised_time: formData.promisedTime
        })
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
        setShowEditModal(false)
        console.log("[v0] Task updated successfully:", updatedTask)
      }
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      alert("Failed to update task. Please try again.")
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/tasks/${taskId}`
    navigator.clipboard.writeText(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
            <p className="text-gray-600 mb-2">The task you're looking for could not be loaded.</p>
            <p className="text-sm text-gray-500">This might be due to:</p>
            <ul className="text-sm text-gray-500 text-left mt-3 space-y-1 ml-4">
              <li>• The task was deleted or archived</li>
              <li>• You don't have access to this task</li>
              <li>• Your session has expired - try logging in again</li>
            </ul>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const statusOptions = [
    { value: "todo" as const, label: "To Do", icon: Circle },
    { value: "in_progress" as const, label: "In Progress", icon: Circle },
    { value: "in_review" as const, label: "In Review", icon: Circle },
    { value: "done" as const, label: "Done", icon: CheckCircle2 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Board
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy link"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Task Header with Colored Border */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Left Colored Border / Status Indicator */}
          <div className={cn(
            "absolute left-0 top-0 h-2 w-full",
            task.status === "done" ? "bg-green-500" :
            task.status === "in_review" ? "bg-blue-500" :
            task.status === "in_progress" ? "bg-yellow-500" :
            "bg-gray-400"
          )} />

          {/* Task ID */}
          <p className="text-xs font-mono text-gray-500 mb-2 tracking-wide">
            {task.id}
          </p>

          {/* Task Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 max-w-3xl text-balance">
            {task.title}
          </h1>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {task.client_id && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                {task.client_id}
              </span>
            )}
            {task.project && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                {task.project}
              </span>
            )}
            {task.priority && (
              <span className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium",
                task.priority === "high" ? "bg-red-100 text-red-700" :
                task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              )}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            )}
            {task.phase && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                {task.phase}
              </span>
            )}
            {task.due_date && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                PKR: {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {task.status === "todo" && (
              <button
                onClick={() => handleStatusChange("in_progress")}
                disabled={isChangingStatus}
                className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                Start Task
              </button>
            )}
            {task.status === "in_progress" && (
              <button
                onClick={() => handleStatusChange("in_review")}
                disabled={isChangingStatus}
                className="px-5 py-2.5 bg-amber-600 text-white font-semibold text-sm rounded-lg hover:bg-amber-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                Move to Review
              </button>
            )}
            {task.status === "in_review" && (
              <button
                onClick={() => handleStatusChange("done")}
                disabled={isChangingStatus || statusBlocked}
                className="px-5 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
              >
                Mark Done
              </button>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 bg-gray-200 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-300 active:scale-95 transition-all"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided"}
              </p>
            </div>

            {/* Tabs Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 flex">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "discussion", label: "Discussion" },
                  { id: "activity", label: "Activity" },
                  { id: "files", label: "Files" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={cn(
                      "px-6 py-4 font-semibold text-sm transition-colors border-b-2 -mb-px",
                      activeTab === tab.id
                        ? "text-blue-600 border-b-blue-600 bg-blue-50"
                        : "text-gray-600 border-b-transparent hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && <TaskWorkspaceOverview task={task} onStatusBlocked={setStatusBlocked} />}
                {activeTab === "discussion" && <TaskWorkspaceDiscussion taskId={taskId} />}
                {activeTab === "activity" && <TaskWorkspaceActivity taskId={taskId} />}
                {activeTab === "files" && <TaskWorkspaceFiles taskId={taskId} />}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-1">
            <TaskWorkspaceSidebar 
              task={task} 
              onAssigneeChange={handleAssigneeChange}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {task && (
        <TaskModalWithPKR
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditTask}
          task={{
            title: task.title,
            description: task.description,
            assigneeIds: task.assigned_to ? [task.assigned_to] : [],
            priority: task.priority,
            dueDate: task.due_date,
            dueTime: task.due_time,
            promisedDate: task.promised_date,
            promisedTime: task.promised_time,
            phase: task.phase
          }}
        />
      )}
    </div>
  )
}
