"use client"

import { useState } from "react"
import { X, Loader, ChevronDown } from "lucide-react"
import useSWR from "swr"
import { cn } from "@/lib/utils"

interface MeetingsScheduleFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("sessionToken")
  const response = await fetch(url, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error("Failed to fetch")
  return response.json()
}

export function MeetingsScheduleForm({ onSuccess, onCancel }: MeetingsScheduleFormProps) {
  const { data: clientsData } = useSWR("/api/clients", fetcher)
  const { data: teamData } = useSWR("/api/team-members", fetcher)

  const [isLoading, setIsLoading] = useState(false)
  const [showAttendeesDropdown, setShowAttendeesDropdown] = useState(false)
  const [formData, setFormData] = useState({
    clientName: "",
    title: "",
    date: "",
    time: "10:00",
    attendees: [] as string[],
    autoSchedule: false,
    notes: "",
  })

  const clients = clientsData?.clients || []
  const teamMembers = teamData?.users || []

  const selectedClient = formData.clientName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clientName || !formData.date || !formData.time) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          title: formData.title || `Meeting with ${formData.clientName}`,
          date: formData.date,
          time: formData.time,
          attendees: formData.attendees,
          repeatWeekly: formData.autoSchedule,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        onSuccess()
        setFormData({
          clientName: "",
          title: "",
          date: "",
          time: "10:00",
          attendees: [],
          autoSchedule: false,
          notes: "",
        })
      }
    } catch (error) {
      console.error("[v0] Error creating meeting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client Dropdown - Primary */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Client *
        </label>
        <select
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          className="w-full px-3 py-2.5 border border-blue-300 rounded-lg bg-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select a client</option>
          {clients.map((client: any) => (
            <option key={client.id} value={client.name}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attendees - Dropdown Style */}
      <div className="relative z-50">
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Attendees
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttendeesDropdown(!showAttendeesDropdown)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-700">
              {formData.attendees.length > 0 
                ? `${formData.attendees.length} selected`
                : "Select attendees"}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-gray-600 transition-transform", showAttendeesDropdown && "rotate-180")} />
          </button>

          {/* Dropdown Menu - Positioned to avoid clipping */}
          {showAttendeesDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 border border-gray-300 rounded-lg bg-white shadow-lg z-50 max-h-60 overflow-y-auto">
              {teamMembers.length === 0 ? (
                <p className="text-sm text-gray-500 p-3">No team members available</p>
              ) : (
                <div className="divide-y">
                  {teamMembers.map((member: any) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 px-3 py-2.5 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              attendees: [...formData.attendees, member.id],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              attendees: formData.attendees.filter((id) => id !== member.id),
                            })
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{member.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Project Kickoff"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Date & Time - Side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Time *
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Auto-Schedule Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.autoSchedule}
          onChange={(e) => setFormData({ ...formData, autoSchedule: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Repeat weekly</span>
      </label>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
          Agenda/Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add meeting agenda or notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isLoading || !formData.clientName || !formData.date}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          Schedule
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
