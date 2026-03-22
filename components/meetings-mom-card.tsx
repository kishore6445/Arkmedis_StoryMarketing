"use client"

import { useState } from "react"
import { Save, Loader, Copy, CheckCircle2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Meeting {
  id: string
  title?: string
  client_id?: string
  client_name?: string
  date: string
  time: string
  attendees: Array<{ id: string; full_name: string; email?: string }>
  summary?: string
  key_decisions?: string[]
}

interface MeetingsMomCardProps {
  meeting: Meeting
  onUpdate: () => void
  onCreateActionItems?: (summary: string, decisions: string[]) => void
  onCreateTask?: (title: string, decision: string) => void
  onAddToKnowledgeBase?: (data: { summary: string; decisions: string[]; meetingDate: string; meetingId: string }) => void
}

export function MeetingsMomCard({ meeting, onUpdate, onCreateActionItems, onCreateTask, onAddToKnowledgeBase }: MeetingsMomCardProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    summary: meeting.summary || "",
    keyDecisions: meeting.key_decisions || [""],
  })

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Ready to share",
      duration: 2000,
    })
  }

  const handleCopyAllMOM = () => {
    const decisions = formData.keyDecisions
      .filter((d) => d.trim())
      .map((d) => `• ${d}`)
      .join("\n")
    const momText = `📋 Minutes of Meeting - ${meeting.client_id}\n\n📝 Summary:\n${formData.summary}\n\n✅ Key Actions:\n${decisions}`
    handleCopyToClipboard(momText)
  }

  const handleAddDecision = () => {
    setFormData({
      ...formData,
      keyDecisions: [...formData.keyDecisions, ""],
    })
  }

  const handleUpdateDecision = (index: number, value: string) => {
    const updated = [...formData.keyDecisions]
    updated[index] = value
    setFormData({ ...formData, keyDecisions: updated })
  }

  const handleRemoveDecision = (index: number) => {
    setFormData({
      ...formData,
      keyDecisions: formData.keyDecisions.filter((_, i) => i !== index),
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          summary: formData.summary,
          keyDecisions: formData.keyDecisions.filter((d) => d.trim()),
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error("[v0] Error saving MOM:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddToKnowledgeBase = async () => {
    if (!meeting.client_id) return

    const kbData = {
      summary: formData.summary,
      decisions: formData.keyDecisions.filter((d) => d.trim()),
      meetingDate: meeting.date,
      meetingId: meeting.id,
    }

    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/clients/${meeting.client_id}/knowledge-base`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(kbData),
      })

      if (response.ok) {
        toast({
          title: "Added to Knowledge Base",
          description: "Meeting insights have been saved",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("[v0] Error adding to KB:", error)
      toast({
        title: "Error",
        description: "Failed to add to knowledge base",
        duration: 2000,
      })
    }
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Minutes of Meeting</h2>
        <p className="text-sm text-gray-600 mt-1">{meeting.client_id}</p>
      </div>

      {/* Meeting Info - Compact */}
      <div className="grid grid-cols-3 gap-6 text-sm">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Date</p>
          <p className="font-medium text-gray-900">{meeting.date}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Time</p>
          <p className="font-medium text-gray-900">{meeting.time}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Attendees</p>
          <p className="font-medium text-gray-900">{meeting.attendees?.length || 0} people</p>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          {/* Summary Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Summary
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="Add meeting summary..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={5}
            />
          </div>

          {/* Key Decisions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Key Decisions & Actions
            </label>
            <div className="space-y-2">
              {formData.keyDecisions.map((decision, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={decision}
                    onChange={(e) => handleUpdateDecision(index, e.target.value)}
                    placeholder="Add action item..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.keyDecisions.length > 1 && (
                    <button
                      onClick={() => handleRemoveDecision(index)}
                      className="px-3 py-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddDecision}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add action
              </button>
            </div>
          </div>

          {/* Save/Cancel */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader className="w-4 h-4 animate-spin" />}
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 border-t border-gray-200 pt-6">
          {/* Summary Display */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
            {formData.summary ? (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {formData.summary}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No summary added yet</p>
            )}
          </div>

          {/* Key Decisions Display */}
          {formData.keyDecisions.some((d) => d.trim()) && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Key Actions</h3>
              <ul className="space-y-2">
                {formData.keyDecisions.map(
                  (decision, index) =>
                    decision.trim() && (
                      <li key={index} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 font-semibold flex-shrink-0">•</span>
                        <span>{decision}</span>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons - Only 2 main buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleCopyAllMOM}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-900 hover:bg-gray-50 font-medium rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            {onAddToKnowledgeBase && (
              <button
                onClick={handleAddToKnowledgeBase}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Knowledge Base
              </button>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ✎ Edit
          </button>
        </div>
      )}
    </div>
  )
}
