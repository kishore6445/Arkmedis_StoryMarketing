"use client"

import { useState } from "react"
import { List, Calendar, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import ContentVisibilityTable from "@/components/content-visibility-table"
import { ContentCalendarEnhanced } from "@/components/content-calendar-enhanced"

interface ContentRecordsUnifiedProps {
  month: string
  week: string
  client: string
}

const VIEW_MODES = [
  { id: "table", label: "List View", icon: List },
  { id: "calendar", label: "Calendar View", icon: Calendar },
  { id: "timeline", label: "Timeline View", icon: TrendingUp },
]

export default function ContentRecordsUnified({ month, week, client }: ContentRecordsUnifiedProps) {
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "timeline">("table")

  return (
    <div className="w-full">
      {/* View Mode Selector */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {VIEW_MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as "table" | "calendar" | "timeline")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                viewMode === mode.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent"
              )}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          )
        })}
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">All Content Records</h3>
            <p className="text-xs text-gray-500">View all planned and published content in detail with status tracking</p>
          </div>
          <ContentVisibilityTable
            activeTab="all"
            searchQuery=""
            filters={{
              month,
              week,
              client,
            }}
          />
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Calendar Timeline</h3>
            <p className="text-xs text-gray-500">See scheduled content across days and weeks</p>
          </div>
          <ContentCalendarEnhanced
            month={month}
            client={client}
          />
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-100">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline View Coming Soon</h3>
            <p className="text-sm text-gray-600">This view will show content delivery trends and SLA performance over time.</p>
          </div>
        </div>
      )}
    </div>
  )
}
