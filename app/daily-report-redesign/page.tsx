'use client'

import { useState } from 'react'
import { Plus, Clock, CheckCircle2, ChevronDown, Edit2, Trash2, Merge2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BreadcrumbTrail } from '@/components/breadcrumb-trail'

interface TimerEntry {
  id: string
  taskTitle: string
  clientName: string
  sprintName: string
  startTime: string
  endTime: string
  duration: number
  source: 'auto' | 'suggested' | 'manual'
  description: string
  isEditing?: boolean
}

export default function DailyReportRedesign() {
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const date = new Date()
    return date.toISOString().split('T')[0]
  })

  const [entries, setEntries] = useState<TimerEntry[]>([
    {
      id: '1',
      taskTitle: 'Design System Audit',
      clientName: 'TechCorp',
      sprintName: 'Sprint 24',
      startTime: '09:00',
      endTime: '10:30',
      duration: 1.5,
      source: 'auto',
      description: 'Reviewed design tokens and component library',
    },
    {
      id: '2',
      taskTitle: 'API Integration',
      clientName: 'TechCorp',
      sprintName: 'Sprint 24',
      startTime: '10:45',
      endTime: '12:30',
      duration: 1.75,
      source: 'auto',
      description: 'Integrated payment gateway APIs',
    },
    {
      id: '3',
      taskTitle: 'Documentation Update',
      clientName: 'DevStudio',
      sprintName: 'Sprint 24',
      startTime: '13:30',
      endTime: '14:15',
      duration: 0.75,
      source: 'auto',
      description: 'Updated API documentation',
    },
  ])

  const [reportStatus, setReportStatus] = useState<'draft' | 'submitted'>('draft')
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const totalHours = entries.reduce((acc, entry) => acc + entry.duration, 0)
  const autoEntries = entries.filter((e) => e.source === 'auto')
  const suggestedEntries = entries.filter((e) => e.source === 'suggested')
  const manualEntries = entries.filter((e) => e.source === 'manual')

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <BreadcrumbTrail
        items={[
          { label: 'Home', onClick: () => (window.location.href = '/') },
          { label: 'Daily Work Report', active: true },
        ]}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Work Report</h1>
            <p className="text-gray-600 mt-2">Track and review your time entries</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={reportStatus === 'submitted' || entries.length === 0}
              className={cn(
                'px-6 py-2 rounded-lg font-medium transition-colors',
                reportStatus === 'submitted'
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              )}
            >
              Submit Report
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500/20" />
            </div>
            <div className="mt-4 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${Math.min((totalHours / 8) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entries</p>
              <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
              <p className="text-xs text-gray-500 mt-2">{autoEntries.length} auto-captured</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                {reportStatus === 'draft' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-amber-600 rounded-full" />
                    Draft
                  </span>
                )}
                {reportStatus === 'submitted' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Submitted
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {/* Auto-Captured Entries */}
          {autoEntries.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Auto-Captured Today
                </h2>
                <p className="text-sm text-gray-600 mt-1">Review entries from your timer sessions</p>
              </div>

              <div className="space-y-3">
                {autoEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{entry.taskTitle}</h3>
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                            Auto Captured
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                          <div>
                            <p className="text-gray-600 text-xs mb-0.5">Client</p>
                            <p className="font-medium text-gray-900">{entry.clientName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs mb-0.5">Sprint</p>
                            <p className="font-medium text-gray-900">{entry.sprintName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs mb-0.5">Time</p>
                            <p className="font-medium text-gray-900">{entry.duration}h</p>
                          </div>
                          <div>
                            <p className="text-gray-600 text-xs mb-0.5">Duration</p>
                            <p className="font-medium text-gray-900">
                              {entry.startTime} – {entry.endTime}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">{entry.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Suggested Entries */}
          {suggestedEntries.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Suggested Entries</h2>
                <p className="text-sm text-gray-600 mt-1">Work detected but not tracked</p>
              </div>

              <div className="space-y-2">
                {suggestedEntries.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.taskTitle}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {entry.clientName} • {entry.duration}h estimated
                        </p>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Manual Entry */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add Manual Entry
              </h2>
              <p className="text-sm text-gray-600 mt-1">For time you forgot to track</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Select client...</option>
                    <option>TechCorp</option>
                    <option>DevStudio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sprint</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Select sprint...</option>
                    <option>Sprint 24</option>
                    <option>Sprint 25</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Select task...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                  <input
                    type="number"
                    min="0.25"
                    max="10"
                    step="0.25"
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="What did you work on?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    rows={3}
                  />
                </div>

                <button className="md:col-span-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Add Entry
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Daily Report?</h3>
            <p className="text-gray-600 mb-6">
              You&apos;re about to submit {entries.length} time entries totaling {totalHours.toFixed(1)} hours.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setReportStatus('submitted')
                  setShowSubmitModal(false)
                }}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Confirm Submit
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
