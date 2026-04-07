"use client"

import { useState } from "react"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface MonthMetrics {
  month: string
  target: number
  achieved: number
  scheduled: number
  platforms: Record<string, { achieved: number; target: number }>
}

interface ClientDetailPageProps {
  params: {
    clientId: string
  }
}

// Mock data - in production, fetch from API
const MOCK_METRICS: Record<string, MonthMetrics[]> = {
  "client-1": [
    {
      month: "April 2026",
      target: 12,
      achieved: 9,
      scheduled: 11,
      platforms: {
        Instagram: { achieved: 4, target: 5 },
        LinkedIn: { achieved: 3, target: 4 },
        Blog: { achieved: 2, target: 3 },
      },
    },
    {
      month: "March 2026",
      target: 12,
      achieved: 12,
      scheduled: 12,
      platforms: {
        Instagram: { achieved: 5, target: 5 },
        LinkedIn: { achieved: 4, target: 4 },
        Blog: { achieved: 3, target: 3 },
      },
    },
  ],
}

function getProgressColor(achieved: number, target: number) {
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
