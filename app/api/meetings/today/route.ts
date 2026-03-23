import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's meetings from the meeting_notes table
    const { data: meetings, error } = await supabase
      .from('meeting_notes')
      .select('*')
      .gte('date', today.toISOString().split('T')[0])
      .lt('date', tomorrow.toISOString().split('T')[0])
      .eq('status', 'scheduled')
      .order('time', { ascending: true });

    if (error) {
      console.error('[v0] Error fetching meetings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!meetings || meetings.length === 0) {
      return NextResponse.json({
        groups: [],
        summary: { totalMeetings: 0, totalAttendees: 0 }
      });
    }

    // Group meetings by time periods
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const happeningNow = meetings.filter(m => {
      const meetingTime = new Date(`${m.date}T${m.time}`);
      return meetingTime <= now && meetingTime > new Date(now.getTime() - 2 * 60 * 60 * 1000);
    });

    const imminent = meetings.filter(m => {
      const meetingTime = new Date(`${m.date}T${m.time}`);
      return meetingTime > now && meetingTime <= oneHourFromNow;
    });

    const later = meetings.filter(m => {
      const meetingTime = new Date(`${m.date}T${m.time}`);
      return meetingTime > oneHourFromNow;
    });

    const groups = [];

    if (happeningNow.length > 0) {
      groups.push({
        status: 'happening_now',
        label: 'Happening Now',
        count: happeningNow.length,
        meetings: happeningNow
      });
    }

    if (imminent.length > 0) {
      groups.push({
        status: 'imminent',
        label: 'Starting Soon',
        count: imminent.length,
        meetings: imminent
      });
    }

    if (later.length > 0) {
      groups.push({
        status: 'later',
        label: 'Later Today',
        count: later.length,
        meetings: later
      });
    }

    // Count total attendees
    const totalAttendees = meetings.reduce((sum, m) => {
      return sum + (m.attendees?.length || 0);
    }, 0);

    return NextResponse.json({
      groups,
      summary: {
        totalMeetings: meetings.length,
        totalAttendees
      }
    });
  } catch (error) {
    console.error('[v0] Meetings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
