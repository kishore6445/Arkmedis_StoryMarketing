"use client"

import { useState } from "react"
import useSWR from "swr"
import { ChevronDown, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  task_id: string
  title: string
  status: "todo" | "in_progress" | "in_review" | "done"
  promised_date: string
  promised_time?: string
  client_id?: string
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json())
}

export function BacklogDashboard() {
  const { data: tasksData, isLoading } = useSWR("/api/backlog", fetcher, {
    revalidateOnFocus: false,
  })

  const [selectedClient, setSelectedClient] = useState<string>("")
  const [expandedGroup, setExpandedGroup] = useState<string>("unassigned")

  const tasks: Task[] = tasksData?.tasks || []

  // Get unique clients from tasks
  const uniqueClients = Array.from(
    new Set(tasks.map((t) => t.client_id).filter(Boolean))
  )

  // Filter tasks
  const filteredTasks = selectedClient
    ? tasks.filter((t) => t.client_id === selectedClient)
    : tasks

  // Group tasks by status
  const groupedTasks = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    inProgress: filteredTasks.filter((t) => t.status === "in_progress"),
    inReview: filteredTasks.filter((t) => t.status === "in_review"),
  }

  const totalTasks = filteredTasks.length

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "in_review":
        return <AlertCircle className="w-4 h-4 text-amber-600" />
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const TaskGroup = ({
    title,
    count,
    groupKey,
    tasks: groupTasks,
    color,
  }: {
    title: string
    count: number
    groupKey: string
    tasks: Task[]
    color: string
  }) => {
    const isExpanded = expandedGroup === groupKey

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedGroup(isExpanded ? "" : groupKey)}
          className="w-full p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <ChevronDown
              className={cn("w-5 h-5 text-gray-600 transition-transform", isExpanded && "rotate-180")}
            />
            <span className="font-medium text-gray-900">{title}</span>
            <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", color)}>
              {count}
            </span>
          </div>
        </button>

        {isExpanded && groupTasks.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
            {groupTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg p-3 flex items-start gap-3 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="pt-1">{getTaskStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-gray-500">{task.task_id}</span>
                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                  <p className="text-xs text-gray-600 mt-1">Due: {task.promised_date}</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors whitespace-nowrap">
                  Add to Sprint
                </button>
              </div>
            ))}
          </div>
        )}

        {isExpanded && groupTasks.length === 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">No tasks</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Backlog</h1>
        <p className="text-gray-600 mt-2">Unassigned tasks waiting to be added to sprints</p>
      </div>

      {/* Client Filter */}
      <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          Filter by Client:
        </label>
        <select
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value)
            setExpandedGroup("unassigned")
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Clients ({tasks.length} tasks)</option>
          {uniqueClients.map((clientId) => {
            const count = tasks.filter((t) => t.client_id === clientId).length
            return (
              <option key={clientId} value={clientId || ""}>
                Client {clientId?.substring(0, 8)} ({count})
              </option>
            )
          })}
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">Loading backlog...</p>
        </div>
      )}

      {/* Task Groups */}
      {!isLoading && totalTasks > 0 && (
        <div className="space-y-4">
          <TaskGroup
            title="To Do"
            count={groupedTasks.todo.length}
            groupKey="todo"
            tasks={groupedTasks.todo}
            color="bg-gray-100 text-gray-700"
          />
          <TaskGroup
            title="In Progress"
            count={groupedTasks.inProgress.length}
            groupKey="in-progress"
            tasks={groupedTasks.inProgress}
            color="bg-blue-100 text-blue-700"
          />
          <TaskGroup
            title="In Review"
            count={groupedTasks.inReview.length}
            groupKey="in-review"
            tasks={groupedTasks.inReview}
            color="bg-amber-100 text-amber-700"
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalTasks === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No tasks in backlog</p>
        </div>
      )}
    </div>
  )
}
