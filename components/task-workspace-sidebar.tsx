"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, User, Tag, Flag, FileText, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assigned_to?: string
  assignee?: { id: string; name: string; email: string }
  client?: { id: string; name: string }
  sprint?: { id: string; name: string }
  phase?: string
  dueDate?: string
  promisedDate?: string
  due_date?: string
  promised_date?: string
  createdBy?: { id: string; name: string }
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

interface TaskWorkspaceSidebarProps {
  task: Task
  onAssigneeChange?: (assigneeId: string | null) => void
  onStatusChange?: (status: "todo" | "in_progress" | "in_review" | "done") => void
}

export function TaskWorkspaceSidebar({ task, onAssigneeChange, onStatusChange }: TaskWorkspaceSidebarProps) {
  const router = useRouter()
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Fetch team members from the database
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const token = localStorage.getItem("sessionToken")
        const response = await fetch("/api/users", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          // API returns { users: [...] } format
          const users = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []
          setTeamMembers(users)
          console.log("[v0] Team members loaded:", users)
        }
      } catch (error) {
        console.error("[v0] Error loading team members:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    loadTeamMembers()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-900 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-900 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-900 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-900 border-green-300"
      default:
        return "bg-gray-100 text-gray-900 border-gray-300"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-900"
      case "in_review":
        return "bg-purple-100 text-purple-900"
      case "in_progress":
        return "bg-blue-100 text-blue-900"
      case "todo":
        return "bg-gray-100 text-gray-900"
      default:
        return "bg-gray-100 text-gray-900"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="sticky top-20 space-y-3">
      {/* Assignee Card - Prominent */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Assignee
        </p>
        <div className="relative">
          <button
            onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              {task.assignee ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{task.assignee.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 truncate">{task.assignee.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 font-medium">Unassigned</p>
              )}
            </div>
            <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 transition-transform", showAssigneeMenu && "rotate-180")} />
          </button>

          {/* Assignee Dropdown Menu */}
          {showAssigneeMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onAssigneeChange?.(null)
                  setShowAssigneeMenu(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg font-medium text-gray-700"
              >
                Unassigned
              </button>
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => {
                    onAssigneeChange?.(member.id)
                    setShowAssigneeMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 last:rounded-b-lg"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {member.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Status</p>
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={cn(
              "w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-center border transition-all hover:shadow-md",
              getStatusBadgeColor(task.status)
            )}
          >
            {task.status === "in_progress"
              ? "In Progress"
              : task.status === "in_review"
              ? "In Review"
              : task.status === "todo"
              ? "To Do"
              : "Done"}
          </button>

          {/* Status Dropdown Menu */}
          {showStatusMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden">
              {["todo", "in_progress", "in_review", "done"].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (task.status !== status) {
                      onStatusChange?.(status as any)
                    }
                    setShowStatusMenu(false)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm transition-colors border-b last:border-b-0",
                    task.status === status ? "bg-blue-50 font-semibold text-blue-900" : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <span className={cn("inline-block px-2.5 py-1 rounded-md text-xs font-semibold", getStatusBadgeColor(status))}>
                    {status === "in_progress"
                      ? "In Progress"
                      : status === "in_review"
                      ? "In Review"
                      : status === "todo"
                      ? "To Do"
                      : "Done"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Priority Card */}
      {task.priority && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Priority
          </p>
          <span className={cn("inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border", getPriorityColor(task.priority))}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      )}

      {/* Phase Card */}
      {task.phase && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Phase
          </p>
          <p className="text-sm font-semibold text-gray-900 capitalize">{task.phase}</p>
        </div>
      )}

      {/* Internal PKR Date Card */}
      {task.due_date && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Internal PKR Date
          </p>
          <p className="text-sm font-bold text-blue-900">{formatDate(task.due_date)}</p>
          <p className="text-xs text-blue-600 mt-1.5 font-medium">Team execution deadline</p>
        </div>
      )}

      {/* Client Promise Date Card */}
      {task.promised_date && (
        <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Client Promise Date
          </p>
          <p className="text-sm font-bold text-green-900">{formatDate(task.promised_date)}</p>
          <p className="text-xs text-green-600 mt-1.5 font-medium">Committed delivery date</p>
        </div>
      )}

      {/* Created At */}
      {task.createdAt && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Created At</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(task.createdAt)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(task.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      )}

      {/* Last Updated */}
      {task.updatedAt && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Last Updated</p>
          <p className="text-sm text-gray-900">
            {new Date(task.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(task.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      )}
    </div>
  )
}
