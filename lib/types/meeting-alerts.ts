export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
export type AlertType = 'scheduled' | '1_day_before' | '1_hour_before' | 'started' | 'cancelled' | 'rescheduled';
export type AlertSendVia = 'whatsapp' | 'toast' | 'both';
export type AlertStatus = 'sent' | 'failed' | 'dismissed';

export interface Meeting {
  id: string;
  team_id: string;
  organizer_id: string;
  title: string;
  description?: string | null;
  date: string; // YYYY-MM-DD format
  start_time: string; // ISO 8601 timestamp
  end_time: string; // ISO 8601 timestamp
  meeting_url?: string | null; // Zoom/Teams/Google Meet link
  status: MeetingStatus;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
  // Alert tracking
  alert_1_day_sent: boolean;
  alert_1_hour_sent: boolean;
  alert_start_sent: boolean;
  alert_dismissed_by_user: boolean;
  dismissed_at?: string | null;
  last_alert_at?: string | null;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  user_id: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface MeetingAlertHistory {
  id: string;
  meeting_id: string;
  user_id: string;
  alert_type: AlertType;
  sent_via: AlertSendVia;
  status: AlertStatus;
  sent_at: string;
  created_at: string;
}

export interface TodaysMeetingGroup {
  status: 'happening_now' | 'today' | 'upcoming';
  label: string;
  meetings: MeetingWithAttendees[];
  count: number;
}

export interface MeetingWithAttendees extends Meeting {
  attendees: MeetingAttendee[];
  attendee_count: number;
  confirmed_count: number;
}

export interface MeetingAlertPayload {
  meeting_id: string;
  alert_type: AlertType;
  recipient_phone: string;
  recipient_name: string;
  message: string;
  title: string;
  time: string;
}
