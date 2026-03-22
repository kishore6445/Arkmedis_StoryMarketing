"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Task } from "./my-tasks-today"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, ChevronDown, Calendar } from "lucide-react"

interface KanbanColumn {
  id: string
  title: string
  tasks: Task[]
  color: string
  icon: React.ReactNode
  bgColor: string
  accentColor: string
}

interface TaskKanbanProps {
  tasks: Task[]
  onTaskStatusChange?: (taskId: string, newStatus: string) => Promise<void>
  isLoading?: boolean
  onTaskUpdate?: (taskId: string) => void
  onEditTask?: (task: Task) => void
  selectedTaskIds?: Set<string>
  onToggleTaskSelection?: (taskId: string) => void
  showCheckboxes?: boolean
}

const CARDS_PER_COLUMN_LIMIT = 6

export function TaskKanban({ tasks, onTaskStatusChange, isLoading, onTaskUpdate, onEditTask, selectedTaskIds, onToggleTaskSelection, showCheckboxes }: TaskKanbanProps) {
  const router = useRouter()
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [sourceColumn, setSourceColumn] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [expandedDoneColumn, setExpandedDoneColumn] = useState(true)
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({})

  // Get border color based on due date only
  const getBorderColor = (dueDate?: string): string => {
    if (!dueDate) {
      return "#86868B" // Gray for tasks with no due date
    }

    try {
      const due = new Date(dueDate)
      const today = new Date()
      
      // Validate date
      if (isNaN(due.getTime())) {
        return "#86868B"
      }
      
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        return "#FF3B30" // Red for overdue
      } else if (diffDays === 0) {
        return "#FF9500" // Orange for due today
      } else if (diffDays === 1) {
        return "#007AFF" // Blue for due tomorrow
      } else {
        return "#86868B" // Gray for upcoming (more than 1 day away)
      }
    } catch {
      return "#86868B"
    }
  }

  // Check if task is overdue
  const isOverdue = (dueDate?: string): boolean => {
    if (!dueDate) return false
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)
      return due < today
    } catch {
      return false
    }
  }

  // Check if task is due today for background highlight
  const isDueToday = (dueDate?: string): boolean => {
    if (!dueDate) return false
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return false
      const today = new Date()
      return due.toDateString() === today.toDateString()
    } catch {
      return false
    }
  }

  // Get urgency/due-status indicator - separate from priority
  const getUrgencyStatus = (dueDate: string): { color: string; dotBg: string; label: string } | null => {
    if (!dueDate) return null
    
    try {
      const due = new Date(dueDate)
      if (isNaN(due.getTime())) return null
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        return { color: "#FF3B30", dotBg: "#FF3B30", label: "Overdue" }
      } else if (diffDays === 0) {
        return { color: "#FF9500", dotBg: "#FF9500", label: "Due today" }
      } else if (diffDays === 1) {
        return { color: "#FF9500", dotBg: "#FF9500", label: "Due tomorrow" }
      } else {
        return { color: "#86868B", dotBg: "#86868B", label: "Upcoming" }
      }
    } catch {
      return null
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (date.toDateString() === today.toDateString()) {
        return "Today"
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow"
      } else if (date < today) {
        return "Overdue"
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    } catch {
      return null
    }
  }

  // 4-state workflow: Waiting → Working → Review → Done
  const statusMap: Record<string, string> = {
    "todo": "Waiting",
    "pending": "Waiting",
    "in_progress": "Working",
    "in_review": "Review",
    "done": "Done",
  }

  // Active workflow columns (Done shown separately in right panel)
  const columnStatuses = ["todo", "in_progress", "in_review"]

  // Normalize task status for kanban display
  const getNormalizedStatus = (status: string | undefined): string => {
    const normalizedStatus = status || "todo"
    if (normalizedStatus === "pending") return "todo"
    return normalizedStatus
  }

  const columns: KanbanColumn[] = columnStatuses.map((status) => {
    const columnTasks = tasks.filter((t) => getNormalizedStatus(t.status) === status)
    return {
      id: status,
      title: statusMap[status],
      tasks: columnTasks,
      color: {
        "todo": "border-gray-200",
        "in_progress": "border-blue-200",
        "in_review": "border-purple-200",
        "done": "border-green-200",
      }[status],
      bgColor: "bg-white",
      accentColor: {
        "todo": "text-gray-500",
        "in_progress": "text-blue-500",
        "in_review": "text-purple-500",
        "done": "text-green-500",
      }[status],
      icon: {
        "todo": <Circle className="w-4 h-4" />,
        "in_progress": <Circle className="w-4 h-4" />,
        "in_review": <Circle className="w-4 h-4" />,
        "done": <CheckCircle2 className="w-4 h-4" />,
      }[status] || <Circle className="w-4 h-4" />,
    }
  }).filter(col => col.id !== "done") // Remove done from main columns (shown in right panel)

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setSourceColumn(columnId)
    setIsAnimating(true)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (columnId: string) => {
    if (!draggedTask || sourceColumn === columnId) {
      setDraggedTask(null)
      setSourceColumn(null)
      setDragOverColumn(null)
      setIsAnimating(false)
      return
    }

    const statusMapping: Record<string, string> = {
      "todo": "todo",
      "pending": "todo",
      "in_progress": "in_progress",
      "in_review": "in_review",
      "done": "done",
    }
    
    const newStatus = statusMapping[columnId] || columnId

    setIsAnimating(true)
    await onTaskStatusChange?.(draggedTask.id, newStatus)

    setTimeout(() => {
      setDraggedTask(null)
      setSourceColumn(null)
      setDragOverColumn(null)
      setIsAnimating(false)
    }, 300)
  }

  const toggleColumnExpand = (columnId: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-white min-h-screen flex">
      {/* Left side: Active work columns (70%) */}
      <div className="flex-1 overflow-x-auto border-r border-gray-200">
        <div className="flex gap-8 px-8 py-8 w-full" style={{ minWidth: "fit-content" }}>
          {columns.map((column) => {
            const isExpanded = expandedColumns[column.id]
            const displayCount = isExpanded ? column.tasks.length : Math.min(CARDS_PER_COLUMN_LIMIT, column.tasks.length)
            const hasMore = column.tasks.length > CARDS_PER_COLUMN_LIMIT
            const displayTasks = isExpanded ? column.tasks : column.tasks.slice(0, CARDS_PER_COLUMN_LIMIT)
            const tasksToShow = displayTasks

            return (
              <div
                key={column.id}
                className={cn(
                  "flex flex-col rounded-lg border flex-shrink-0 transition-all duration-200 shadow-sm overflow-hidden",
                  "w-96", // Wider columns for more breathing room
                  dragOverColumn === column.id && draggedTask
                    ? "border-blue-400 bg-blue-50 shadow-md ring-1 ring-blue-200"
                    : "border-gray-200 bg-white hover:shadow-md hover:border-gray-300",
                  draggedTask && sourceColumn !== column.id && "opacity-100"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header - Clean and Minimal */}
                <div 
                  className="sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b border-gray-100 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-800">
                      {column.title} ({column.tasks.length})
                    </h3>
                  </div>
                </div>

                {/* Tasks Container - More whitespace */}
                <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-240px)]">
                    {tasksToShow.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                        <p className="text-xs text-gray-500 font-medium">
                          {column.tasks.length === 0 ? "No tasks" : "No tasks to show"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {tasksToShow.map((task) => {
                          const dueDate = formatDate(task.dueDate)
                          const urgencyStatus = getUrgencyStatus(task.dueDate)
                          const borderColor = getBorderColor(task.dueDate)
                          const isToday = isDueToday(task.dueDate)
                          const isTaskOverdue = isOverdue(task.dueDate)
                          const isDone = task.status === "done" || task.completed

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task, column.id)}
                              onClick={() => {
                                if (task.type !== "task") return
                                router.push(`/tasks/${task.id}`)
                              }}
                              style={{
                                borderLeftColor: isDone && isTaskOverdue ? "#FF3B30" : borderColor,
                              }}
                              className={cn(
                                "group relative rounded-lg border border-gray-200 p-4 cursor-move transition-all duration-150",
                                "hover:shadow-md hover:border-gray-300",
                                "active:scale-95",
                                draggedTask?.id === task.id
                                  ? "opacity-50 shadow-lg ring-2 ring-blue-200"
                                  : "",
                                // Minimal color coding
                                isDone ? "bg-white border-green-200" : "",
                                !isDone && isTaskOverdue ? "bg-red-50 border-red-300" : "",
                                !isDone && isToday && !isTaskOverdue ? "bg-orange-50 border-orange-200" : "",
                                !isDone && !isTaskOverdue && !isToday ? "bg-white" : "",
                                "flex flex-col gap-2"
                              )}
                            >
                              {/* Task Number - Small, muted, easily copyable */}
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {task.taskId || task.id.slice(0, 6).toUpperCase()}
                              </div>

                              {/* Task Title - Primary focus */}
                              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                                {task.title}
                              </h4>

                              {/* Meta: Due Date Only (no clutter) */}
                              {dueDate && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  <span 
                                    style={{ color: urgencyStatus?.color || "#86868B" }}
                                    className="font-medium"
                                  >
                                    {dueDate}
                                  </span>
                                  {urgencyStatus && (
                                    <span
                                      style={{ backgroundColor: urgencyStatus.dotBg }}
                                      className="w-2 h-2 rounded-full flex-shrink-0 ml-auto"
                                      title={urgencyStatus.label}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Show More / Show Less toggle - Enhanced visibility */}
                        {hasMore && column.id !== "done" && (
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() => toggleColumnExpand(column.id)}
                              className="text-blue-600 text-sm font-medium hover:underline cursor-pointer transition-colors"
                            >
                              {isExpanded ? "Show less" : `Show more (${column.tasks.length - CARDS_PER_COLUMN_LIMIT})`}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right side: Done wins panel (30%) - Always visible */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            Done ({tasks.filter(t => t.status === "done" || t.completed).length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">Showing recent wins</p>
        </div>

        {/* Done tasks scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {tasks.filter(t => t.status === "done" || t.completed).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">No completed tasks yet</p>
              <p className="text-xs text-gray-400 mt-1">Keep working, you'll get here soon!</p>
            </div>
          ) : (
            <div className="px-4 py-4 space-y-3">
              {tasks
                .filter(t => t.status === "done" || t.completed)
                .sort((a, b) => {
                  // Sort by completion date (newest first) - optional, remove if not needed
                  const aDate = new Date(a.completedAt || a.updatedAt || 0).getTime()
                  const bDate = new Date(b.completedAt || b.updatedAt || 0).getTime()
                  return bDate - aDate
                })
                .slice(0, 20) // Show up to 20 recent completions
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, "done")}
                    onClick={() => {
                      if (task.type !== "task") return
                      router.push(`/tasks/${task.id}`)
                    }}
                    className="group p-3 rounded-lg border border-green-100 bg-green-50 hover:border-green-200 hover:shadow-sm transition-all cursor-move active:scale-95"
                  >
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                      {task.taskId || task.id.slice(0, 6).toUpperCase()}
                    </div>
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-gray-900">
                      {task.title}
                    </h4>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
