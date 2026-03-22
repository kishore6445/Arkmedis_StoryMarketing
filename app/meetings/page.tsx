"use client"

import { useState } from "react"
import { Plus, Copy, Share2, Clock, Users, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { MeetingsScheduleForm } from "@/components/meetings-schedule-form"
import { MeetingsList } from "@/components/meetings-list"
import { MeetingsDetailsPanel } from "@/components/meetings-details-panel"
import { MeetingsMomCard } from "@/components/meetings-mom-card"

interface Meeting {
  id: string
  title?: string
  client_id?: string
  client_name?: string
  date: string
  time: string
  attendees: Array<{ id: string; full_name: string; email: string }>
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  repeat_weekly?: boolean
  summary?: string
  key_decisions?: string[]
  recording_url?: string
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem("sessionToken")
  const response = await fetch(url, {
    headers: token ? { "Authorization": `Bearer ${token}` } : {},
  })
  if (!response.ok) {
    throw new Error("Failed to fetch")
  }
  return response.json()
}

export default function MeetingsPage() {
  const { data: meetingsData, mutate } = useSWR("/api/meetings", fetcher, {
    revalidateOnFocus: false,
  })

  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [showScheduleForm, setShowScheduleForm] = useState(false)

  const meetings: Meeting[] = meetingsData?.meetings || []
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || null

  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled")
  const completedMeetings = meetings.filter((m) => m.status === "completed")
  const [showCompleted, setShowCompleted] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Meetings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage client meetings and minutes</p>
          </div>
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Meeting
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left: Meeting List (30%) */}
        <div className="w-72 border-r border-gray-200 overflow-y-auto">
          {/* Schedule Form */}
          {showScheduleForm && (
            <div className="border-b border-gray-200 p-6 space-y-4 bg-gray-50">
              <MeetingsScheduleForm
                onSuccess={() => {
                  setShowScheduleForm(false)
                  mutate()
                }}
                onCancel={() => setShowScheduleForm(false)}
              />
            </div>
          )}

          {/* Upcoming Meetings */}
          <div className="px-4 py-6">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Upcoming ({upcomingMeetings.length})
              </h2>
              <MeetingsList
                meetings={upcomingMeetings}
                selectedId={selectedMeetingId}
                onSelect={setSelectedMeetingId}
              />
            </div>
          </div>

          {/* Completed Meetings */}
          {completedMeetings.length > 0 && (
            <div className="px-4 pb-6 border-t border-gray-200 pt-6">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 w-full transition-colors"
              >
                Completed ({completedMeetings.length})
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform ml-auto",
                    showCompleted && "rotate-180"
                  )}
                />
              </button>
              {showCompleted && (
                <div className="mt-3 space-y-2">
                  <MeetingsList
                    meetings={completedMeetings}
                    selectedId={selectedMeetingId}
                    onSelect={setSelectedMeetingId}
                  />
                </div>
              )}
            </div>
          )}

          {meetings.length === 0 && !showScheduleForm && (
            <div className="px-4 py-12 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No meetings yet</p>
            </div>
          )}
        </div>

        {/* Right: Meeting Details Panel (70%) */}
        <div className="flex-1 overflow-y-auto">
          {selectedMeeting ? (
            <div className="flex gap-8 p-8 h-full">
              {/* Meeting Details */}
              <div className="flex-1">
                <MeetingsDetailsPanel meeting={selectedMeeting} onUpdate={mutate} />
              </div>

              {/* MOM Card */}
              <div className="flex-1">
                <MeetingsMomCard 
                  meeting={selectedMeeting} 
                  onUpdate={mutate}
                  onCreateActionItems={(summary, decisions) => {
                    console.log("[v0] Creating action items from MOM:", { summary, decisions })
                  }}
                  onCreateTask={(title, decision) => {
                    console.log("[v0] Creating task from action:", { title, decision })
                  }}
                  onAddToKnowledgeBase={(data) => {
                    console.log("[v0] Adding to knowledge base:", data)
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Select a meeting
                </h3>
                <p className="text-sm text-gray-600">
                  Choose a meeting to view details and minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
