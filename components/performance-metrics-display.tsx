"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PerformanceMetricsProps {
  reach: number
  engagement: number
  engagementRate: number
  likes: number
  comments: number
  shares: number
  previousMetrics?: {
    reach: number
    engagement: number
  }
}

export function PerformanceMetricsDisplay({
  reach,
  engagement,
  engagementRate,
  likes,
  comments,
  shares,
  previousMetrics,
}: PerformanceMetricsProps) {
  const reachTrend = previousMetrics ? reach - previousMetrics.reach : 0
  const engagementTrend = previousMetrics ? engagement - previousMetrics.engagement : 0
  
  const reachUp = reachTrend >= 0
  const engagementUp = engagementTrend >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {/* Reach */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Reach</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold text-gray-900">{reach.toLocaleString()}</p>
          {previousMetrics && (
            <div className="flex items-center gap-1">
              {reachUp ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={cn("text-xs font-semibold", reachUp ? "text-green-600" : "text-red-600")}>
                {Math.abs(reachTrend)} {reachUp ? "↑" : "↓"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Engagement</p>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold text-gray-900">{engagement.toLocaleString()}</p>
          {previousMetrics && (
            <div className="flex items-center gap-1">
              {engagementUp ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={cn("text-xs font-semibold", engagementUp ? "text-green-600" : "text-red-600")}>
                {Math.abs(engagementTrend)} {engagementUp ? "↑" : "↓"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Engagement Rate</p>
        <p className="text-2xl font-bold text-blue-600">{engagementRate.toFixed(1)}%</p>
      </div>

      {/* Likes */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Likes</p>
        <p className="text-2xl font-bold text-gray-900">{likes.toLocaleString()}</p>
      </div>

      {/* Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Comments</p>
        <p className="text-2xl font-bold text-gray-900">{comments.toLocaleString()}</p>
      </div>

      {/* Shares */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Shares</p>
        <p className="text-2xl font-bold text-gray-900">{shares.toLocaleString()}</p>
      </div>
    </div>
  )
}
