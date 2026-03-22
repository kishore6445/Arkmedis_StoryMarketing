"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientTask {
  id: string
  taskId: string
  title: string
  clientName: string
  status: "todo" | "in_progress" | "in_review" | "done"
  promisedDate: string
  promisedTime?: string
  dueDate?: string
  createdAt?: string
  sprintId?: string
}

interface Sprint {
  id: string
  name: string
  start_date?: string
  end_date?: string
}

interface ClientStats {
  done: number
  inProgress: number
  pending: number
  overdue: number
  total: number
}

const fetcher = (url: string) => {
  const token = localStorage.getItem("sessionToken")
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json())
}

export function ClientAnalytics() {
  const { data, isLoading } = useSWR("/api/my-tasks", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const { data: sprintsData } = useSWR("/api/sprints", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  })

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] Filter state changed:", { selectedClient, selectedSprint, searchTerm })
  }, [selectedClient, selectedSprint, searchTerm])

  // Map sprint IDs to sprint names
  const sprintMap: Record<string, Sprint> = {}
  if (sprintsData?.sprints) {
    sprintsData.sprints.forEach((sprint: Sprint) => {
      sprintMap[sprint.id] = sprint
    })
  }

  const tasks: ClientTask[] = (data?.tasks || [])
    .filter((task: any) => task.promisedDate)
    .map((task: any) => ({
      id: task.id,
      taskId: task.task_id || task.taskId || task.id.substring(0, 8).toUpperCase(),
      title: task.title,
      clientName: task.clientName || task.client_name || "Unassigned",
      status: task.status || "todo",
      promisedDate: task.promisedDate || task.promised_date,
      promisedTime: task.promisedTime || task.promised_time,
      dueDate: task.dueDate || task.due_date,
      createdAt: task.createdAt || task.created_at,
      sprintId: task.sprint_id || task.sprintId,
    }))

  const groupedByClient = tasks.reduce(
    (acc: Record<string, ClientTask[]>, task: ClientTask) => {
      if (!acc[task.clientName]) {
        acc[task.clientName] = []
      }
      acc[task.clientName].push(task)
      return acc
    },
    {}
  )

  const getClientStats = (clientTasks: ClientTask[]): ClientStats => {
    const now = new Date()

    return {
      done: clientTasks.filter((t) => t.status === "done").length,
      inProgress: clientTasks.filter((t) => t.status === "in_progress").length,
      pending: clientTasks.filter((t) => t.status === "todo" || t.status === "in_review").length,
      overdue: clientTasks.filter((t) => {
        const dueDate = new Date(t.promisedDate)
        return dueDate < now && t.status !== "done"
      }).length,
      total: clientTasks.length,
    }
  }

  const filteredGroups = Object.entries(groupedByClient)
    .filter(([clientName]) => !selectedClient || clientName === selectedClient)
    .map(([clientName, allTasks]) => {
      const sprintFilteredTasks = selectedSprint
        ? allTasks.filter((task) => task.sprintId === selectedSprint)
        : allTasks
      return [
        clientName,
        sprintFilteredTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.taskId.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      ] as [string, ClientTask[]]
    })
    .filter(([_, clientTasks]) => clientTasks.length > 0)

  console.log("[v0] Filtered groups:", filteredGroups.map(([name]) => name), "Total:", filteredGroups.length)

  const handleCopy = (clientName: string, clientTasks: ClientTask[]) => {
    const stats = getClientStats(clientTasks)
    const taskList = clientTasks
      .map((task) => `• [${task.taskId}] ${task.title} - ${new Date(task.promisedDate).toLocaleDateString()}`)
      .join("\n")
    
    const text = `${clientName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Week/Sprint Stats:
  ✓ Done: ${stats.done}
  ⏳ In Progress: ${stats.inProgress}
  ⏹️ Pending: ${stats.pending}
  ⚠️ Overdue: ${stats.overdue}
  Total: ${stats.total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Tasks:
${taskList}`
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(clientName)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Get unique sprints from tasks
  const uniqueSprints = Array.from(
    new Set(tasks.filter((t) => t.sprintId).map((t) => t.sprintId))
  ).sort() as string[]

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-600">
        Loading client analytics...
      </div>
    )
  }

  // Empty state
  if (filteredGroups.length === 0 && tasks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        No tasks found
      </div>
    )
  }

  // Main render
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Tasks and sprint/week statistics by client</p>
        </div>
        
        {/* Client Filter Pills */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filter by Client</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClient(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedClient === null
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Clients ({Object.keys(groupedByClient).length})
            </button>
            {Object.keys(groupedByClient)
              .sort()
              .map((clientName) => (
                <button
                  key={clientName}
                  onClick={() => setSelectedClient(clientName)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedClient === clientName
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {clientName} ({groupedByClient[clientName].length})
                </button>
              ))}
          </div>
        </div>
        
        {/* Sprint Filter Pills */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Filter by Sprint</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSprint(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedSprint === null
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Sprints
            </button>
            {uniqueSprints.map((sprintId) => {
              const sprint = sprintMap[sprintId]
              const sprintName = sprint?.name || `Sprint ${sprintId?.substring(0, 8).toUpperCase()}`
              const sprintTasks = tasks.filter((t) => t.sprintId === sprintId)
              return (
                <button
                  key={sprintId}
                  onClick={() => setSelectedSprint(sprintId)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedSprint === sprintId
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {sprintName} ({sprintTasks.length})
                </button>
              )
            })}
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Search by task name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="p-8 text-center text-gray-600">
          No tasks match your filters
        </div>
      ) : (
        filteredGroups.map(([clientName, clientTasks]) => {
          const stats = getClientStats(clientTasks)
          
          return (
            <div key={clientName} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Client Header with Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-25 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{clientName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{stats.total} tasks this week/sprint</p>
                  </div>
                  <button
                    onClick={() => handleCopy(clientName, clientTasks)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      copiedId === clientName
                        ? "bg-green-100 text-green-700"
                        : "bg-white text-blue-700 hover:bg-blue-100 border border-gray-200"
                    )}
                  >
                    {copiedId === clientName ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Report
                      </>
                    )}
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">Done</p>
                    <p className="text-2xl font-bold text-green-600">{stats.done}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">Pending</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold">Completion</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Tasks List with IDs */}
              <div className="divide-y divide-gray-100">
                {clientTasks.map((task) => (
                  <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded font-mono">
                            {task.taskId}
                          </span>
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 text-xs font-semibold rounded",
                              task.status === "done"
                                ? "bg-green-100 text-green-700"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : task.status === "in_review"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            )}
                          >
                            {task.status === "done"
                              ? "Done"
                              : task.status === "in_progress"
                              ? "In Progress"
                              : task.status === "in_review"
                              ? "In Review"
                              : "Pending"}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(task.promisedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {task.promisedTime && ` at ${task.promisedTime}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
