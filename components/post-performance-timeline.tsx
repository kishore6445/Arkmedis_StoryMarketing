"use client"

import { TrendingUp, TrendingDown, Zap, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricSnapshot {
  day: number
  reach: number
  engagement: number
  engagementRate: number
  likes: number
  comments: number
  shares: number
}

interface PostPerformanceTimelineProps {
  postTitle: string
  platform: string
  snapshots: MetricSnapshot[]
  performerType: "high" | "moderate" | "low"
  autoInsight: string
}

export function PostPerformanceTimeline({
  postTitle,
  platform,
  snapshots,
  performerType,
  autoInsight,
}: PostPerformanceTimelineProps) {
  const maxReach = Math.max(...snapshots.map(s => s.reach))
  const maxEngagement = Math.max(...snapshots.map(s => s.engagement))

  const getPerformerColor = () => {
    if (performerType === "high") return "border-green-200 bg-green-50"
    if (performerType === "moderate") return "border-amber-200 bg-amber-50"
    return "border-red-200 bg-red-50"
  }

  const getPerformerBadgeColor = () => {
    if (performerType === "high") return "bg-green-100 text-green-800"
    if (performerType === "moderate") return "bg-amber-100 text-amber-800"
    return "bg-red-100 text-red-800"
  }

  const getPerformerLabel = () => {
    if (performerType === "high") return "High Performer"
    if (performerType === "moderate") return "Moderate Performance"
    return "Needs Review"
  }

  return (
    <div className={cn("border rounded-xl p-6 transition-all", getPerformerColor())}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{postTitle}</h3>
            <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", getPerformerBadgeColor())}>
              {getPerformerLabel()}
            </span>
          </div>
          <p className="text-sm text-gray-600">{platform} • Auto-reviewed based on performance data</p>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 pb-6 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Latest Reach</p>
          <p className="text-2xl font-bold text-gray-900">{snapshots[snapshots.length - 1]?.reach.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Latest Engagement</p>
          <p className="text-2xl font-bold text-gray-900">{snapshots[snapshots.length - 1]?.engagement}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Eng. Rate</p>
          <p className="text-2xl font-bold text-gray-900">{snapshots[snapshots.length - 1]?.engagementRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium mb-1">Peak Reach</p>
          <p className="text-2xl font-bold text-gray-900">{maxReach.toLocaleString()}</p>
        </div>
      </div>

      {/* Performance Timeline */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">42-Day Performance Curve</p>
        <div className="space-y-3">
          {/* Reach Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Reach Progression</label>
              <span className="text-xs text-gray-500">
                {snapshots[0]?.reach.toLocaleString()} → {snapshots[snapshots.length - 1]?.reach.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-1 h-8">
              {snapshots.map((snapshot, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-white border border-blue-200 rounded relative group hover:z-10"
                  style={{ minHeight: "100%" }}
                >
                  <div
                    className="bg-blue-500 rounded transition-all h-full relative"
                    style={{ width: `${(snapshot.reach / maxReach) * 100}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    Day {snapshot.day}: {snapshot.reach.toLocaleString()} reach
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Engagement Progression</label>
              <span className="text-xs text-gray-500">
                {snapshots[0]?.engagement} → {snapshots[snapshots.length - 1]?.engagement}
              </span>
            </div>
            <div className="flex gap-1 h-8">
              {snapshots.map((snapshot, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-white border border-purple-200 rounded relative group hover:z-10"
                  style={{ minHeight: "100%" }}
                >
                  <div
                    className="bg-purple-500 rounded transition-all h-full relative"
                    style={{ width: `${(snapshot.engagement / maxEngagement) * 100}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    Day {snapshot.day}: {snapshot.engagement} engagements
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Snapshots Table */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Metric Snapshots</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Day</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Reach</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Engagement</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Rate</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Likes</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Comments</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">Shares</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snapshot, idx) => {
                const prevSnapshot = idx > 0 ? snapshots[idx - 1] : null
                const reachTrend = prevSnapshot ? snapshot.reach - prevSnapshot.reach : 0
                const engagementTrend = prevSnapshot ? snapshot.engagement - prevSnapshot.engagement : 0

                return (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-white/50">
                    <td className="py-3 px-3 font-medium text-gray-900">Day {snapshot.day}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-semibold text-gray-900">{snapshot.reach.toLocaleString()}</span>
                        {reachTrend !== 0 && (
                          <span className={cn("text-xs font-medium", reachTrend > 0 ? "text-green-600" : "text-red-600")}>
                            {reachTrend > 0 ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-semibold text-gray-900">{snapshot.engagement}</span>
                        {engagementTrend !== 0 && (
                          <span className={cn("text-xs font-medium", engagementTrend > 0 ? "text-green-600" : "text-red-600")}>
                            {engagementTrend > 0 ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-900 font-medium">{snapshot.engagementRate.toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right text-gray-700">{snapshot.likes}</td>
                    <td className="py-3 px-3 text-right text-gray-700">{snapshot.comments}</td>
                    <td className="py-3 px-3 text-right text-gray-700">{snapshot.shares}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Generated Insight */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">Auto-Generated Insight</p>
            <p className="text-sm text-gray-700">{autoInsight}</p>
            <p className="text-xs text-gray-500 mt-2">Generated from 42-day performance analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}
