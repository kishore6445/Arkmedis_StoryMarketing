import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Fetching today meetings...')
    const user = await getUserFromToken(request)
    if (!user) {
      console.log('[v0] Unauthorized - no user token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    console.log('[v0] Querying for meetings on:', todayStr)

    // Query meetings table for today
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr)
      .order('time', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching meetings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[v0] Found meetings for today:', meetings?.length || 0)

    // Group meetings by time period
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    const groupedMeetings = {
      happeningNow: [],
      startingSoon: [],
      later: []
    }

    meetings?.forEach(meeting => {
      if (!meeting.time) return
      
      const [hours, mins] = meeting.time.split(':').map(Number)
      const meetingTimeInMinutes = hours * 60 + mins
      const timeDiff = meetingTimeInMinutes - currentTimeInMinutes

      if (timeDiff >= -30 && timeDiff < 60) {
        // Within 30 mins before or 60 mins after
        groupedMeetings.happeningNow.push(meeting)
      } else if (timeDiff >= 60 && timeDiff < 360) {
        // 1-6 hours from now
        groupedMeetings.startingSoon.push(meeting)
      } else if (timeDiff >= 360) {
        // More than 6 hours away
        groupedMeetings.later.push(meeting)
      }
    })

    // Format response with grouping
    const response = {
      groups: [
        {
          status: 'happening_now',
          label: '🔴 Happening Now',
          count: groupedMeetings.happeningNow.length,
          meetings: groupedMeetings.happeningNow.map(m => ({
            id: m.id,
            title: m.title || m.client_id,
            date: m.date,
            time: m.time,
            status: m.status,
            attendees: m.attendees || []
          }))
        },
        {
          status: 'starting_soon',
          label: '🟡 Starting Soon',
          count: groupedMeetings.startingSoon.length,
          meetings: groupedMeetings.startingSoon.map(m => ({
            id: m.id,
            title: m.title || m.client_id,
            date: m.date,
            time: m.time,
            status: m.status,
            attendees: m.attendees || []
          }))
        },
        {
          status: 'later',
          label: '⏰ Later Today',
          count: groupedMeetings.later.length,
          meetings: groupedMeetings.later.map(m => ({
            id: m.id,
            title: m.title || m.client_id,
            date: m.date,
            time: m.time,
            status: m.status,
            attendees: m.attendees || []
          }))
        }
      ],
      summary: {
        totalMeetings: meetings?.length || 0,
        totalAttendees: meetings?.reduce((sum, m) => sum + (m.attendees?.length || 0), 0) || 0
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[v0] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
