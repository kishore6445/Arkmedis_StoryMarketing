"use client"

import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { WeekView } from "@/components/week-view"
import { MonthView } from "@/components/month-view"
import { PlatformView } from "@/components/platform-view"
import { PostPerformanceTimeline } from "@/components/post-performance-timeline"
import { QuickReviewInput } from "@/components/quick-review-input"
import {
  getPerformerType,
  generateAutoInsight,
  calculateEngagementRate,
  categorizePostPerformance,
} from "@/lib/post-performance-utils"

type ViewType = "week" | "month" | "platform" | "timeline"

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

// Mock performance snapshots data (in production, fetch from API)
interface MetricSnapshot {
  day: number
  reach: number
  engagement: number
  engagementRate: number
  likes: number
  comments: number
  shares: number
}

const MOCK_PERFORMANCE_SNAPSHOTS: Record<string, MetricSnapshot[]> = {
  "post-1": [
    { day: 1, reach: 800, engagement: 120, engagementRate: 15.0, likes: 90, comments: 20, shares: 10 },
    { day: 7, reach: 2200, engagement: 310, engagementRate: 14.1, likes: 250, comments: 40, shares: 20 },
    { day: 14, reach: 2400, engagement: 335, engagementRate: 13.9, likes: 270, comments: 45, shares: 20 },
    { day: 21, reach: 2500, engagement: 340, engagementRate: 13.6, likes: 280, comments: 45, shares: 15 },
    { day: 42, reach: 2520, engagement: 342, engagementRate: 13.6, likes: 282, comments: 45, shares: 15 },
  ],
  "post-2": [
    { day: 1, reach: 300, engagement: 15, engagementRate: 5.0, likes: 12, comments: 2, shares: 1 },
    { day: 7, reach: 800, engagement: 55, engagementRate: 6.9, likes: 42, comments: 10, shares: 3 },
    { day: 14, reach: 1000, engagement: 75, engagementRate: 7.5, likes: 55, comments: 15, shares: 5 },
    { day: 21, reach: 1100, engagement: 82, engagementRate: 7.5, likes: 60, comments: 18, shares: 4 },
    { day: 42, reach: 1200, engagement: 85, engagementRate: 7.1, likes: 65, comments: 20, shares: 0 },
  ],
  "post-3": [
    { day: 1, reach: 1200, engagement: 240, engagementRate: 20.0, likes: 190, comments: 35, shares: 15 },
    { day: 7, reach: 2800, engagement: 480, engagementRate: 17.1, likes: 380, comments: 70, shares: 30 },
    { day: 14, reach: 3000, engagement: 510, engagementRate: 17.0, likes: 410, comments: 75, shares: 25 },
    { day: 21, reach: 3050, engagement: 518, engagementRate: 17.0, likes: 440, comments: 60, shares: 18 },
    { day: 42, reach: 3100, engagement: 520, engagementRate: 16.8, likes: 450, comments: 70, shares: 0 },
  ],
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
  const [viewType, setViewType] = useState<ViewType>("timeline")
  const [selectedMonth, setSelectedMonth] = useState(3)
  const [selectedYear, setSelectedYear] = useState(2026)
  const [reviewingPostId, setReviewingPostId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Record<string, string>>({})

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

  const handleAddReview = (postId: string, review: string) => {
    setReviews(prev => ({
      ...prev,
      [postId]: review,
    }))
    setReviewingPostId(null)
  }

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
            <p className="text-gray-500 mt-1">Post performance analytics with 42-day tracking and smart reviews</p>
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewType("timeline")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                viewType === "timeline"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Performance Timeline
            </button>
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

          {viewType !== "platform" && viewType !== "timeline" && (
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
          {viewType === "timeline" && (
            <>
              <div className="space-y-4">
                {MOCK_POSTS.map((post) => {
                  const snapshots = MOCK_PERFORMANCE_SNAPSHOTS[post.id] || []
                  const latestSnapshot = snapshots[snapshots.length - 1]
                  const engagementRate = latestSnapshot ? calculateEngagementRate(latestSnapshot.engagement, latestSnapshot.reach) : 0
                  const performerType = getPerformerType(engagementRate)
                  const autoInsight = generateAutoInsight(
                    post.platform,
                    engagementRate,
                    latestSnapshot?.reach || 0,
                    latestSnapshot?.engagement || 0,
                    latestSnapshot?.comments || 0,
                    latestSnapshot?.shares || 0,
                    performerType
                  )

                  return (
                    <div key={post.id}>
                      <PostPerformanceTimeline
                        postTitle={post.title}
                        platform={post.platform}
                        snapshots={snapshots}
                        performerType={performerType}
                        autoInsight={autoInsight}
                      />

                      {/* Review Section */}
                      <div className="mt-4 ml-0">
                        {post.review_text ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-green-900 mb-2">Your Review</p>
                            <p className="text-sm text-green-800">{post.review_text}</p>
                            <p className="text-xs text-green-600 mt-2">Submitted on {post.reviewed_at?.toLocaleDateString()}</p>
                          </div>
                        ) : reviews[post.id] ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-green-900 mb-2">Your Review</p>
                            <p className="text-sm text-green-800">{reviews[post.id]}</p>
                          </div>
                        ) : reviewingPostId === post.id ? (
                          <QuickReviewInput
                            postId={post.id}
                            postTitle={post.title}
                            platform={post.platform}
                            onSubmit={(review) => handleAddReview(post.id, review)}
                            onCancel={() => setReviewingPostId(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setReviewingPostId(post.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Quick Review
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {viewType === "week" && <WeekView month={selectedMonth} year={selectedYear} posts={MOCK_POSTS} />}
          {viewType === "month" && <MonthView month={selectedMonth} year={selectedYear} posts={MOCK_POSTS} />}
          {viewType === "platform" && <PlatformView posts={MOCK_POSTS} />}
        </div>
      </div>
    </main>
  )
}
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
