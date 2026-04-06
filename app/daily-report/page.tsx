"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader } from "lucide-react"
import useSWR from "swr"
import { DailyReportHeader } from "@/components/daily-report-header"
import { TimeEntryForm } from "@/components/time-entry-form"
import { TimeEntryList } from "@/components/time-entry-list"
import { SubmitReportModal } from "@/components/submit-report-modal"

interface TimeEntry {
  id: string
  client_id: string
  sprint_id: string
  task_id: string
  hours: number
  description: string
  clients?: { name: string }
  sprints?: { name: string }
  tasks?: { title: string }
}

interface DailyReport {
  id: string
  user_id: string
  report_date: string
  status: "draft" | "submitted"
  total_hours: number
  submitted_at?: string
}

interface Client {
  id: string
  name: string
}

interface Sprint {
  id: string
  name: string
  client_id: string
}

interface Task {
  id: string
  title: string
  sprint_id: string
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("sessionToken")
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error("Failed to fetch")
  return response.json()
}

export default function DailyReportPage() {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const date = new Date()
    return date.toISOString().split("T")[0]
  })

  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingEntry, setIsDeletingEntry] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  // Fetch report and entries for current date
  const { data: reportData, mutate: mutateReport, isLoading: isLoadingReport } = useSWR(
    `/api/daily-reports?date=${currentDate}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Fetch clients
  const { data: clientsData } = useSWR("/api/clients", fetcher)

  // Fetch sprints
  const { data: sprintsData } = useSWR(
    selectedClientId ? `/api/clients/${selectedClientId}/sprints` : null,
    fetcher
  )

  // Fetch tasks
  const { data: tasksData } = useSWR(
    selectedSprintId ? `/api/clients/${selectedClientId}/tasks?sprintId=${selectedSprintId}` : null,
    fetcher
  )

  const report = reportData?.report
  const entries: TimeEntry[] = reportData?.entries || []
  const clients: Client[] = clientsData?.data || clientsData || []
  const sprints: Sprint[] = sprintsData?.data || sprintsData || []
  const tasks: Task[] = tasksData?.data || tasksData || []

  // Filter sprints by selected client
  const filteredSprints = selectedClientId
    ? sprints.filter((s) => s.client_id === selectedClientId)
    : []

  // Filter tasks by selected sprint
  const filteredTasks = selectedSprintId ? tasks.filter((t) => t.sprint_id === selectedSprintId) : []

  const handleDateChange = (days: number) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + days)
    setCurrentDate(date.toISOString().split("T")[0])
    setSelectedClientId("")
    setSelectedSprintId("")
    setSelectedTaskId("")
    setEditingEntry(null)
    setShowEditForm(false)
  }

  const handleAddTimeEntry = async (data: any) => {
    if (!report?.id) return

    const token = localStorage.getItem("sessionToken")
    try {
      const response = await fetch(`/api/daily-reports/${report.id}/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        mutateReport()
        setSelectedClientId("")
        setSelectedSprintId("")
        setSelectedTaskId("")
      } else {
        const error = await response.json()
        console.error("[v0] Error adding entry:", error)
      }
    } catch (error) {
      console.error("[v0] Error:", error)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!report?.id) return

    setIsDeletingEntry(entryId)
    const token = localStorage.getItem("sessionToken")
    try {
      const response = await fetch(
        `/api/daily-reports/${report.id}/time-entries/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        mutateReport()
      }
    } catch (error) {
      console.error("[v0] Error deleting:", error)
    } finally {
      setIsDeletingEntry(null)
    }
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setSelectedClientId(entry.client_id)
    setSelectedSprintId(entry.sprint_id)
    setSelectedTaskId(entry.task_id)
    setShowEditForm(true)
  }

  const handleSubmitReport = async () => {
    if (!report?.id) return

    setIsSubmitting(true)
    setSubmitError("")
    const token = localStorage.getItem("sessionToken")

    try {
      const response = await fetch(`/api/daily-reports/${report.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        mutateReport()
        setShowSubmitModal(false)
      } else {
        const error = await response.json()
        setSubmitError(error.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("[v0] Error:", error)
      setSubmitError("An error occurred while submitting")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isReportSubmitted = report?.status === "submitted"

  return (
    <main className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#1D1D1F] mb-2">Daily Report</h1>
          <p className="text-[#86868B]">Track your time and submit daily timesheets</p>
        </div>

        {isLoadingReport ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-[#007AFF] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg border border-[#E5E5E7] p-4">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 hover:bg-[#F5F5F7] rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" />
              </button>

              <input
                type="date"
                value={currentDate}
                onChange={(e) => {
                  setCurrentDate(e.target.value)
                  setSelectedClientId("")
                  setSelectedSprintId("")
                  setSelectedTaskId("")
                }}
                className="px-4 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-sm font-medium"
              />

              <button
                onClick={() => handleDateChange(1)}
                disabled={new Date(currentDate).toDateString() === new Date().toDateString()}
                className="p-2 hover:bg-[#F5F5F7] rounded transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5 text-[#1D1D1F]" />
              </button>
            </div>

            {/* Report Header */}
            {report && (
              <DailyReportHeader
                date={currentDate}
                totalHours={report.total_hours}
                status={report.status}
                submittedAt={report.submitted_at}
              />
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Forms */}
              <div className="lg:col-span-1 space-y-4">
                {!isReportSubmitted && (
                  <TimeEntryForm
                    clients={clients}
                    sprints={sprints}
                    tasks={tasks}
                    filteredSprints={filteredSprints}
                    filteredTasks={filteredTasks}
                    clientId={selectedClientId}
                    sprintId={selectedSprintId}
                    taskId={selectedTaskId}
                    onClientChange={setSelectedClientId}
                    onSprintChange={setSelectedSprintId}
                    onTaskChange={setSelectedTaskId}
                    onSubmit={handleAddTimeEntry}
                    isLoading={isLoadingReport}
                  />
                )}
              </div>

              {/* Right: Entries List */}
              <div className="lg:col-span-2">
                <TimeEntryList
                  entries={entries}
                  onEdit={handleEditEntry}
                  onDelete={handleDeleteEntry}
                  isDeleting={isDeletingEntry}
                />
              </div>
            </div>

            {/* Submit Button */}
            {!isReportSubmitted && entries.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-3 bg-[#007AFF] text-white rounded-lg hover:opacity-90 font-semibold transition-all"
                >
                  Submit Daily Report
                </button>
              </div>
            )}

            {isReportSubmitted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-700 font-semibold">Report submitted successfully!</p>
                <p className="text-sm text-green-600 mt-1">You can view historical reports by changing the date.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <SubmitReportModal
        isOpen={showSubmitModal}
        totalHours={report?.total_hours || 0}
        entriesCount={entries.length}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitReport}
        onCancel={() => {
          setShowSubmitModal(false)
          setSubmitError("")
        }}
        error={submitError}
      />
    </main>
  )
}
