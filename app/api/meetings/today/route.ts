import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MeetingWithAttendees {
  id: string;
  title?: string;
  client_id?: string;
  date: string;
  time: string;
  attendees: Array<{ id: string; full_name: string; email: string }>;
  status: string;
  meeting_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface TodaysMeetingGroup {
  status: 'happening_now' | 'today' | 'later';
  label: string;
  meetings: MeetingWithAttendees[];
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[v0] No authorization header provided for meetings/today');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[v0] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[v0] Fetching today\'s meetings for user:', user.id);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    // Fetch meetings for today
    const { data: meetings, error: meetingsError } = await supabase
      .from('meeting_notes')
      .select(`
        id,
        title,
        client_id,
        meeting_date,
        attendees,
        notes,
        created_by,
        created_at,
        updated_at,
        status
      `)
      .eq('meeting_date', todayString)
      .order('created_at', { ascending: true });

    if (meetingsError) {
      console.error('[v0] Error fetching meetings:', meetingsError);
      return NextResponse.json({ error: meetingsError.message }, { status: 500 });
    }

    console.log('[v0] Found today\'s meetings:', meetings?.length || 0);

    // If no meetings found from meeting_notes, try to fetch from any meetings table
    if (!meetings || meetings.length === 0) {
      return NextResponse.json({
        groups: [],
        summary: {
          totalMeetings: 0,
          totalAttendees: 0,
          totalHours: 0
        }
      });
    }

    // Transform meeting_notes to meeting format with estimated times
    const transformedMeetings: MeetingWithAttendees[] = meetings.map((m: any) => ({
      id: m.id,
      title: m.title,
      client_id: m.client_id,
      date: m.meeting_date,
      time: '10:00', // Default time if not specified
      attendees: Array.isArray(m.attendees) ? m.attendees.map((name: string) => ({
        id: '',
        full_name: name,
        email: ''
      })) : [],
      status: m.status || 'scheduled'
    }));

    // For now, group all as 'today' since they're all scheduled for today
    const groups: TodaysMeetingGroup[] = [];
    
    if (transformedMeetings.length > 0) {
      groups.push({
        status: 'today',
        label: 'Today\'s Meetings',
        meetings: transformedMeetings,
        count: transformedMeetings.length
      });
    }

    const totalAttendees = transformedMeetings.reduce((sum, m) => sum + m.attendees.length, 0);

    return NextResponse.json({
      groups,
      summary: {
        totalMeetings: transformedMeetings.length,
        totalAttendees,
        totalHours: transformedMeetings.length * 0.5 // Estimate 30 min per meeting
      }
    });

  } catch (error) {
    console.error('[v0] Error in meetings/today:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
