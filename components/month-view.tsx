"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { PostReviewCard } from "./post-review-card"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  month: number
  year: number
  posts: any[]
}

export function MonthView({ month, year, posts }: MonthViewProps) {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([0]))

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthPosts = posts.filter(p => {
    const date = new Date(p.planned_date || p.scheduled_date || p.published_date)
    return date.getMonth() === month && date.getFullYear() === year
  })

  const toggleMonth = (index: number) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedMonths(newExpanded)
  }

  // Calculate stats
  const totalTarget = monthPosts.length
  const totalAchieved = monthPosts.filter(p => p.published_date).length
  const progress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleMonth(0)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ChevronDown
            className={cn("w-5 h-5 text-gray-600 transition-transform", expandedMonths.has(0) && "rotate-180")}
          />
          <div className="text-left">
            <p className="text-lg font-semibold text-gray-900">{monthName}</p>
            <p className="text-sm text-gray-500 mt-0.5">{monthPosts.length} posts planned</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{totalAchieved}</p>
          <p className="text-xs text-gray-500">of {totalTarget} published</p>
        </div>
      </button>

      {expandedMonths.has(0) && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Monthly Progress</p>
              <p className="text-sm font-bold text-gray-900">{Math.round(progress)}%</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Posts by week */}
          <div className="mt-6 space-y-4">
            {monthPosts.length > 0 ? (
              monthPosts.map(post => (
                <PostReviewCard
                  key={post.id}
                  postId={post.id}
                  title={post.title}
                  platform={post.platform}
                  week={new Date(post.planned_date || post.scheduled_date || post.published_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  reach={post.reach_metric || 0}
                  engagement={post.engagement_metric || 0}
                  likes={post.likes_metric || 0}
                  comments={post.comments_metric || 0}
                  shares={post.shares_metric || 0}
                  reviewText={post.review_text}
                  isReviewed={!!post.reviewed_at}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No posts scheduled for this month</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
