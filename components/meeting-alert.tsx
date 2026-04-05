"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X, Calendar, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface MeetingAlertProps {
  title: string
  clientName: string
  date: string
  time: string
  attendees?: Array<{ full_name: string }>
  onDismiss?: () => void
  autoCloseDuration?: number // in milliseconds
}

export function MeetingAlert({
  title,
  clientName,
  date,
  time,
  attendees = [],
  onDismiss,
  autoCloseDuration = 8000,
}: MeetingAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoCloseDuration)

      return () => clearTimeout(timer)
    }
  }, [autoCloseDuration])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  // Format the date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-blue-200 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Meeting Scheduled</h3>
              <p className="text-sm text-blue-700 mt-0.5">{clientName}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-600 hover:text-blue-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-3">
          {/* Meeting Title */}
          {title && (
            <div className="text-sm">
              <p className="font-medium text-gray-900">{title}</p>
            </div>
          )}

          {/* Meeting Details Grid */}
          <div className="space-y-2">
            {/* Date */}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700">{formattedDate}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-700">{time}</span>
            </div>

            {/* Attendees */}
            {attendees.length > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-gray-700">
                  <p className="font-medium mb-1">{attendees.length} attendee{attendees.length > 1 ? "s" : ""}</p>
                  <div className="space-y-1">
                    {attendees.slice(0, 3).map((attendee, index) => (
                      <p key={index} className="text-xs text-gray-600">
                        • {attendee.full_name}
                      </p>
                    ))}
                    {attendees.length > 3 && (
                      <p className="text-xs text-gray-600">• +{attendees.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 flex gap-2 border-t border-gray-100">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            Dismiss
          </button>
          <a
            href="/meetings"
            className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors text-center"
          >
            View Meeting
          </a>
        </div>
      </div>
    </div>
  )
}
