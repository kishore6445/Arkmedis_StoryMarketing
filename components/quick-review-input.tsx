"use client"

import { useState } from "react"
import { CheckCircle2, X, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickReviewInputProps {
  postId: string
  postTitle: string
  platform: string
  onSubmit: (review: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function QuickReviewInput({
  postId,
  postTitle,
  platform,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuickReviewInputProps) {
  const [review, setReview] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (review.trim()) {
      onSubmit(review)
      setSubmitted(true)
      setTimeout(() => {
        setReview("")
        setSubmitted(false)
      }, 2000)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-900">Review submitted successfully</p>
          <p className="text-xs text-green-700 mt-0.5">Your feedback has been recorded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">Add Quick Review</label>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-600">{postTitle} • {platform}</p>
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your insights... (e.g., 'Strong engagement from target demographic', 'Recommend similar content style')"
        className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
      />

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-500">{review.length}/500 characters</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!review.trim() || isSubmitting}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors",
              review.trim() && !isSubmitting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )
}
