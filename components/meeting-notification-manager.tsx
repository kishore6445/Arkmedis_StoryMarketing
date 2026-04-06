"use client"

import { useState, useEffect } from "react"
import { MeetingAlert } from "./meeting-alert"

interface MeetingData {
  id: string
  title: string
  clientName: string
  date: string
  time: string
  attendees?: Array<{ full_name: string }>
}

interface PendingAlert {
  id: string
  meetingId: string
  minutesBefore: number
  message: string
}

export function MeetingNotificationManager() {
  const [alerts, setAlerts] = useState<PendingAlert[]>([])
  const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set())
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingData[]>([])

  // Fetch upcoming meetings when component mounts (on login)
  useEffect(() => {
    const fetchUpcomingMeetings = async () => {
      try {
        const token = localStorage.getItem("sessionToken")
        const response = await fetch("/api/meetings?upcoming=true", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        })
        if (response.ok) {
          const meetings = await response.json()
          setUpcomingMeetings(meetings)
          
          // Check for meetings happening within the alert windows
          checkMeetingsOnLogin(meetings)
        }
      } catch (error) {
        console.error("Failed to fetch upcoming meetings:", error)
      }
    }

    fetchUpcomingMeetings()
  }, [])

  // Check every minute for upcoming meetings
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpcomingMeetings()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [upcomingMeetings])

  const checkMeetingsOnLogin = (meetings: MeetingData[]) => {
    const now = new Date()
    
    meetings.forEach((meeting) => {
      const meetingTime = new Date(`${meeting.date}T${meeting.time}`)
      const minutesUntilMeeting = Math.round((meetingTime.getTime() - now.getTime()) / 60000)

      // Show alert if meeting is within alert windows: 60, 30, 15, or 5 minutes
      if ([60, 30, 15, 5].includes(minutesUntilMeeting)) {
        showMeetingAlert(meeting, minutesUntilMeeting)
      } else if (minutesUntilMeeting > 0 && minutesUntilMeeting < 65) {
        // If meeting is coming up but not exactly on alert time, show it anyway
        showMeetingAlert(meeting, minutesUntilMeeting)
      }
    })
  }

  const checkForUpcomingMeetings = () => {
    const now = new Date()

    upcomingMeetings.forEach((meeting) => {
      const meetingTime = new Date(`${meeting.date}T${meeting.time}`)
      const minutesUntilMeeting = Math.round((meetingTime.getTime() - now.getTime()) / 60000)

      // Alert at specific intervals: 60, 30, 15, 5 minutes
      const alertTimes = [60, 30, 15, 5]
      
      alertTimes.forEach((alertTime) => {
        if (minutesUntilMeeting === alertTime) {
          const alertId = `${meeting.id}-${alertTime}`
          if (!shownAlerts.has(alertId)) {
            showMeetingAlert(meeting, alertTime)
            setShownAlerts((prev) => new Set(prev).add(alertId))
          }
        }
      })
    })
  }

  const showMeetingAlert = (meeting: MeetingData, minutesBefore: number) => {
    const alertId = `${meeting.id}-${Date.now()}`
    const newAlert: PendingAlert = {
      id: alertId,
      meetingId: meeting.id,
      minutesBefore,
      message: `Meeting in ${minutesBefore} minute${minutesBefore !== 1 ? "s" : ""}`,
    }

    setAlerts((prev) => [...prev, newAlert])

    // Auto-remove alert after it's been shown
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    }, 6000)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => {
        const meeting = upcomingMeetings.find((m) => m.id === alert.meetingId)
        if (!meeting) return null

        return (
          <MeetingAlert
            key={alert.id}
            title={`${meeting.title} - ${alert.message}`}
            clientName={meeting.clientName}
            date={meeting.date}
            time={meeting.time}
            attendees={meeting.attendees}
            onDismiss={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            autoCloseDuration={6000}
          />
        )
      })}
    </div>
  )
}
