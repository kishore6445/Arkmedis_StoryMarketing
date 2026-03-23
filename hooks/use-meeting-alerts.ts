import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('Failed to fetch meetings');
    throw error;
  }
  return response.json();
};

export function useMeetingAlerts() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const { data, error, isLoading } = useSWR(
    '/api/meetings/today',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    }
  );

  useEffect(() => {
    if (data) {
      setMeetings(data.groups || []);
      setSummary(data.summary || { totalMeetings: 0, totalAttendees: 0 });
    }
  }, [data]);

  return {
    meetings,
    summary,
    isLoading,
    error,
  };
}
