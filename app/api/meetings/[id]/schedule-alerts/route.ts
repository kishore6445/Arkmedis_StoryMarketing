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
import { AlertType } from '@/lib/types/meeting-alerts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meetingId = params.id;
    const { alertType } = await request.json() as { alertType: AlertType };

    // Fetch meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Check if alert should be sent
    const shouldSend = await shouldSendAlert(meeting, alertType);
    if (!shouldSend) {
      return NextResponse.json(
        { message: 'Alert not due yet' },
        { status: 200 }
      );
    }

    // Get alert message
    const { message, title } = await formatMeetingAlertMessage(meeting, alertType);

    // Get organizer and attendees
    const organizer = await getMeetingOrganizer(meeting.organizer_id);
    const attendees = await getMeetingAttendees(meetingId);

    // Collect all recipients
    const recipients: any[] = [];
    
    if (organizer?.phone_number) {
      recipients.push({
        ...organizer,
        phone: organizer.phone_number,
        userId: organizer.id
      });
    }

    attendees.forEach((attendee: any) => {
      if (attendee.users?.phone_number) {
        recipients.push({
          ...attendee.users,
          phone: attendee.users.phone_number,
          userId: attendee.users.id
        });
      }
    });

    // Send WhatsApp messages to all recipients
    const sentAlerts = [];
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        // Call Twilio WhatsApp API
        const whatsappResponse = await fetch(
          `${process.env.TWILIO_API_URL}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(
                `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
              ).toString('base64')}`
            },
            body: new URLSearchParams({
              From: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
              To: `whatsapp:${recipient.phone}`,
              Body: `${title}\n\n${message}`
            }).toString()
          }
        );

        if (whatsappResponse.ok) {
          const data = await whatsappResponse.json();
          sentAlerts.push({
            recipientId: recipient.userId,
            sid: data.sid,
            status: 'sent'
          });

          // Record in alert history
          await recordAlertInHistory(
            meetingId,
            recipient.userId,
            alertType,
            'sent'
          );
        } else {
          failedCount++;
          await recordAlertInHistory(
            meetingId,
            recipient.userId,
            alertType,
            'failed'
          );
        }
      } catch (error) {
        console.error(`Error sending WhatsApp to ${recipient.phone}:`, error);
        failedCount++;
        await recordAlertInHistory(
          meetingId,
          recipient.userId,
          alertType,
          'failed'
        );
      }
    }

    // Mark alert as sent in meetings table
    if (sentAlerts.length > 0) {
      await markAlertSent(meetingId, alertType);
    }

    return NextResponse.json({
      success: true,
      sent: sentAlerts.length,
      failed: failedCount,
      message: `Alert sent to ${sentAlerts.length} recipients`
    });

  } catch (error) {
    console.error('Error scheduling meeting alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
