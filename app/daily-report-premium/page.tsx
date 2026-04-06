"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Edit2, Trash2, Merge2, Plus, Send, Calendar, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeEntry {
  id: string
  taskTitle: string
  clientName: string
  sprintName: string
  startTime: string
  endTime: string
  duration: number
  description: string
  source: "auto-captured" | "suggested" | "manual"
}

export default function DailyReportRedesigned() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const date = new Date()
    return date.toISOString().split("T")[0]
  })

  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      id: "1",
      taskTitle: "Test Ark Ops and makebite it ready for Monday Launch",
      clientName: "Armedia",
      sprintName: "April 2026 Sprint",
      startTime: "09:00",
      endTime: "10:30",
      duration: 1.5,
      description: "Completed testing and prepared for launch",
      source: "auto-captured",
    },
    {
      id: "2",
      taskTitle: "Marketing Plan for Story marketing & Warrior Systems",
      clientName: "Story Marketing",
      sprintName: "April 2026 Sprint",
      startTime: "11:00",
      endTime: "12:45",
      duration: 1.75,
      description: "Created marketing plan document",
      source: "auto-captured",
    },
  ])

  const [suggestedEntries] = useState<TimeEntry[]>([
    {
      id: "s1",
      taskTitle: "Review All Clients & Assign Next Sprint Tasks",
      clientName: "Story Marketing",
      sprintName: "April 2026 Sprint",
      startTime: "14:00",
      endTime: "14:32",
      duration: 0.53,
      description: "Activity detected",
      source: "suggested",
    },
  ])

  const [reportStatus, setReportStatus] = useState<"draft" | "submitted">("draft")
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0)
  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const handleAddSuggestedEntry = (id: string) => {
    const suggested = suggestedEntries.find((e) => e.id === id)
    if (suggested) {
      setEntries([...entries, { ...suggested, id: Date.now().toString(), source: "auto-captured" }])
    }
  }

  const handleSubmit = () => {
    if (entries.length === 0) {
      alert("Please add at least one entry")
      return
    }
    setReportStatus("submitted")
    setShowSubmitModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Daily Work Report</h1>

          {/* Date Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-medium text-gray-900">{formattedDate}</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Total Hours</p>
              <p className="text-3xl font-bold text-blue-900">{totalHours.toFixed(1)}</p>
              <p className="text-xs text-blue-600 mt-2">{entries.length} entries</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Auto-Captured</p>
              <p className="text-3xl font-bold text-green-900">{entries.length}</p>
              <p className="text-xs text-green-600 mt-2">Ready to submit</p>
            </div>
            <div className={cn(
              "rounded-lg p-4 border",
              reportStatus === "draft"
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            )}>
              <p className={cn(
                "text-xs uppercase tracking-wide font-medium mb-1",
                reportStatus === "draft" ? "text-amber-600" : "text-green-600"
              )}>
                Status
              </p>
              <p className={cn(
                "text-3xl font-bold",
                reportStatus === "draft" ? "text-amber-900" : "text-green-900"
              )}>
                {reportStatus === "draft" ? "Draft" : "Submitted"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Auto-Captured & Suggested */}
          <div className="col-span-2 space-y-8">
            {/* Section A: Auto-Captured */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto-Captured Today</h2>
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{entry.taskTitle}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {entry.clientName} • {entry.sprintName}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Auto
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>{entry.startTime}</span>
                      <span className="text-gray-400">–</span>
                      <span>{entry.endTime}</span>
                      <span className="ml-auto font-semibold text-gray-900">{entry.duration.toFixed(2)}h</span>
                    </div>

                    <textarea
                      value={entry.description}
                      onChange={() => {}}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />

                    <div className="flex items-center justify-between gap-2 mt-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="Merge">
                          <Merge2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Suggested Entries */}
            {suggestedEntries.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Suggested Entries
                </h2>
                <div className="space-y-3">
                  {suggestedEntries.map((entry) => (
                    <div key={entry.id} className="bg-white border border-amber-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">{entry.taskTitle}</h3>
                          <p className="text-xs text-gray-600 mt-1">
                            {entry.clientName} • {entry.sprintName}
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium">
                          Activity detected
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Estimated: <span className="font-semibold text-gray-900">{entry.duration.toFixed(2)}h</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddSuggestedEntry(entry.id)}
                          className="flex-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                        >
                          Add to Report
                        </button>
                        <button className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Manual Entry */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Manual Entry</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Client</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select client...</option>
                    <option>Armedia</option>
                    <option>Story Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Sprint</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select sprint...</option>
                    <option>April 2026 Sprint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Task</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select task...</option>
                    <option>Test task 1</option>
                    <option>Test task 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Hours</label>
                  <input type="number" placeholder="0.0" step="0.25" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Description</label>
                  <textarea placeholder="What did you work on?" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
                </div>

                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {reportStatus === "draft" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-6xl mx-auto flex justify-end">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Report
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Daily Report</h2>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{entries.length}</span> time entries
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalHours.toFixed(1)}h</span> total tracked
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
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
