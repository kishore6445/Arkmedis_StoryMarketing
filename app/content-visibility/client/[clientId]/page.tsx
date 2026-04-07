"use client"

import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { WeekView } from "@/components/week-view"
import { MonthView } from "@/components/month-view"
import { PlatformView } from "@/components/platform-view"

type ViewType = "week" | "month" | "platform"

interface Post {
  id: string
  title: string
  platform: string
  planned_date: Date
  published_date: Date | null
  reach_metric: number
  engagement_metric: number
  likes_metric: number
  comments_metric: number
  shares_metric: number
  review_text: string | null
  reviewed_at: Date | null
}

const MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    title: "Summer Campaign Launch",
    platform: "Instagram",
    planned_date: new Date(2026, 3, 5),
    published_date: new Date(2026, 3, 7),
    reach_metric: 2500,
    engagement_metric: 340,
    likes_metric: 280,
    comments_metric: 45,
    shares_metric: 15,
    review_text: "Strong engagement from target demographic. Recommend similar content style.",
    reviewed_at: new Date(),
  },
  {
    id: "post-2",
    title: "Q2 Product Roadmap",
    platform: "LinkedIn",
    planned_date: new Date(2026, 3, 3),
    published_date: new Date(2026, 3, 5),
    reach_metric: 1200,
    engagement_metric: 85,
    likes_metric: 65,
    comments_metric: 20,
    shares_metric: 0,
    review_text: null,
    reviewed_at: null,
  },
  {
    id: "post-3",
    title: "Behind the Scenes Content",
    platform: "Instagram",
    planned_date: new Date(2026, 3, 10),
    published_date: new Date(2026, 3, 12),
    reach_metric: 3100,
    engagement_metric: 520,
    likes_metric: 450,
    comments_metric: 70,
    shares_metric: 25,
    review_text: null,
    reviewed_at: null,
  },
]

export default function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const router = useRouter()
  const [viewType, setViewType] = useState<ViewType>("month")
  const [selectedMonth, setSelectedMonth] = useState(3)
  const [selectedYear, setSelectedYear] = useState(2026)

  const clientName = "Smart Invest"
  const totalTarget = MOCK_POSTS.length
  const totalAchieved = MOCK_POSTS.filter(p => p.published_date).length
  const totalReach = MOCK_POSTS.reduce((sum, p) => sum + (p.reach_metric || 0), 0)
  const totalEngagement = MOCK_POSTS.reduce((sum, p) => sum + (p.engagement_metric || 0), 0)

  const platformMetrics = Array.from(
    new Map(
      MOCK_POSTS.reduce((acc: any[], post) => {
        const platform = post.platform || "Blog"
        const existing = acc.find(p => p.name === platform)
        if (existing) {
          existing.achieved += post.published_date ? 1 : 0
          existing.target += 1
        } else {
          acc.push({
            name: platform,
            achieved: post.published_date ? 1 : 0,
            target: 1,
          })
        }
        return acc
      }, [])
        .map(p => [p.name, p])
    )
  ).map(([_, p]) => p)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-700">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{clientName}</h1>
            <p className="text-gray-500 mt-1">Content performance analysis and manual review</p>
          </div>

          {/* Primary Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Target</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalTarget}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{totalAchieved}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Performance</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{Math.round((totalAchieved / totalTarget) * 100)}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Reach</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{(totalReach / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* View Selector */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("week")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              By Week
            </button>
            <button
              onClick={() => setViewType("month")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              By Month
            </button>
            <button
              onClick={() => setViewType("platform")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "platform"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              By Platform
            </button>
          </div>

          {viewType !== "platform" && (
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2026, i).toLocaleDateString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Content Area */}
        <div className="space-y-6">
          {viewType === "week" && <WeekView month={selectedMonth} year={selectedYear} posts={MOCK_POSTS} />}
          {viewType === "month" && <MonthView month={selectedMonth} year={selectedYear} posts={MOCK_POSTS} />}
          {viewType === "platform" && <PlatformView posts={MOCK_POSTS} />}
        </div>
      </div>
    </main>
  )
}
