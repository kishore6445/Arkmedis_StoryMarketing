"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2, Send, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuickAddFromTimer } from "@/components/quick-add-from-timer"
import { getTodaysTotalHours, getTodaysSessions, formatTime } from "@/lib/timer-service"
import { BreadcrumbTrail } from "@/components/breadcrumb-trail"

interface TimeEntry {
  id: string
  client: string
  sprint: string
  task: string
  hours: number
  description: string
}

interface DailyReport {
  date: string
  status: "draft" | "submitted"
  entries: TimeEntry[]
  totalHours: number
}

const mockClients = [
  { id: "1", name: "Acme Corporation" },
  { id: "2", name: "TechStart Inc" },
  { id: "3", name: "Digital Solutions" },
]

const mockSprints = {
  "1": [
    { id: "s1", name: "Sprint 1 - Q1 Planning" },
    { id: "s2", name: "Sprint 2 - Development" },
  ],
  "2": [
    { id: "s3", name: "Sprint A - MVP" },
    { id: "s4", name: "Sprint B - Polish" },
  ],
  "3": [
    { id: "s5", name: "Sprint X - Research" },
    { id: "s6", name: "Sprint Y - Implementation" },
  ],
}

const mockTasks = {
  s1: [
    { id: "t1", title: "Requirements Analysis" },
    { id: "t2", title: "Architecture Design" },
  ],
  s2: [
    { id: "t3", title: "Backend API Development" },
    { id: "t4", title: "Database Schema" },
  ],
  s3: [
    { id: "t5", title: "UI/UX Design" },
    { id: "t6", title: "Frontend Setup" },
  ],
  s4: [
    { id: "t7", title: "Bug Fixes" },
    { id: "t8", title: "Performance Optimization" },
  ],
  s5: [
    { id: "t9", title: "Market Research" },
    { id: "t10", title: "Competitor Analysis" },
  ],
  s6: [
    { id: "t11", title: "Implementation Plan" },
    { id: "t12", title: "Risk Assessment" },
  ],
}

export default function DailyReportPage() {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const date = new Date()
    return date.toISOString().split("T")[0]
  })

  const [trackedHours, setTrackedHours] = useState(0)
  const [todaySessions, setTodaySessions] = useState<any[]>([])

  // Update tracked hours and sessions on mount and when date changes
  useEffect(() => {
    if (currentDate === new Date().toISOString().split("T")[0]) {
      setTrackedHours(getTodaysTotalHours())
      setTodaySessions(getTodaysSessions())
    } else {
      setTrackedHours(0)
      setTodaySessions([])
    }
  }, [currentDate])

  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      client: "Acme Corporation",
      sprint: "Sprint 1 - Q1 Planning",
      task: "Requirements Analysis",
      hours: 3,
      description: "Gathered and documented initial project requirements from stakeholders",
    },
    {
      id: "2",
      client: "TechStart Inc",
      sprint: "Sprint A - MVP",
      task: "UI/UX Design",
      hours: 4.5,
      description: "Designed user interface mockups and created design system components",
    },
  ])

  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedSprintId, setSelectedSprintId] = useState("")
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [reportStatus, setReportStatus] = useState<"draft" | "submitted">("draft")

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)
  const isValidHours = hours ? (parseFloat(hours) >= 0.25 && parseFloat(hours) <= 10) : true

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId || !selectedSprintId || !selectedTaskId || !hours || !description.trim()) {
      alert("Please fill in all fields")
      return
    }

    if (!isValidHours) {
      alert("Hours must be between 0.25 and 10")
      return
    }

    if (description.trim().length < 10) {
      alert("Description must be at least 10 characters")
      return
    }

    const clientName = mockClients.find(c => c.id === selectedClientId)?.name || ""
    const sprintName = mockSprints[selectedClientId as keyof typeof mockSprints]?.find(s => s.id === selectedSprintId)?.name || ""
    const taskTitle = mockTasks[selectedSprintId as keyof typeof mockTasks]?.find(t => t.id === selectedTaskId)?.title || ""

    if (editingId) {
      setEntries(entries.map(e => 
        e.id === editingId 
          ? {
              ...e,
              client: clientName,
              sprint: sprintName,
              task: taskTitle,
              hours: parseFloat(hours),
              description: description.trim(),
            }
          : e
      ))
      setEditingId(null)
    } else {
      setEntries([
        ...entries,
        {
          id: Date.now().toString(),
          client: clientName,
          sprint: sprintName,
          task: taskTitle,
          hours: parseFloat(hours),
          description: description.trim(),
        },
      ])
    }

    // Reset form
    setSelectedClientId("")
    setSelectedSprintId("")
    setSelectedTaskId("")
    setHours("")
    setDescription("")
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const handleEditEntry = (entry: TimeEntry) => {
    const client = mockClients.find(c => c.name === entry.client)
    const sprint = Object.entries(mockSprints).find(([_, sprints]) => 
      sprints.some(s => s.name === entry.sprint)
    )
    const task = Object.values(mockTasks).find(tasks => 
      tasks.some(t => t.title === entry.task)
    )?.find(t => t.title === entry.task)

    if (client) setSelectedClientId(client.id)
    if (sprint) {
      setSelectedSprintId(
        mockSprints[sprint[0] as keyof typeof mockSprints].find(s => s.name === entry.sprint)?.id || ""
      )
    }
    if (task) setSelectedTaskId(task.id)
    setHours(entry.hours.toString())
    setDescription(entry.description)
    setEditingId(entry.id)
  }

  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate.toISOString().split("T")[0])
  }

  const handleSubmitReport = () => {
    if (entries.length === 0) {
      alert("Please add at least one time entry before submitting")
      return
    }
    if (totalHours < 4) {
      alert("Please log at least 4 hours of work")
      return
    }
    setReportStatus("submitted")
    setShowSubmitModal(false)
  }

  const handleAddFromTimer = (taskId: string, hours: number, clientName: string, sprintName: string, taskTitle: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      client: clientName,
      sprint: sprintName,
      task: taskTitle,
      hours: hours,
      description: `Tracked via Pomodoro timer - ${hours} hours logged`,
    }
    setEntries([...entries, newEntry])
  }

  const filteredSprints = selectedClientId
    ? mockSprints[selectedClientId as keyof typeof mockSprints] || []
    : []

  const filteredTasks = selectedSprintId
    ? mockTasks[selectedSprintId as keyof typeof mockTasks] || []
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] to-[#EFEFEF]">
      {/* Breadcrumbs */}
      <BreadcrumbTrail
        items={[
          { label: "Home", onClick: () => window.location.href = "/" },
          { label: "Daily Work", active: true },
        ]}
      />
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E5E5E7] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black text-[#1D1D1F]">Daily Work Report</h1>
              <p className="text-sm text-[#86868B] mt-1">Track your daily time and activities</p>
            </div>
            <div className="flex gap-2">
              {reportStatus === "draft" && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={entries.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium text-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                  Submit Report
                </button>
              )}
              {reportStatus === "submitted" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#34C759] bg-opacity-10 text-[#34C759] rounded-lg font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Submitted
                </div>
              )}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors text-[#6B7280]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-lg min-w-[300px] justify-center">
              <Calendar className="w-4 h-4 text-[#86868B]" />
              <span className="text-sm font-medium text-[#1D1D1F]">{formatDate(currentDate)}</span>
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors text-[#6B7280]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Pomodoro Tracked Sessions - Reference Section */}
        {currentDate === new Date().toISOString().split("T")[0] && todaySessions.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-900">Pomodoro Sessions Today</h3>
                <p className="text-sm text-green-700 mt-1">Reference tracked time to assist report submission</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-green-600">{trackedHours.toFixed(1)}h</div>
                <p className="text-xs text-green-600 font-medium">{todaySessions.length} sessions tracked</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              {todaySessions.slice(0, 3).map((session, idx) => (
                <div key={session.id} className="bg-white rounded-lg p-3 border border-green-100 hover:border-green-300 transition-colors">
                  <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Session {idx + 1}</div>
                  <div className="text-sm font-mono font-bold text-gray-800">{formatTime(session.duration)}</div>
                  <p className="text-xs text-gray-600 mt-1">{session.taskTitle}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="inline-block bg-blue-50 px-2 py-0.5 rounded text-blue-700">{session.clientName}</span>
                  </div>
                </div>
              ))}
              {todaySessions.length > 3 && (
                <div className="bg-white rounded-lg p-3 border border-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-black text-green-600">+{todaySessions.length - 3}</div>
                    <p className="text-xs text-gray-600 mt-1">More sessions</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>💡</span> Use these tracked sessions as a reference when filling your time entries
              </p>
              <div className="text-right">
                <div className="text-sm font-mono font-bold text-green-700">{trackedHours.toFixed(2)}h total</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">
                {editingId ? "Edit Entry" : "Add Time Entry"}
              </h2>

              <form onSubmit={handleAddEntry} className="space-y-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                    Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value)
                      setSelectedSprintId("")
                      setSelectedTaskId("")
                    }}
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white text-[#1D1D1F]"
                  >
                    <option value="">Select a client</option>
                    {mockClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sprint Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                    Sprint
                  </label>
                  <select
                    value={selectedSprintId}
                    onChange={(e) => {
                      setSelectedSprintId(e.target.value)
                      setSelectedTaskId("")
                    }}
                    disabled={!selectedClientId}
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white text-[#1D1D1F] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a sprint</option>
                    {filteredSprints.map(sprint => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                    Task
                  </label>
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    disabled={!selectedSprintId}
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white text-[#1D1D1F] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a task</option>
                    {filteredTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                    Hours Spent
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.25"
                      max="10"
                      step="0.25"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="e.g., 2.5"
                      className={cn(
                        "w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-white text-[#1D1D1F]",
                        isValidHours ? "border-[#E5E5E7] focus:ring-[#007AFF]" : "border-[#FF3B30] focus:ring-[#FF3B30]"
                      )}
                    />
                    <Clock className="absolute right-3 top-3 w-4 h-4 text-[#86868B] pointer-events-none" />
                  </div>
                  {hours && !isValidHours && (
                    <p className="text-xs text-[#FF3B30] mt-1">Hours must be between 0.25 and 10</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                    Work Description (min 10 chars)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you worked on..."
                    className="w-full px-3 py-2.5 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent text-sm bg-white text-[#1D1D1F] resize-none h-24"
                  />
                  <p className="text-xs text-[#86868B] mt-1">
                    {description.length}/10 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={reportStatus === "submitted"}
                  className="w-full px-4 py-2.5 bg-[#007AFF] text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingId ? "Update Entry" : "Add Entry"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setSelectedClientId("")
                      setSelectedSprintId("")
                      setSelectedTaskId("")
                      setHours("")
                      setDescription("")
                    }}
                    className="w-full px-4 py-2 border border-[#E5E5E7] text-[#1D1D1F] rounded-lg hover:bg-[#F5F5F7] font-medium text-sm transition-all"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Entries Column */}
          <div className="lg:col-span-2">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] p-6">
                <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                  Total Hours
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black text-[#007AFF]">{totalHours.toFixed(1)}</div>
                  <div className="text-xs text-[#86868B] mb-1">hours</div>
                </div>
                <div className="mt-3 w-full h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#007AFF] transition-all"
                    style={{ width: `${Math.min((totalHours / 8) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#86868B] mt-2">{entries.length} entries logged</p>
                {currentDate === new Date().toISOString().split("T")[0] && trackedHours > 0 && (
                  <p className="text-xs text-[#007AFF] mt-2 font-medium">
                    {trackedHours.toFixed(2)}h tracked via timer
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] p-6">
                <div className="text-xs font-semibold text-[#86868B] uppercase tracking-wide mb-2">
                  Status
                </div>
                <div className="flex items-center gap-2">
                  {reportStatus === "draft" ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[#FF9500]" />
                      <span className="text-sm font-semibold text-[#FF9500]">Draft</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                      <span className="text-sm font-semibold text-[#34C759]">Submitted</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#86868B] mt-3">
                  {reportStatus === "draft" ? "Save and submit when ready" : "Report submitted successfully"}
                </p>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-3">
              {/* Quick Add from Timer */}
              {currentDate === new Date().toISOString().split("T")[0] && trackedHours > 0 && (
                <div className="mb-6">
                  <QuickAddFromTimer onAddEntry={handleAddFromTimer} />
                </div>
              )}
              {entries.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] p-12 text-center">
                  <Clock className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3 opacity-50" />
                  <p className="text-[#86868B] font-medium">No time entries yet</p>
                  <p className="text-xs text-[#BDBDBE] mt-1">Add your first entry to get started</p>
                </div>
              ) : (
                entries.map(entry => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-xl shadow-sm border border-[#E5E5E7] p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 bg-[#007AFF] bg-opacity-10 text-[#007AFF] text-xs font-semibold rounded">
                            {entry.hours}h
                          </span>
                          <h3 className="font-semibold text-[#1D1D1F] text-sm">{entry.task}</h3>
                        </div>
                        <p className="text-xs text-[#86868B]">{entry.client}</p>
                        <p className="text-xs text-[#86868B]">{entry.sprint}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          disabled={reportStatus === "submitted"}
                          className="p-2 hover:bg-[#F5F5F7] rounded-lg transition-colors text-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={reportStatus === "submitted"}
                          className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors text-[#EF4444] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#1D1D1F] leading-relaxed">{entry.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-black text-[#1D1D1F] mb-4">Submit Daily Report?</h2>
            <div className="bg-[#F5F5F7] rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Total Hours:</span>
                  <span className="font-semibold text-[#1D1D1F]">{totalHours.toFixed(1)} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Entries:</span>
                  <span className="font-semibold text-[#1D1D1F]">{entries.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Date:</span>
                  <span className="font-semibold text-[#1D1D1F]">{formatDate(currentDate)}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#86868B] mb-6">
              Once submitted, you won&apos;t be able to edit this report. Make sure all information is correct.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-[#E5E5E7] text-[#1D1D1F] rounded-lg hover:bg-[#F5F5F7] font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="flex-1 px-4 py-2 bg-[#007AFF] text-white rounded-lg hover:opacity-90 font-medium text-sm transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
