"use client"

import { useState } from "react"
import { Copy, Share2, ExternalLink, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Meeting {
  id: string
  title?: string
  client_id?: string
  date: string
  time: string
  attendees: Array<{ id: string; full_name: string; email: string }>
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  recording_url?: string
}

interface MeetingsDetailsPanelProps {
  meeting: Meeting
  onUpdate: () => void
}

export function MeetingsDetailsPanel({
  meeting,
  onUpdate,
}: MeetingsDetailsPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const formatDate = (date: string, time: string) => {
    const d = new Date(`${date}T${time}`)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const meetingInfo = {
    title: meeting.title || `Meeting with ${meeting.client_id}`,
    client: meeting.client_id || "Unknown",
    dateTime: formatDate(meeting.date, meeting.time),
    attendees: meeting.attendees?.map((a) => a.full_name).join(", ") || "No attendees",
    attendeesEmails: meeting.attendees?.map((a) => a.email).filter(Boolean).join(", ") || "No emails",
    agenda: meeting.notes || "No agenda provided",
  }

  const shareText = `Meeting: ${meetingInfo.title}\n${meetingInfo.dateTime}\nAttendees: ${meetingInfo.attendees}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
      {/* Quick Copy Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-light text-gray-900">{meetingInfo.title}</h2>
          <button
            onClick={() => handleCopy(shareText, "all")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              copiedField === "all"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
            )}
          >
            {copiedField === "all" ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
        </div>

        {/* Client & Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Client
            </p>
            <p className="text-sm font-medium text-gray-900">{meetingInfo.client}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
              Date & Time
            </p>
            <p className="text-sm font-medium text-gray-900">{meetingInfo.dateTime}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Agenda/Notes */}
      {meeting.notes && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Agenda
            </p>
            <button
              onClick={() => handleCopy(meeting.notes, "agenda")}
              className={cn(
                "p-1.5 rounded transition-colors",
                copiedField === "agenda"
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
              )}
              title="Copy agenda"
            >
              {copiedField === "agenda" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
            {meeting.notes}
          </p>
        </div>
      )}

      {/* Attendees */}
      {meeting.attendees.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Attendees
            </p>
            <button
              onClick={() => handleCopy(meetingInfo.attendeesEmails, "emails")}
              className={cn(
                "p-1.5 rounded transition-colors",
                copiedField === "emails"
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
              )}
              title="Copy emails"
            >
              {copiedField === "emails" ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          <div className="space-y-2">
            {meeting.attendees.map((attendee) => (
              <div
                key={attendee.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {attendee.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{attendee.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recording Link */}
      {meeting.recording_url && (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
            Recording
          </p>
          <a
            href={meeting.recording_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Recording
          </a>
        </div>
      )}

      <div className="border-t border-gray-200" />

      {/* Share Actions */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(meetingInfo.title)}&body=${encodeURIComponent(shareText)}`}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Email
        </a>
      </div>
    </div>
  )
}
