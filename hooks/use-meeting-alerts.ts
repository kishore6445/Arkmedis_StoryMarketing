'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees?: any[]
  status?: string
  [key: string]: any
}

interface MeetingGroup {
  status: string
  label: string
  count: number
  meetings: Meeting[]
}

interface MeetingsSummary {
  totalMeetings: number
  totalAttendees: number
}

const fetcher = async (url: string) => {
  try {
    const token = localStorage.getItem('sessionToken') || ''
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Meeting API error:', error)
      throw new Error(error.error || 'Failed to fetch meetings')
    }

    const data = await response.json()
    console.log('[v0] Fetched meetings:', data)
    return data
  } catch (err) {
    console.error('[v0] Fetcher error:', err)
    throw err
  }
}

export function useMeetingAlerts() {
  const [meetings, setMeetings] = useState<MeetingGroup[] | undefined>()
  const [summary, setSummary] = useState<MeetingsSummary | undefined>()

  // Fetch today's meetings every 30 seconds
  const { data, error, isLoading } = useSWR(
    '/api/meetings/today',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  // Process fetched data
  useEffect(() => {
    if (data) {
      console.log('[v0] Processing meeting data:', data)
      setMeetings(data.groups || [])
      setSummary(data.summary || { totalMeetings: 0, totalAttendees: 0 })
    }
  }, [data])

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('[v0] Meeting alerts hook error:', error.message)
    }
  }, [error])

  return {
    meetings,
    summary,
    isLoading,
    error
  }
}
