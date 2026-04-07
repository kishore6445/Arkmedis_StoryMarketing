"use client"

import { useState } from "react"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { CommandCenterSummary } from "@/components/command-center-summary"
import { WeekView } from "@/components/week-view"
import { MonthView } from "@/components/month-view"
import { PlatformView } from "@/components/platform-view"

interface ClientDetailPageProps {
  params: {
    clientId: string
  }
}

// Mock data - in production, fetch from API
const MOCK_POSTS = [
  {
    id: "post-1",
    title: "Summer Campaign Launch",
    platform: "Instagram",
    planned_date: new Date(2026, 3, 5),
    scheduled_date: new Date(2026, 3, 5),
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
    scheduled_date: new Date(2026, 3, 3),
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
    scheduled_date: new Date(2026, 3, 10),
    published_date: new Date(2026, 3, 12),
    reach_metric: 3100,
    engagement_metric: 520,
    likes_metric: 450,
    comments_metric: 70,
    shares_metric: 25,
    review_text: null,
    reviewed_at: null,
  },
  {
    id: "post-4",
    title: "Blog: Performance Metrics Deep Dive",
    platform: "Blog",
    planned_date: new Date(2026, 3, 8),
    scheduled_date: new Date(2026, 3, 8),
    published_date: null,
    reach_metric: 0,
    engagement_metric: 0,
    likes_metric: 0,
    comments_metric: 0,
    shares_metric: 0,
    review_text: null,
    reviewed_at: null,
  },
  {
    id: "post-5",
    title: "Newsletter: April Digest",
    platform: "Email",
    planned_date: new Date(2026, 3, 15),
    scheduled_date: new Date(2026, 3, 15),
    published_date: new Date(2026, 3, 15),
    reach_metric: 5000,
    engagement_metric: 850,
    likes_metric: 0,
    comments_metric: 120,
    shares_metric: 0,
    review_text: "Excellent open rate. Strong call-to-action performance.",
    reviewed_at: new Date(),
  },
]

type ViewType = "week" | "month" | "platform"

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter()
  const [viewType, setViewType] = useState<ViewType>("month")
  const [selectedMonth, setSelectedMonth] = useState(3) // April (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2026)

  const clientName = "Smart Invest" // In production, fetch from API
  const totalTarget = MOCK_POSTS.length
  const totalAchieved = MOCK_POSTS.filter(p => p.published_date).length
  const totalReach = MOCK_POSTS.reduce((sum, p) => sum + (p.reach_metric || 0), 0)
  const totalEngagement = MOCK_POSTS.reduce((sum, p) => sum + (p.engagement_metric || 0), 0)

  // Group posts by platform for metrics
  const platformMetrics = Array.from(
    new Map(
      MOCK_POSTS
        .reduce((acc: any[], post) => {
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

  if (target === 0) return "bg-gray-300"
  const percentage = (achieved / target) * 100
  if (percentage >= 70) return "bg-green-500"
  if (percentage >= 40) return "bg-amber-500"
  return "bg-red-500"
}

function getQuarters(metrics: MonthMetrics[]) {
  const quarters: Record<string, MonthMetrics[]> = {}
  
  metrics.forEach(month => {
    const date = new Date(month.month)
    const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`
    
    if (!quarters[quarter]) {
      quarters[quarter] = []
    }
    quarters[quarter].push(month)
  })
  
  return quarters
}

function calculateQuarterMetrics(quarterMonths: MonthMetrics[]) {
  return {
    target: quarterMonths.reduce((sum, m) => sum + m.target, 0),
    achieved: quarterMonths.reduce((sum, m) => sum + m.achieved, 0),
    scheduled: quarterMonths.reduce((sum, m) => sum + m.scheduled, 0),
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const router = useRouter()
  const [expandedQuarter, setExpandedQuarter] = useState<string | null>(null)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const metrics = MOCK_METRICS[params.clientId] || []
  const quarters = getQuarters(metrics)
  const clientName = "Smart Snacks" // In production: fetch from API

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="space-y-2">
            <h1 className="text-5xl font-black text-gray-900 leading-tight">{clientName}</h1>
            <p className="text-lg text-gray-500 font-light">Content Performance Dashboard</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Summary Stats */}
        <div className="mb-20">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-6">Overview</h2>
          
          <div className="grid grid-cols-3 gap-12">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Target</p>
              <p className="text-4xl font-black text-gray-900">
                {metrics.reduce((sum, m) => sum + m.target, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">posts planned</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Achieved</p>
              <p className="text-4xl font-black text-green-600">
                {metrics.reduce((sum, m) => sum + m.achieved, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-2">posts published</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Overall Progress</p>
              <p className="text-4xl font-black text-gray-900">
                {Math.round(
                  (metrics.reduce((sum, m) => sum + m.achieved, 0) /
                    metrics.reduce((sum, m) => sum + m.target, 0)) *
                    100
                )}%
              </p>
              <p className="text-sm text-gray-600 mt-2">completion rate</p>
            </div>
          </div>
        </div>

        {/* Quarterly Breakdown */}
        <div className="space-y-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">By Quarter</h2>

          {Object.entries(quarters).map(([quarter, quarterMetrics]) => {
            const quarterStats = calculateQuarterMetrics(quarterMetrics)
            const quarterProgress = (quarterStats.achieved / quarterStats.target) * 100

            return (
              <div key={quarter} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Quarter Header */}
                <button
                  onClick={() => setExpandedQuarter(expandedQuarter === quarter ? null : quarter)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{quarter}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{quarterStats.achieved} / {quarterStats.target} published</span>
                      <span className="text-gray-400">•</span>
                      <span>{Math.round(quarterProgress)}% complete</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-gray-100 rounded-full">
                      <div
                        className={cn("h-2 rounded-full transition-all", getProgressColor(quarterStats.achieved, quarterStats.target))}
                        style={{ width: `${Math.min(quarterProgress, 100)}%` }}
                      />
                    </div>
                    {expandedQuarter === quarter ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Quarter Expanded Content */}
                {expandedQuarter === quarter && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                    {/* Monthly Breakdown */}
                    {quarterMetrics.map((month) => {
                      const monthProgress = (month.achieved / month.target) * 100

                      return (
                        <div key={month.month} className="space-y-4">
                          <button
                            onClick={() =>
                              setExpandedMonth(expandedMonth === month.month ? null : month.month)
                            }
                            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold text-gray-900">{month.month}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {month.achieved} / {month.target} published
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="w-32 h-1.5 bg-gray-200 rounded-full">
                                <div
                                  className={cn("h-1.5 rounded-full", getProgressColor(month.achieved, month.target))}
                                  style={{ width: `${Math.min(monthProgress, 100)}%` }}
                                />
                              </div>
                              {expandedMonth === month.month ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Platform Breakdown */}
                          {expandedMonth === month.month && (
                            <div className="pl-4 space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform Breakdown</p>
                              {Object.entries(month.platforms).map(([platform, stats]) => {
                                const platformProgress = (stats.achieved / stats.target) * 100

                                return (
                                  <div key={platform} className="flex items-center gap-4">
                                    <div className="w-24">
                                      <p className="text-sm font-medium text-gray-700">{platform}</p>
                                    </div>
                                    <div className="flex-1">
                                      <div className="h-1 bg-gray-200 rounded-full">
                                        <div
                                          className={cn("h-1 rounded-full", getProgressColor(stats.achieved, stats.target))}
                                          style={{ width: `${Math.min(platformProgress, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                    <div className="text-right min-w-fit">
                                      <p className="text-sm font-semibold text-gray-900">
                                        {stats.achieved}/{stats.target}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
