"use client"

import { useState } from "react"
import { Plus, Download, Upload } from "lucide-react"
import { ContentCalendarView } from "@/components/content-calendar-view"
import AddContentModal from "@/components/add-content-modal-cv"
import { BreadcrumbTrail } from "@/components/breadcrumb-trail"
import type { ContentRecordListItem } from "@/lib/content-records"

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function ContentCalendarPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingRecord, setEditingRecord] = useState<ContentRecordListItem | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  )

  return (
    <div className="w-full max-w-7xl">
      {/* Breadcrumbs */}
      <BreadcrumbTrail
        items={[
          { label: "Home", onClick: () => window.location.href = "/" },
          { label: "Content Calendar", active: true },
        ]}
      />
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-sm text-gray-600 mt-2">Plan content distribution, manage blackout dates, optimize posting schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
            aria-label="Select month"
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Upload">
            <Upload className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Content Calendar */}
      <ContentCalendarView 
        clientId={null}
        selectedMonth={selectedMonth}
        refreshKey={refreshKey}
        onCreatePost={() => setShowAddModal(true)}
      />

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal 
          onClose={() => setShowAddModal(false)}
          initialData={editingRecord}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingRecord(null)
            setRefreshKey((currentKey) => currentKey + 1)
          }}
        />
      )}
    </div>
  )
}
