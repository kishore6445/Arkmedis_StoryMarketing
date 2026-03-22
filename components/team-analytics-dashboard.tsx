"use client"

import { useState } from "react"
import { Users, ChevronDown, ChevronUp, Copy, Check, Search } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { TaskModalWithPKR } from "@/components/task-modal-with-pkr"

interface Task {
  id: string
  task_id?: string
  title: string
  status: "todo" | "in_progress" | "in_review" | "done"
  due_date?: string
}

interface TeamMember {
  id: string
  full_name: string
  email: string
  tasksAssigned?: Task[]
  taskStats?: {
    total: number
    completed: number
    inProgress?: number
    overdue?: number
  }
}

const fetcher = (url: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("sessionToken") : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.json())
}

export function TeamAnalyticsDashboard() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEditTaskModal, setShowEditTaskModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("lowest-pkr")
  const [copiedStatus, setCopiedStatus] = useState<{ [key: string]: boolean }>({})
  const [expandedStatuses, setExpandedStatuses] = useState<{ [key: string]: boolean }>({})

  const { data: analyticsData } = useSWR("/api/team/analytics", fetcher)
  const teamMembers: TeamMember[] = analyticsData?.teamMembers || []

  // Calculate PKR (Performance Completion Rate)
  const calculatePKR = (member: TeamMember) => {
    if (!member.taskStats) return 0
    return member.taskStats.total > 0 ? Math.round((member.taskStats.completed / member.taskStats.total) * 100) : 0
  }

  // Calculate total metrics
  const totalTasks = teamMembers.reduce((sum, m) => sum + (m.taskStats?.total || 0), 0)
  const completedTasks = teamMembers.reduce((sum, m) => sum + (m.taskStats?.completed || 0), 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Categorize members
  const categorizeMembers = (members: TeamMember[]) => {
    const withPKR = members.map((m) => ({ ...m, pkr: calculatePKR(m) }))
    const topPerformers = withPKR.filter((m) => m.pkr >= 90)
    const needsAttention = withPKR.filter((m) => m.pkr >= 65 && m.pkr < 90)
    const needsHelp = withPKR.filter((m) => m.pkr < 65)

    return { topPerformers, needsAttention, needsHelp }
  }

  // Filter and sort
  let filteredMembers = teamMembers
  if (searchQuery) {
    filteredMembers = filteredMembers.filter((m) =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const { topPerformers, needsAttention, needsHelp } = categorizeMembers(filteredMembers)

  // Copy tasks to clipboard
  const handleCopyTasks = async (member: TeamMember, filter?: "all" | "pending" | "overdue") => {
    let tasks = member.tasksAssigned || []

    if (filter === "pending") {
      tasks = tasks.filter((t) => t.status !== "done")
    } else if (filter === "overdue") {
      tasks = tasks.filter((t) => t.status === "todo")
    }

    const text = tasks
      .map((t) => {
        const status = t.status === "in_progress" ? "In Progress" : t.status === "todo" ? "To Do" : t.status === "in_review" ? "In Review" : "Done"
        return `${t.task_id || t.id}\n${t.title}\nStatus: ${status}`
      })
      .join("\n---\n")

    try {
      await navigator.clipboard.writeText(text)
      setCopiedStatus({ ...copiedStatus, [member.id + filter]: true })
      setTimeout(() => {
        setCopiedStatus((prev) => ({ ...prev, [member.id + filter]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const toggleExpandedStatus = (statusKey: string) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [statusKey]: !prev[statusKey],
    }))
  }

  const MemberCard = ({ member, bgColor }: { member: TeamMember & { pkr: number }; bgColor: string }) => (
    <button
      onClick={() => setSelectedMember(member)}
      className={cn(
        "p-4 rounded-lg border-2 border-transparent transition-all hover:shadow-md cursor-pointer",
        bgColor,
        selectedMember?.id === member.id && "border-blue-500 shadow-lg"
      )}
    >
      <p className="text-sm font-medium text-gray-600 mb-2">{member.full_name}</p>
      <p className="text-3xl font-bold mb-2">{member.pkr}%</p>
      <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
        <div 
          className={cn(
            "h-2 rounded-full",
            bgColor === "bg-green-50" && "bg-green-500",
            bgColor === "bg-yellow-50" && "bg-yellow-500",
            bgColor === "bg-red-50" && "bg-red-500"
          )} 
          style={{ width: `${member.pkr}%` }} 
        />
      </div>
      <p className="text-xs text-gray-600">
        {member.taskStats?.completed || 0} / {member.taskStats?.total || 0} tasks completed
      </p>
    </button>
  )

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-3/5 border-r border-gray-200 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Performance</h1>
          <p className="text-gray-600">Weekly summary and completion metrics</p>
        </div>

        {/* Time Period Tabs */}
        <div className="flex gap-2 mb-8">
          {["This Week", "This Month", "Custom"].map((tab) => (
            <button
              key={tab}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors",
                tab === "This Week" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Team Tasks</p>
            <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 mb-2">Completed</p>
            <p className="text-3xl font-bold text-green-700">{completedTasks}</p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-blue-700">{completionRate}%</p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lowest-pkr">Sort by: Lowest PKR</option>
            <option value="highest-pkr">Sort by: Highest PKR</option>
          </select>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded" />
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              <span className="text-sm text-gray-500 ml-auto">{topPerformers.length} members</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {topPerformers.map((member) => (
                <MemberCard key={member.id} member={member} bgColor="bg-green-50" />
              ))}
            </div>
          </div>
        )}

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-yellow-500 rounded" />
              <h2 className="text-lg font-semibold text-gray-900">Needs Attention</h2>
              <span className="text-sm text-gray-500 ml-auto">{needsAttention.length} members</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {needsAttention.map((member) => (
                <MemberCard key={member.id} member={member} bgColor="bg-yellow-50" />
              ))}
            </div>
          </div>
        )}

        {/* Needs Help */}
        {needsHelp.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-red-500 rounded" />
              <h2 className="text-lg font-semibold text-gray-900">Needs Help</h2>
              <span className="text-sm text-gray-500 ml-auto">{needsHelp.length} members</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {needsHelp.map((member) => (
                <MemberCard key={member.id} member={member} bgColor="bg-red-50" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Member Details */}
      {selectedMember ? (
        <div className="w-2/5 bg-white border-l border-gray-200 p-8 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedMember.full_name}</h3>
              <p className="text-sm text-gray-600 mt-1">This Week</p>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* PKR Display */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-2">Performance Completion Rate</p>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold text-blue-700">{calculatePKR(selectedMember)}%</p>
              <p className="text-gray-600">
                {selectedMember.taskStats?.completed || 0}/{selectedMember.taskStats?.total || 0} completed
              </p>
            </div>
          </div>

          {/* Copy Buttons */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => handleCopyTasks(selectedMember, "all")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                copiedStatus[selectedMember.id + "all"]
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              )}
            >
              {copiedStatus[selectedMember.id + "all"] ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy All
                </>
              )}
            </button>
            <button
              onClick={() => handleCopyTasks(selectedMember, "pending")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                copiedStatus[selectedMember.id + "pending"]
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              )}
            >
              {copiedStatus[selectedMember.id + "pending"] ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Pending
                </>
              )}
            </button>
            <button
              onClick={() => handleCopyTasks(selectedMember, "overdue")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                copiedStatus[selectedMember.id + "overdue"]
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              )}
            >
              {copiedStatus[selectedMember.id + "overdue"] ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Overdue
                </>
              )}
            </button>
          </div>

          {/* Tasks by Status */}
          <div className="space-y-4">
            {["Overdue", "In Progress", "To Do", "Done"].map((status) => {
              const tasks = (selectedMember.tasksAssigned || []).filter((t) => {
                if (status === "Overdue") return t.status === "todo"
                if (status === "In Progress") return t.status === "in_progress"
                if (status === "To Do") return t.status === "todo"
                return t.status === "done"
              })

              if (tasks.length === 0) return null

              const isExpanded = expandedStatuses[status]

              return (
                <div key={status}>
                  <button
                    onClick={() => toggleExpandedStatus(status)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{status}</span>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          status === "Overdue" && "bg-red-100 text-red-700",
                          status === "In Progress" && "bg-yellow-100 text-yellow-700",
                          status === "To Do" && "bg-blue-100 text-blue-700",
                          status === "Done" && "bg-green-100 text-green-700"
                        )}
                      >
                        {tasks.length}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 pl-3 border-l-2 border-gray-300">
                      {tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task)
                            setShowEditTaskModal(true)
                          }}
                          className="w-full text-left text-sm text-gray-600 py-2 hover:text-gray-900 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{task.task_id || task.id}</p>
                          <p className="text-sm">{task.title}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="w-2/5 bg-white border-l border-gray-200 p-8 flex items-center justify-center">
          <p className="text-gray-500 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            Select a team member to view their tasks
          </p>
        </div>
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <TaskModalWithPKR
          isOpen={showEditTaskModal}
          onClose={() => {
            setShowEditTaskModal(false)
            setSelectedTask(null)
          }}
          onSave={async (taskData) => {
            console.log("[v0] Saving task:", taskData)
            setShowEditTaskModal(false)
            setSelectedTask(null)
          }}
          task={selectedTask}
        />
      )}
    </div>
  )
}
