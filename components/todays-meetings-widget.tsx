'use client'

import React, { useState } from 'react'
import { Clock, AlertCircle, Users, Bell, ChevronDown } from 'lucide-react'
import { useMeetingAlerts } from '@/hooks/use-meeting-alerts'
import { cn } from '@/lib/utils'

export function TodaysMeetingsWidget() {
  const { meetings, summary, isLoading, error } = useMeetingAlerts()
  const [expandedGroup, setExpandedGroup] = useState<string>('today')

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 mb-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Failed to load meetings: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!meetings || meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No meetings scheduled for today</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Today's Meetings</h3>
              <p className="text-sm text-gray-600">
                {summary?.totalMeetings || 0} meetings • {summary?.totalAttendees || 0} attendees
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{group.label}</span>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {group.count}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-500 transition-transform',
                  expandedGroup === group.status ? 'rotate-180' : ''
                )}
              />
            </button>

            {/* Group Content */}
            {expandedGroup === group.status && (
              <div className="px-6 py-4 bg-gray-50 space-y-3 border-t border-gray-100">
                {group.meetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {meeting.title || 'Untitled Meeting'}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {meeting.date} {meeting.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {meeting.attendees?.length || 0} attendees
                          </div>
                        </div>
                      </div>
                      {meeting.status === 'scheduled' && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded">
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
