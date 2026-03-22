"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ContentDetailsModal } from "./content-details-modal"

interface ContentItem {
  id: string
  client: string
  title: string
  type: string
  status: "In Review" | "In Progress" | "Draft"
  daysOverdue?: number
  workflow: {
    writer: "Done" | "In Progress" | "Not Started"
    editor: "Done" | "In Progress" | "Not Started"
    designer: "Done" | "In Progress" | "Not Started"
  }
  blocker?: string
}

interface ContentTrackerTableProps {
  data: ContentItem[]
}

const getWorkflowColor = (status: string) => {
  switch (status) {
    case "Done":
      return "text-green-600 font-medium"
    case "In Progress":
      return "text-blue-600 font-medium"
    default:
      return "text-gray-600"
  }
}

export function ContentTrackerTable({ data }: ContentTrackerTableProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600 font-medium">No content items to track</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.client} • {item.type}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full",
                    item.status === "In Review"
                      ? "bg-amber-100 text-amber-700"
                      : item.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  )}
                >
                  {item.status}
                </span>

                {/* Overdue Badge */}
                {item.daysOverdue && item.daysOverdue > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                    {item.daysOverdue}d overdue
                  </span>
                )}
              </div>
            </div>

            {/* Workflow Pipeline */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Writer</p>
                  <p className={cn("text-sm", getWorkflowColor(item.workflow.writer))}>
                    {item.workflow.writer}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Editor</p>
                  <p className={cn("text-sm", getWorkflowColor(item.workflow.editor))}>
                    {item.workflow.editor}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Designer</p>
                  <p className={cn("text-sm", getWorkflowColor(item.workflow.designer))}>
                    {item.workflow.designer}
                  </p>
                </div>
              </div>
            </div>

            {/* Blocker Alert */}
            {item.blocker && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <span className="text-xs font-bold text-red-700">BLOCKER:</span>
                <span className="text-sm font-semibold text-red-700">{item.blocker} is holding up progress</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setSelectedItem(item)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                View Details
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors">
                Add Note
              </button>
              {item.blocker && (
                <button className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                  Resolve Blocker
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <ContentDetailsModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
