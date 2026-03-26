import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  shouldSendAlert,
  formatMeetingAlertMessage,
  recordAlertInHistory,
  markAlertSent,
  getMeetingAttendees,
  getMeetingOrganizer
} from '@/lib/services/meeting-alert-manager';
import {
  sendMeetingReminderWhatsApp,
  formatPhoneNumber,
  isValidPhoneNumber
} from '@/lib/services/twilio-whatsapp';
import { AlertType } from '@/lib/types/meeting-alerts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * This endpoint should be called by a cron job (e.g., every 5-10 minutes)
 * to check for meetings that need alerts and send them
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fetch all scheduled meetings
    const { data: meetings, error: fetchError } = await supabase
      .from('meetings')
      .select(`
        *,
        meeting_attendees (
          id,
          user_id,
          rsvp_status,
          users (
            id,
            email,
            full_name,
            phone_number
          )
        ),
        organizer:users (
          id,
          email,
          full_name,
          phone_number
        )
      `)
      .eq('status', 'scheduled')
      .gte('start_time', now.toISOString())
      .lte('start_time', oneDayFromNow.toISOString());

    if (fetchError) {
      console.error('Error fetching meetings:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let sentCount = 0;
    let failedCount = 0;

    // Process each meeting
    for (const meeting of meetings || []) {
      const startTime = new Date(meeting.start_time);
      const minutesUntilStart = Math.round((startTime.getTime() - now.getTime()) / (1000 * 60));

      // Determine which alert types should be sent
      const alertTypesToSend: AlertType[] = [];

      if (minutesUntilStart >= 1410 && minutesUntilStart <= 1450 && !meeting.alert_1_day_sent) {
        alertTypesToSend.push('1_day_before');
      }

      if (minutesUntilStart >= 50 && minutesUntilStart <= 70 && !meeting.alert_1_hour_sent) {
        alertTypesToSend.push('1_hour_before');
      }

      if (minutesUntilStart >= -5 && minutesUntilStart <= 5 && !meeting.alert_start_sent) {
        alertTypesToSend.push('started');
      }

      // Send alerts for this meeting
      for (const alertType of alertTypesToSend) {
        try {
          // Get all recipients (organizer + attendees)
          const recipients: any[] = [];

          // Add organizer
          if (meeting.users?.phone_number) {
            const phone = formatPhoneNumber(meeting.users.phone_number);
            if (isValidPhoneNumber(phone)) {
              recipients.push({
                userId: meeting.users.id,
                phone,
                name: meeting.users.full_name || meeting.users.email
              });
            }
          }

          // Add attendees
          if (meeting.meeting_attendees) {
            meeting.meeting_attendees.forEach((attendee: any) => {
              if (attendee.users?.phone_number) {
                const phone = formatPhoneNumber(attendee.users.phone_number);
                if (isValidPhoneNumber(phone)) {
                  recipients.push({
                    userId: attendee.users.id,
                    phone,
                    name: attendee.users.full_name || attendee.users.email
                  });
                }
              }
            });
          }

          // Send WhatsApp to each recipient
          for (const recipient of recipients) {
            try {
              const result = await sendMeetingReminderWhatsApp(
                recipient.phone,
                meeting.title,
                startTime,
                minutesUntilStart
              );

              if (result.success) {
                sentCount++;
                await recordAlertInHistory(
                  meeting.id,
                  recipient.userId,
                  alertType,
                  'sent'
                );
              } else {
                failedCount++;
                await recordAlertInHistory(
                  meeting.id,
                  recipient.userId,
                  alertType,
                  'failed'
                );
              }
            } catch (error) {
              console.error(`Error sending WhatsApp to ${recipient.phone}:`, error);
              failedCount++;
            }
          }

          // Mark alert as sent in meetings table
          await markAlertSent(meeting.id, alertType);

        } catch (error) {
          console.error(`Error processing alert type ${alertType}:`, error);
          failedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      processedMeetings: meetings?.length || 0,
      message: `Processed ${meetings?.length || 0} meetings, sent ${sentCount} alerts, ${failedCount} failed`
    });

  } catch (error) {
    console.error('Error in meeting alerts cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
