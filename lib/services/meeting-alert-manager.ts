import { createClient } from '@supabase/supabase-js';
import { AlertType, MeetingAlertPayload } from '@/lib/types/meeting-alerts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function calculateMeetingStatus(startTime: Date, endTime: Date) {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  if (now >= startTime && now <= endTime) {
    return 'happening_now';
  } else if (startTime <= oneHourFromNow) {
    return 'imminent'; // Within 1 hour
  } else if (startTime.toDateString() === now.toDateString()) {
    return 'today';
  } else {
    return 'upcoming';
  }
}

export async function shouldSendAlert(
  meeting: any,
  alertType: AlertType
): Promise<boolean> {
  const now = new Date();
  const startTime = new Date(meeting.start_time);
  const oneDayBefore = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);

  // Check if alert has already been sent
  if (alertType === '1_day_before' && meeting.alert_1_day_sent) {
    return false;
  }
  if (alertType === '1_hour_before' && meeting.alert_1_hour_sent) {
    return false;
  }
  if (alertType === 'started' && meeting.alert_start_sent) {
    return false;
  }

  // Check if alert should be sent based on current time
  if (alertType === '1_day_before' && now >= oneDayBefore && now < oneHourBefore) {
    return true;
  }
  if (alertType === '1_hour_before' && now >= oneHourBefore && now < startTime) {
    return true;
  }
  if (alertType === 'started' && now >= startTime) {
    return true;
  }

  return false;
}

export async function formatMeetingAlertMessage(
  meeting: any,
  alertType: AlertType
): Promise<{ message: string; title: string }> {
  const startTime = new Date(meeting.start_time);
  const timeStr = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  switch (alertType) {
    case '1_day_before':
      return {
        title: `Reminder: ${meeting.title}`,
        message: `Your meeting "${meeting.title}" is scheduled for tomorrow at ${timeStr}.`
      };
    case '1_hour_before':
      return {
        title: `IMPORTANT: ${meeting.title} in 1 HOUR`,
        message: `⏰ Your meeting "${meeting.title}" starts in 1 hour at ${timeStr}. Get ready!`
      };
    case 'started':
      return {
        title: `Meeting Started: ${meeting.title}`,
        message: `Your meeting "${meeting.title}" is now starting. ${meeting.meeting_url ? 'Join here: ' + meeting.meeting_url : ''}`
      };
    case 'scheduled':
      return {
        title: `New Meeting: ${meeting.title}`,
        message: `You've been invited to "${meeting.title}" on ${startTime.toDateString()} at ${timeStr}.`
      };
    case 'cancelled':
      return {
        title: `Cancelled: ${meeting.title}`,
        message: `Your meeting "${meeting.title}" has been cancelled.`
      };
    case 'rescheduled':
      return {
        title: `Rescheduled: ${meeting.title}`,
        message: `Your meeting "${meeting.title}" has been rescheduled to ${startTime.toDateString()} at ${timeStr}.`
      };
    default:
      return {
        title: meeting.title,
        message: `Meeting: ${meeting.title}`
      };
  }
}

export async function recordAlertInHistory(
  meetingId: string,
  userId: string,
  alertType: AlertType,
  status: 'sent' | 'failed' | 'dismissed'
) {
  try {
    const { error } = await supabase
      .from('meeting_alert_history')
      .insert({
        meeting_id: meetingId,
        user_id: userId,
        alert_type: alertType,
        sent_via: 'whatsapp',
        status,
        sent_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error recording alert history:', error);
    }
  } catch (error) {
    console.error('Error in recordAlertInHistory:', error);
  }
}

export async function markAlertSent(
  meetingId: string,
  alertType: AlertType
) {
  try {
    const updateData: any = {};

    if (alertType === '1_day_before') {
      updateData.alert_1_day_sent = true;
    } else if (alertType === '1_hour_before') {
      updateData.alert_1_hour_sent = true;
    } else if (alertType === 'started') {
      updateData.alert_start_sent = true;
    }

    updateData.last_alert_at = new Date().toISOString();

    const { error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', meetingId);

    if (error) {
      console.error('Error marking alert as sent:', error);
    }
  } catch (error) {
    console.error('Error in markAlertSent:', error);
  }
}

export async function getMeetingAttendees(meetingId: string) {
  try {
    const { data: attendees, error } = await supabase
      .from('meeting_attendees')
      .select(`
        id,
        user_id,
        rsvp_status,
        users (
          id,
          email,
          full_name,
          phone_number
        )
      `)
      .eq('meeting_id', meetingId);

    if (error) {
      console.error('Error fetching attendees:', error);
      return [];
    }

    return attendees || [];
  } catch (error) {
    console.error('Error in getMeetingAttendees:', error);
    return [];
  }
}

export async function getMeetingOrganizer(organizerId: string) {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone_number')
      .eq('id', organizerId)
      .single();

    if (error) {
      console.error('Error fetching organizer:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getMeetingOrganizer:', error);
    return null;
  }
}
