"use client"

import { useState } from "react"
import { ChevronDown, Calendar } from "lucide-react"
import { PostReviewCard } from "./post-review-card"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  month: number
  year: number
  posts: any[]
}

export function WeekView({ month, year, posts }: WeekViewProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]))

  const weeks = getWeeksInMonth(year, month)

  const toggleWeek = (index: number) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedWeeks(newExpanded)
  }

  return (
    <div className="space-y-3">
      {weeks.map((week, idx) => {
        const weekPosts = posts.filter(p => {
          const date = new Date(p.planned_date || p.scheduled_date || p.published_date)
          return date >= week.start && date <= week.end
        })

        return (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleWeek(idx)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  className={cn("w-5 h-5 text-gray-600 transition-transform", expandedWeeks.has(idx) && "rotate-180")}
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{week.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{weekPosts.length} posts</p>
                </div>
              </div>
              <div className="text-right">
                <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${weekPosts.length > 0 ? 75 : 0}%` }}
                  />
                </div>
              </div>
            </button>

            {expandedWeeks.has(idx) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                {weekPosts.length > 0 ? (
                  weekPosts.map(post => (
                    <PostReviewCard
                      key={post.id}
                      postId={post.id}
                      title={post.title}
                      platform={post.platform}
                      week={week.label}
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
                  <p className="text-sm text-gray-500 text-center py-4">No posts scheduled for this week</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getWeeksInMonth(year: number, month: number) {
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
      label: `Week: ${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    })

    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }

  return weeks
}
