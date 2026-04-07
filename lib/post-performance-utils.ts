// Utility functions for post performance analysis and review recommendations

export type PerformerType = "high" | "moderate" | "low"

interface PostMetrics {
  reach: number
  engagement: number
  likes: number
  comments: number
  shares: number
  publishedDate: Date
  platform: string
}

export function getPerformerType(engagementRate: number): PerformerType {
  if (engagementRate >= 12) return "high"
  if (engagementRate >= 5) return "moderate"
  return "low"
}

export function shouldReviewPost(daysSincePublish: number, engagementRate: number): boolean {
  // Review posts between 7-21 days after publish when data has stabilized
  if (daysSincePublish < 7 || daysSincePublish > 42) return false
  
  // Always review high performers and underperformers
  if (engagementRate >= 12 || engagementRate < 3) return true
  
  // During 14-21 day window, review all posts for pattern analysis
  if (daysSincePublish >= 14 && daysSincePublish <= 21) return true
  
  return false
}

export function generateAutoInsight(
  platform: string,
  engagementRate: number,
  reach: number,
  engagement: number,
  comments: number,
  shares: number,
  performerType: PerformerType
): string {
  const insights: string[] = []

  // Audience insights
  if (engagementRate >= 15) {
    insights.push("Excellent engagement from audience. Content resonates strongly with followers.")
  } else if (engagementRate >= 10) {
    insights.push("Good engagement rates. Content performing above average for platform.")
  } else if (engagementRate < 3) {
    insights.push("Low engagement rate. Consider reviewing content style and posting time.")
  }

  // Platform-specific insights
  if (platform === "LinkedIn") {
    if (comments > engagement * 0.3) {
      insights.push("Strong discussion engagement. Professional audience engaged with content depth.")
    }
  } else if (platform === "Instagram") {
    if (shares > engagement * 0.1) {
      insights.push("High share rate. Content is shareworthy and expanding organic reach.")
    }
  } else if (platform === "YouTube") {
    if (reach > 5000) {
      insights.push("Strong reach on YouTube. Content algorithm favorability is high.")
    }
  }

  // Content performance suggestions
  if (performerType === "high") {
    insights.push("Recommend creating similar content style in future posts.")
  } else if (performerType === "low") {
    insights.push("Review posting time, content hook, and audience targeting for next iteration.")
  }

  // Reach analysis
  if (reach > 10000) {
    insights.push("Content achieved significant viral reach. Strong organic distribution.")
  } else if (reach < 500) {
    insights.push("Limited reach. Consider boosting or adjusting distribution strategy.")
  }

  return insights.length > 0
    ? insights[0]
    : "Post performance is within normal range. Monitor for future trends."
}

export function getReviewRecommendationColor(performerType: PerformerType): string {
  if (performerType === "high") return "border-green-200 bg-green-50"
  if (performerType === "moderate") return "border-amber-200 bg-amber-50"
  return "border-red-200 bg-red-50"
}

export function calculateEngagementRate(engagement: number, reach: number): number {
  if (reach === 0) return 0
  return (engagement / reach) * 100
}

export function categorizePostPerformance(posts: PostMetrics[]) {
  const now = new Date()
  
  const byPerformance = {
    highPerformers: [] as PostMetrics[],
    moderate: [] as PostMetrics[],
    underperformers: [] as PostMetrics[],
    needsReview: [] as PostMetrics[],
    recentPosts: [] as PostMetrics[],
  }

  posts.forEach(post => {
    const daysSincePublish = Math.floor((now.getTime() - post.publishedDate.getTime()) / (1000 * 60 * 60 * 24))
    const engagementRate = calculateEngagementRate(post.engagement, post.reach)
    
    // Categorize by performance
    if (engagementRate >= 12) {
      byPerformance.highPerformers.push(post)
    } else if (engagementRate >= 5) {
      byPerformance.moderate.push(post)
    } else {
      byPerformance.underperformers.push(post)
    }

    // Flag for review if in optimal window (7-21 days)
    if (shouldReviewPost(daysSincePublish, engagementRate)) {
      byPerformance.needsReview.push(post)
    }

    // Recent posts (0-7 days)
    if (daysSincePublish <= 7) {
      byPerformance.recentPosts.push(post)
    }
  })

  return byPerformance
}
