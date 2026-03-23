'use client'

import React, { useState } from 'react'
import { Clock, AlertCircle, CheckCircle2, Users, ExternalLink, Bell } from 'lucide-react'
import { useMeetingAlerts, useMeetingAlertStatus } from '@/hooks/use-meeting-alerts'
import { MeetingWithAttendees } from '@/lib/types/meeting-alerts'
import { cn } from '@/lib/utils'

export function TodaysMeetingsWidget() {
  const { meetings, summary, isLoading, dismissedAlerts, dismissAlert, snoozeAlert, triggerMeetingAlert } = useMeetingAlerts()
  const [expandedGroup, setExpandedGroup] = useState<string>('happening_now')
  const [showingAlertModal, setShowingAlertModal] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No meetings scheduled for today</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Today's Meetings</h3>
              <p className="text-sm text-gray-600">
                {summary?.totalMeetings} meetings • {summary?.totalAttendees} attendees • {summary?.totalHours}h total
              </p>
            </div>
          </div>
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Meeting Groups */}
      <div className="divide-y divide-gray-200">
        {meetings.map((group) => (
          <div key={group.status} className="bg-white">
            {/* Group Header */}
            <button
              onClick={() => setExpandedGroup(expandedGroup === group.status ? '' : group.status)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  group.status === 'happening_now' ? 'bg-red-500' :
                  group.status === 'today' ? 'bg-yellow-500' :
                  'bg-gray-400'
                )} />
                <span className="font-medium text-gray-900">{group.label}</span>
                <span className="text-sm text-gray-600">({group.count})</span>
              </div>
              <ChevronIcon expanded={expandedGroup === group.status} />
            </button>

            {/* Meeting Items */}
            {expandedGroup === group.status && (
              <div className="divide-y divide-gray-100">
                {group.meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    status={group.status}
                    isDismissed={dismissedAlerts.has(meeting.id)}
                    onDismiss={() => dismissAlert(meeting.id)}
                    onSnooze={() => snoozeAlert(meeting.id, 30)}
                    onShowAlert={() => setShowingAlertModal(meeting.id)}
                    onTriggerAlert={() => triggerMeetingAlert(meeting.id, '1_hour_before')}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Alert Modal for Imminent Meetings */}
      {showingAlertModal && (
        <ImmediateMeetingAlert
          meetingId={showingAlertModal}
          meetings={meetings}
          onClose={() => setShowingAlertModal(null)}
          onDismiss={(id) => {
            dismissAlert(id)
            setShowingAlertModal(null)
          }}
        />
      )}
    </div>
  )
}

function MeetingCard({
  meeting,
  status,
  isDismissed,
  onDismiss,
  onSnooze,
  onShowAlert,
  onTriggerAlert
}: {
  meeting: MeetingWithAttendees
  status: string
  isDismissed: boolean
  onDismiss: () => void
  onSnooze: () => void
  onShowAlert: () => void
  onTriggerAlert: () => void
}) {
  const alertStatus = useMeetingAlertStatus(meeting)
  const startTime = new Date(meeting.start_time)
  const timeStr = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  if (isDismissed) return null

  return (
    <div className={cn(
      'px-6 py-4 hover:bg-gray-50 transition-colors',
      alertStatus.needsUrgentAction ? 'bg-red-50 border-l-4 border-red-500' :
      status === 'today' ? 'bg-yellow-50' :
      ''
    )}>
      <div className="flex items-start justify-between gap-4">
        {/* Meeting Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            {alertStatus.needsUrgentAction && (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={cn(
                'font-semibold truncate',
                alertStatus.needsUrgentAction ? 'text-red-900' : 'text-gray-900'
              )}>
                {meeting.title}
              </h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {timeStr}
                </span>
                {alertStatus.minutesUntilStart > 0 && (
                  <span className={cn(
                    'font-medium',
                    alertStatus.needsUrgentAction ? 'text-red-600' : 'text-gray-600'
                  )}>
                    in {alertStatus.minutesUntilStart} min
                  </span>
                )}
              </div>

              {/* Attendees Summary */}
              <div className="flex items-center gap-2 mt-3">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {meeting.confirmed_count}/{meeting.attendee_count} confirmed
                </span>
              </div>

              {/* Meeting Link */}
              {meeting.meeting_url && (
                <div className="mt-3">
                  <a
                    href={meeting.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Join Meeting
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2">
          {alertStatus.needsUrgentAction && (
            <button
              onClick={onShowAlert}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            >
              Alert
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onSnooze}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Snooze 30 min"
            >
              Snooze
            </button>
            <button
              onClick={onDismiss}
              className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImmediateMeetingAlert({
  meetingId,
  meetings,
  onClose,
  onDismiss
}: {
  meetingId: string
  meetings: any[]
  onClose: () => void
  onDismiss: (id: string) => void
}) {
  const meeting = meetings
    .flatMap((g) => g.meetings)
    .find((m: any) => m.id === meetingId)

  if (!meeting) return null

  const startTime = new Date(meeting.start_time)
  const endTime = new Date(meeting.end_time)
  const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border-l-4 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Meeting Starting Soon!</h3>
              <p className="text-sm text-red-700">in {Math.round((startTime.getTime() - Date.now()) / (1000 * 60))} minutes</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <h4 className="text-lg font-bold text-gray-900">{meeting.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Start Time:</span>
              <span className="font-medium">{startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{durationMinutes} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Attendees:</span>
              <span className="font-medium">{meeting.confirmed_count}/{meeting.attendee_count}</span>
            </div>
          </div>

          {meeting.meeting_url && (
            <a
              href={meeting.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Join Meeting Now
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex gap-3">
          <button
            onClick={() => {
              onDismiss(meetingId)
              onClose()
            }}
            className="flex-1 px-3 py-2 text-gray-700 hover:bg-gray-200 rounded transition-colors font-medium"
          >
            Dismiss
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded transition-colors font-medium"
          >
            Keep Showing
          </button>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={cn('w-5 h-5 transition-transform', expanded && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )
}
