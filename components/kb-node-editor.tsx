"use client"

import { useState, useEffect } from "react"
import { X, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { KBNode } from "./kb-tree"

interface KBNodeEditorProps {
  node: KBNode | null
  isOpen: boolean
  onClose: () => void
  onSave: (node: KBNode) => void
  onDelete: (nodeId: string) => void
  clientId: string
}

export function KBNodeEditor({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
  clientId,
}: KBNodeEditorProps) {
  const [formData, setFormData] = useState<Partial<KBNode>>({})
  const [tags, setTags] = useState<string>("")

  useEffect(() => {
    if (node) {
      setFormData(node)
      setTags(node.tags?.join(", ") || "")
    } else {
      setFormData({})
      setTags("")
    }
  }, [node, isOpen])

  const isNewNode = !node?.id

  const handleSave = () => {
    if (!formData.title?.trim()) return

    const updatedNode: KBNode = {
      id: formData.id || `kb-${Date.now()}`,
      title: formData.title || "",
      content: formData.content || "",
      type: (formData.type || "topic") as KBNode["type"],
      clientId: clientId,
      parentId: formData.parentId || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      priority: formData.priority,
      createdAt: formData.createdAt || new Date().toISOString(),
      createdFromMeetingId: formData.createdFromMeetingId,
    }

    onSave(updatedNode)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {isNewNode ? "New Knowledge Base Item" : "Edit Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type
            </label>
            <select
              value={formData.type || "topic"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as KBNode["type"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="topic">📋 Topic</option>
              <option value="decision">✅ Decision</option>
              <option value="action">⚡ Action Item</option>
              <option value="insight">💡 Insight</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Priority
            </label>
            <select
              value={formData.priority || "medium"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "high" | "medium" | "low",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Content / Details
            </label>
            <textarea
              value={formData.content || ""}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Add detailed content, notes, or context..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="budget, timeline, design..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 sticky bottom-0 bg-gray-50">
          <div className="flex-1">
            {node && (
              <button
                onClick={() => {
                  onDelete(node.id)
                  onClose()
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title?.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
