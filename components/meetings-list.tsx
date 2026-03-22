"use client"

import { Clock, Users, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Meeting {
  id: string
  title?: string
  client_id?: string
  date: string
  time: string
  attendees: Array<{ id: string; full_name: string }>
  status: "scheduled" | "completed" | "cancelled"
}

interface MeetingsListProps {
  meetings: Meeting[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const formatDate = (date: string) => {
  const d = new Date(`${date}T00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function MeetingsList({
  meetings,
  selectedId,
  onSelect,
}: MeetingsListProps) {
  if (meetings.length === 0) {
    return (
      <div className="px-2 py-8 text-center">
        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">No meetings</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => {
        const isSelected = selectedId === meeting.id

        return (
          <button
            key={meeting.id}
            onClick={() => onSelect(meeting.id)}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg border transition-all duration-150",
              "hover:border-blue-300 hover:bg-blue-50",
              isSelected
                ? "bg-blue-50 border-blue-400 shadow-sm ring-1 ring-blue-200"
                : "bg-white border-gray-200 hover:shadow-sm"
            )}
          >
            {/* Title */}
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {meeting.title || meeting.client_id || "Meeting"}
            </h3>

            {/* Meta: Date, Time, Attendees */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{meeting.time}</span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{meeting.attendees?.length || 0}</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
