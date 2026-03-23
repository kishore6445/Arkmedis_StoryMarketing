import { useState, useEffect, useCallback } from 'react';
import { TodaysMeetingGroup, MeetingWithAttendees } from '@/lib/types/meeting-alerts';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'x-user-id': localStorage.getItem('user_id') || ''
    }
  });
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

export function useMeetingAlerts() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [snoozedAlerts, setSnoozedAlerts] = useState<Map<string, Date>>(new Map());

  // Fetch today's meetings every 30 seconds
  const { data, error, isLoading, mutate } = useSWR(
    '/api/meetings/today',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Load dismissed and snoozed alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('meeting_alerts_dismissed');
    if (stored) {
      setDismissedAlerts(new Set(JSON.parse(stored)));
    }

    const storedSnoozed = localStorage.getItem('meeting_alerts_snoozed');
    if (storedSnoozed) {
      const entries = JSON.parse(storedSnoozed);
      const map = new Map(entries);
      setSnoozedAlerts(map);
    }
  }, []);

  // Save dismissed alerts to localStorage
  const dismissAlert = useCallback((meetingId: string) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(meetingId);
    setDismissedAlerts(newDismissed);
    localStorage.setItem('meeting_alerts_dismissed', JSON.stringify(Array.from(newDismissed)));
  }, [dismissedAlerts]);

  // Snooze alert for specified minutes
  const snoozeAlert = useCallback((meetingId: string, minutes: number = 30) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    const newSnoozed = new Map(snoozedAlerts);
    newSnoozed.set(meetingId, snoozeUntil);
    setSnoozedAlerts(newSnoozed);
    localStorage.setItem(
      'meeting_alerts_snoozed',
      JSON.stringify(Array.from(newSnoozed.entries()))
    );
  }, [snoozedAlerts]);

  // Check if snooze has expired
  const isSnoozeExpired = useCallback((meetingId: string): boolean => {
    const snoozeUntil = snoozedAlerts.get(meetingId);
    if (!snoozeUntil) return false;
    return new Date() > snoozeUntil;
  }, [snoozedAlerts]);

  // Trigger alert to backend (sends WhatsApp)
  const triggerMeetingAlert = useCallback(async (meetingId: string, alertType: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/schedule-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertType })
      });

      if (!response.ok) throw new Error('Failed to send alert');
      return await response.json();
    } catch (error) {
      console.error('Error triggering meeting alert:', error);
      throw error;
    }
  }, []);

  return {
    meetings: data?.grouped as TodaysMeetingGroup[] | undefined,
    summary: data?.summary,
    isLoading,
    error,
    dismissedAlerts,
    snoozedAlerts,
    isSnoozeExpired,
    dismissAlert,
    snoozeAlert,
    triggerMeetingAlert,
    mutate
  };
}

// Hook to determine if meeting needs alert
export function useMeetingAlertStatus(meeting: MeetingWithAttendees) {
  const now = new Date();
  const startTime = new Date(meeting.start_time);
  const endTime = new Date(meeting.end_time);
  const oneHourBefore = new Date(startTime.getTime() - 60 * 60 * 1000);
  const sixHoursBefore = new Date(startTime.getTime() - 6 * 60 * 60 * 1000);

  let status = 'upcoming';
  let minutesUntilStart = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60));

  if (now >= startTime && now <= endTime) {
    status = 'happening_now';
  } else if (now >= oneHourBefore && now <= startTime) {
    status = 'imminent';
  } else if (now >= sixHoursBefore && now < oneHourBefore) {
    status = 'today';
  }

  return {
    status,
    minutesUntilStart: Math.max(0, minutesUntilStart),
    shouldShowAlert: status === 'imminent' || status === 'happening_now',
    shouldShowToast: status === 'today' || status === 'imminent',
    needsUrgentAction: status === 'imminent' || status === 'happening_now'
  };
}
