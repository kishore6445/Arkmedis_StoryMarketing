"use client"

import { X } from "lucide-react"

interface ContentDetailsModalProps {
  item: {
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
  onClose: () => void
}

export function ContentDetailsModal({ item, onClose }: ContentDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{item.client} • {item.type}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.status === "In Review"
                    ? "bg-amber-100 text-amber-700"
                    : item.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {item.status}
              </span>
              {item.daysOverdue && item.daysOverdue > 0 && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                  {item.daysOverdue}d overdue
                </span>
              )}
            </div>
          </div>

          {/* Workflow Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Workflow Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Writer</span>
                <span
                  className={`text-sm font-semibold ${
                    item.workflow.writer === "Done"
                      ? "text-green-600"
                      : item.workflow.writer === "In Progress"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.workflow.writer}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Editor</span>
                <span
                  className={`text-sm font-semibold ${
                    item.workflow.editor === "Done"
                      ? "text-green-600"
                      : item.workflow.editor === "In Progress"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.workflow.editor}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Designer</span>
                <span
                  className={`text-sm font-semibold ${
                    item.workflow.designer === "Done"
                      ? "text-green-600"
                      : item.workflow.designer === "In Progress"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.workflow.designer}
                </span>
              </div>
            </div>
          </div>

          {/* Blocker Section */}
          {item.blocker && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Blocker</h3>
              <p className="text-sm text-red-800">{item.blocker} is holding up progress</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Add Note
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
