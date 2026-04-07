"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { PostReviewCard } from "./post-review-card"
import { cn } from "@/lib/utils"

interface PlatformViewProps {
  posts: any[]
}

const PLATFORMS = ["Instagram", "LinkedIn", "YouTube", "Blog", "Facebook", "Email", "TikTok", "Twitter/X", "Website"]

export function PlatformView({ posts }: PlatformViewProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set([PLATFORMS[0]]))

  const groupedByPlatform = PLATFORMS.map(platform => ({
    name: platform,
    posts: posts.filter(p => (p.platform || "Blog") === platform),
  })).filter(group => group.posts.length > 0)

  const togglePlatform = (platform: string) => {
    const newExpanded = new Set(expandedPlatforms)
    if (newExpanded.has(platform)) {
      newExpanded.delete(platform)
    } else {
      newExpanded.add(platform)
    }
    setExpandedPlatforms(newExpanded)
  }

  return (
    <div className="space-y-3">
      {groupedByPlatform.map(group => {
        const totalReach = group.posts.reduce((sum, p) => sum + (p.reach_metric || 0), 0)
        const totalEngagement = group.posts.reduce((sum, p) => sum + (p.engagement_metric || 0), 0)
        const avgEngagementRate = group.posts.length > 0 ? (totalEngagement / Math.max(totalReach, 1)) * 100 : 0
        const publishedCount = group.posts.filter(p => p.published_date).length

        return (
          <div key={group.name} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => togglePlatform(group.name)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-600 transition-transform flex-shrink-0",
                    expandedPlatforms.has(group.name) && "rotate-180"
                  )}
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{group.posts.length} posts</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Reach</p>
                  <p className="text-sm font-bold text-gray-900">{totalReach.toLocaleString()}</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">Engagement</p>
                  <p className="text-sm font-bold text-blue-600">{avgEngagementRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Published</p>
                  <p className="text-sm font-bold text-gray-900">{publishedCount}/{group.posts.length}</p>
                </div>
              </div>
            </button>

            {expandedPlatforms.has(group.name) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                {group.posts.map(post => (
                  <PostReviewCard
                    key={post.id}
                    postId={post.id}
                    title={post.title}
                    platform={group.name}
                    week={new Date(post.planned_date || post.scheduled_date || post.published_date).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric', year: '2-digit' }
                    )}
                    reach={post.reach_metric || 0}
                    engagement={post.engagement_metric || 0}
                    likes={post.likes_metric || 0}
                    comments={post.comments_metric || 0}
                    shares={post.shares_metric || 0}
                    reviewText={post.review_text}
                    isReviewed={!!post.reviewed_at}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {groupedByPlatform.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts found</p>
        </div>
      )}
    </div>
  )
}
