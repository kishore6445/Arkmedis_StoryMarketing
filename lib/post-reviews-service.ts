// Post Reviews Service - Handle all review-related operations
export async function createPostReview(data: any) {
  // Stub for now - will be integrated with Supabase
  return { success: true, id: Math.random() }
}

export async function updatePostReview(reviewId: string, data: any) {
  return { success: true }
}

export async function getPostReviews(contentRecordId: string) {
  return []
}

// Time period grouping utilities
export function getWeeksInMonth(year: number, month: number) {
  const weeks = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  let currentWeekStart = new Date(firstDay)
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())

  while (currentWeekStart <= lastDay) {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    weeks.push({
      start: new Date(currentWeekStart),
      end: new Date(weekEnd),
      label: `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    })
    
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }
  
  return weeks
}

export function groupByWeek(records: any[], year: number, month: number) {
  const weeks = getWeeksInMonth(year, month)
  return weeks.map(week => ({
    ...week,
    records: records.filter(r => {
      const recordDate = new Date(r.planned_date || r.scheduled_date || r.published_date)
      return recordDate >= week.start && recordDate <= week.end
    })
  }))
}

export function groupByPlatform(records: any[]) {
  const platforms = new Map<string, any[]>()
  
  records.forEach(record => {
    const platform = record.platform || 'Unknown'
    if (!platforms.has(platform)) {
      platforms.set(platform, [])
    }
    platforms.get(platform)!.push(record)
  })
  
  return Array.from(platforms.entries()).map(([name, records]) => ({
    name,
    count: records.length,
    records
  }))
}

export function calculateEngagementRate(engagement: number, reach: number): number {
  if (reach === 0) return 0
  return (engagement / reach) * 100
}

export function getTractionStatus(engagementRate: number) {
  if (engagementRate >= 10) return 'high'
  if (engagementRate >= 5) return 'medium'
  return 'low'
}
