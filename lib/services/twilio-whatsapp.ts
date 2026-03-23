import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface WhatsAppMessage {
  to: string; // Phone number with country code (e.g., +919876543210)
  body: string;
  mediaUrl?: string;
}

export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<{
  success: boolean;
  sid?: string;
  error?: string;
}> {
  try {
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      throw new Error('TWILIO_WHATSAPP_NUMBER not configured');
    }

    const result = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${message.to}`,
      body: message.body,
      ...(message.mediaUrl && { mediaUrl: message.mediaUrl })
    });

    return {
      success: true,
      sid: result.sid
    };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendMeetingReminderWhatsApp(
  phoneNumber: string,
  meetingTitle: string,
  startTime: Date,
  minutesUntilStart: number
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const timeStr = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let body = '';

  if (minutesUntilStart === 1440) {
    // 1 day before
    body = `🔔 Reminder: Your meeting "${meetingTitle}" is scheduled for tomorrow at ${timeStr}.`;
  } else if (minutesUntilStart === 60) {
    // 1 hour before
    body = `⏰ IMPORTANT: "${meetingTitle}" starts in 1 HOUR at ${timeStr}. Get ready!`;
  } else if (minutesUntilStart === 0 || minutesUntilStart < 0) {
    // Meeting is starting now
    body = `▶️ Your meeting "${meetingTitle}" is now starting at ${timeStr}. Join now!`;
  } else {
    body = `🔔 Reminder: Your meeting "${meetingTitle}" starts in ${minutesUntilStart} minutes at ${timeStr}.`;
  }

  return sendWhatsAppMessage({
    to: phoneNumber,
    body
  });
}

export async function sendMeetingCancellationWhatsApp(
  phoneNumber: string,
  meetingTitle: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  return sendWhatsAppMessage({
    to: phoneNumber,
    body: `❌ Your meeting "${meetingTitle}" has been cancelled. Please refer to your email for more information.`
  });
}

export async function sendMeetingRescheduledWhatsApp(
  phoneNumber: string,
  meetingTitle: string,
  newStartTime: Date
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const dateStr = newStartTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const timeStr = newStartTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return sendWhatsAppMessage({
    to: phoneNumber,
    body: `📅 Your meeting "${meetingTitle}" has been rescheduled to ${dateStr} at ${timeStr}.`
  });
}

export async function sendMeetingInvitationWhatsApp(
  phoneNumber: string,
  meetingTitle: string,
  startTime: Date,
  organizer: string,
  meetingUrl?: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const dateStr = startTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const timeStr = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let body = `📋 Meeting Invitation\n\n"${meetingTitle}"\n${dateStr} at ${timeStr}\n\nOrganizer: ${organizer}`;

  if (meetingUrl) {
    body += `\n\n🔗 Join: ${meetingUrl}`;
  }

  return sendWhatsAppMessage({
    to: phoneNumber,
    body
  });
}

// Validate phone number format (international format required)
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Phone number should start with + and be between 10-15 digits
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
}

// Format phone number to international format
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');

  // Add + if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  return cleaned;
}
