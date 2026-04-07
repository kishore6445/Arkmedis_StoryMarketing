"use client"

import { useState } from "react"
import { Edit2, Check, X } from "lucide-react"
import { PerformanceMetricsDisplay } from "./performance-metrics-display"
import { cn } from "@/lib/utils"

interface PostReviewCardProps {
  postId: string
  title: string
  platform: string
  week: string
  reach?: number
  engagement?: number
  likes?: number
  comments?: number
  shares?: number
  reviewText?: string
  isReviewed?: boolean
  lastUpdated?: string
  onReviewUpdate?: (reviewText: string) => void
}

export function PostReviewCard({
  postId,
  title,
  platform,
  week,
  reach = 0,
  engagement = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  reviewText,
  isReviewed = false,
  lastUpdated,
  onReviewUpdate,
}: PostReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(reviewText || "")
  const engagementRate = reach > 0 ? (engagement / reach) * 100 : 0

  const handleSaveReview = () => {
    onReviewUpdate?.(editText)
    setIsEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{platform}</span>
            <span className="text-xs text-gray-500">{week}</span>
          </div>
        </div>
        {isReviewed && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Reviewed</span>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Performance</p>
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500">Reach</p>
            <p className="text-lg font-bold text-gray-900">{reach.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Engagement</p>
            <p className="text-lg font-bold text-gray-900">{engagement.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Rate</p>
            <p className="text-lg font-bold text-blue-600">{engagementRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Likes</p>
            <p className="text-lg font-bold text-gray-900">{likes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Comments</p>
            <p className="text-lg font-bold text-gray-900">{comments.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Shares</p>
            <p className="text-lg font-bold text-gray-900">{shares.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Manual Review</p>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <Edit2 className="w-3 h-3" />
              {reviewText ? "Edit" : "Add Review"}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Add insights about this post's performance..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveReview}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Check className="w-3 h-3" />
                Save Review
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditText(reviewText || "")
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : reviewText ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{reviewText}</p>
            {lastUpdated && <p className="text-xs text-gray-500 mt-2">Last updated: {lastUpdated}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No review added yet</p>
        )}
      </div>
    </div>
  )
}
