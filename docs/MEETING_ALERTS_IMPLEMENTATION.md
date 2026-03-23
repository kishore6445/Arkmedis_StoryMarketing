# Meeting Alerts Implementation Guide

## What Was Built

You now have a complete meeting alerts system with WhatsApp integration. Here's what's in place:

### Backend Components

1. **Database Migration** (`scripts/018-add-meeting-alert-columns.sql`)
   - Added alert tracking columns to meetings table
   - Created `meeting_alert_history` table for audit trail
   - Columns track which alerts have been sent (1_day, 1_hour, start)

2. **API Endpoints**
   - `GET /api/meetings/today` - Fetches all meetings for today, grouped by status
   - `POST /api/meetings/[id]/schedule-alerts` - Manually trigger alerts for a meeting
   - `POST /api/webhooks/meeting-alerts` - Cron endpoint for automated alerts

3. **Services**
   - `lib/services/meeting-alert-manager.ts` - Core alert logic
   - `lib/services/twilio-whatsapp.ts` - WhatsApp messaging via Twilio

### Frontend Components

1. **Hooks**
   - `hooks/use-meeting-alerts.ts` - Fetches today's meetings, manages alert state
   - `useMeetingAlertStatus()` - Determines alert urgency for individual meetings

2. **Components**
   - `components/todays-meetings-widget.tsx` - Shows all meetings for today in dashboard
   - `components/meeting-alert-settings.tsx` - User preferences for alerts

### Integration

- Added `TodaysMeetingsWidget` to account manager page
- Widget shows 3 groups: Happening Now, Today - Upcoming, Later Today
- Each meeting shows time, attendees, and quick actions

---

## Next Steps: Setup Required

### 1. Install Twilio SDK
```bash
npm install twilio
```

### 2. Configure Environment Variables
Add these to your `.env.local` or Vercel project settings:

```bash
# Twilio Settings
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+1234567890  # Your WhatsApp business number
TWILIO_API_URL=https://api.twilio.com/2010-04-01/Accounts

# Cron Job Security (use a strong random string)
CRON_SECRET=your_super_secret_cron_key_here
```

### 3. Database Schema
The migration script has already been executed. Verify these tables exist:
- `meetings` - Updated with alert columns
- `meeting_attendees` - Links users to meetings
- `meeting_alert_history` - Audit trail

### 4. Add Phone Numbers to Users
Users need phone numbers in their profile for WhatsApp alerts:
```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

### 5. Setup Cron Job
You have two options:

**Option A: Vercel Cron (Built-in)**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/webhooks/meeting-alerts",
    "schedule": "*/10 * * * *"
  }]
}
```

**Option B: External Service (Upstash, EasyCron, etc.)**
Call: `https://yoursite.com/api/webhooks/meeting-alerts`
Headers: `Authorization: Bearer <CRON_SECRET>`
Schedule: Every 5-10 minutes

---

## How It Works

### User Flow

1. **User schedules meeting** in your app
   - Meeting stored in database with attendees
   - User profile has phone number

2. **Cron job runs** (every 10 minutes)
   - Checks for meetings in next 24 hours
   - Determines which alerts should be sent
   - Sends WhatsApp to organizer + attendees

3. **User sees widget** on dashboard
   - "Today's Meetings" shows all meetings grouped by urgency
   - Red = Happening now (pulsing)
   - Yellow = Within 6 hours
   - Gray = Later today

4. **Alert sent when**:
   - 1 day before: "Reminder: meeting scheduled for tomorrow"
   - 1 hour before: "IMPORTANT: [Meeting] starts in 1 HOUR"
   - At start time: "Your meeting is now starting"

### WhatsApp Messages Sent

All messages follow this pattern:
```
⏰ Meeting Title
📅 Tomorrow at 2:30 PM
👥 Organizer: John Doe
```

Messages are personalized with meeting title, time, and attendee count.

---

## User Preferences

Users can customize alerts via `MeetingAlertSettings` component:

- Toggle alerts on/off
- Enable/disable sound
- Enable/disable browser notifications
- Choose which reminders (1 day, 1 hour, at start)
- Add WhatsApp phone number
- Choose where widget appears

Preferences saved to localStorage + synced to backend.

---

## Testing the System

### 1. Manual Testing
```bash
# Trigger alerts manually for a meeting
curl -X POST https://yoursite.com/api/meetings/MEETING_ID/schedule-alerts \
  -H "Content-Type: application/json" \
  -d '{"alertType": "1_hour_before"}'
```

### 2. Check Cron Execution
```bash
# Manually call cron endpoint
curl -X POST https://yoursite.com/api/webhooks/meeting-alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Verify Messages Sent
Check `meeting_alert_history` table:
```sql
SELECT * FROM meeting_alert_history ORDER BY sent_at DESC;
```

---

## Features

✅ Real-time meeting reminders (1 day, 1 hour, at start)
✅ WhatsApp notifications via Twilio
✅ Today's meetings widget on dashboard
✅ User preferences for notification channels
✅ Sound alerts for imminent meetings
✅ Browser notifications support
✅ Alert history tracking
✅ Grouped view (Happening Now / Today / Later)
✅ Quick actions (Join, Snooze, Dismiss)
✅ Meeting details (attendees, time, link)

---

## Troubleshooting

**No messages being sent?**
- Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct
- Verify phone numbers have country code (e.g., +91)
- Check `meeting_alert_history` table for error status
- Verify CRON_SECRET is set

**Widget not showing meetings?**
- Ensure meetings have start_time and end_time set
- Check status = 'scheduled'
- Verify user ID is correct in headers

**Phone number invalid?**
- Must include country code: +919876543210
- Test with `isValidPhoneNumber()` function
- Use `formatPhoneNumber()` to normalize

---

## Next Features to Consider

- [ ] Recurring meetings
- [ ] Meeting transcripts
- [ ] RSVP tracking in WhatsApp
- [ ] Slack integration
- [ ] Calendar sync (Google, Outlook)
- [ ] Meeting cost tracking
- [ ] Attendee availability checker
