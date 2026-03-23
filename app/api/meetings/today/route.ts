import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { TodaysMeetingGroup, MeetingWithAttendees } from '@/lib/types/meeting-alerts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get current user ID from headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's meetings where user is organizer or attendee
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_attendees (
          id,
          user_id,
          rsvp_status,
          created_at,
          updated_at
        )
      `)
      .eq('status', 'scheduled')
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .or(`organizer_id.eq.${userId},meeting_attendees.user_id.eq.${userId}`)
      .order('start_time', { ascending: true });

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      return NextResponse.json({ error: meetingsError.message }, { status: 500 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Group meetings by status
    const happeningNow: MeetingWithAttendees[] = [];
    const todayUpcoming: MeetingWithAttendees[] = [];
    const upcoming: MeetingWithAttendees[] = [];

    meetings?.forEach((meeting: any) => {
      const startTime = new Date(meeting.start_time);
      const endTime = new Date(meeting.end_time);
      
      const meetingWithAttendees: MeetingWithAttendees = {
        ...meeting,
        attendees: meeting.meeting_attendees || [],
        attendee_count: meeting.meeting_attendees?.length || 0,
        confirmed_count: meeting.meeting_attendees?.filter((a: any) => a.rsvp_status === 'confirmed').length || 0
      };

      if (now >= startTime && now <= endTime) {
        happeningNow.push(meetingWithAttendees);
      } else if (startTime <= sixHoursFromNow) {
        todayUpcoming.push(meetingWithAttendees);
      } else {
        upcoming.push(meetingWithAttendees);
      }
    });

    const groupedMeetings: TodaysMeetingGroup[] = [];

    if (happeningNow.length > 0) {
      groupedMeetings.push({
        status: 'happening_now',
        label: 'Happening Now',
        meetings: happeningNow,
        count: happeningNow.length
      });
    }

    if (todayUpcoming.length > 0) {
      groupedMeetings.push({
        status: 'today',
        label: 'Today - Upcoming',
        meetings: todayUpcoming,
        count: todayUpcoming.length
      });
    }

    if (upcoming.length > 0) {
      groupedMeetings.push({
        status: 'upcoming',
        label: 'Later Today',
        meetings: upcoming,
        count: upcoming.length
      });
    }

    const totalMeetings = happeningNow.length + todayUpcoming.length + upcoming.length;
    const totalAttendees = meetings?.reduce((sum: number, m: any) => sum + (m.meeting_attendees?.length || 0), 0) || 0;
    const totalDuration = meetings?.reduce((sum: number, m: any) => {
      const start = new Date(m.start_time);
      const end = new Date(m.end_time);
      return sum + ((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }, 0) || 0;

    return NextResponse.json({
      grouped: groupedMeetings,
      summary: {
        totalMeetings,
        totalAttendees,
        totalHours: Math.round(totalDuration * 10) / 10,
        today
      }
    });

  } catch (error) {
    console.error('Error in /api/meetings/today:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
