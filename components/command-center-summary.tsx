"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, TrendingUp, CheckCircle2, Clock, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformMetric {
  name: string
  achieved: number
  target: number
}

interface CommandCenterProps {
  target: number
  productionDone: number
  scheduled: number
  published: number
  clientName?: string
  platformMetrics?: PlatformMetric[]
  isAllClients?: boolean
}

export function CommandCenterSummary({
  target,
  productionDone,
  scheduled,
  published,
  clientName = "All Clients",
  platformMetrics = [],
  isAllClients = false,
}: CommandCenterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const progress = target > 0 ? (published / target) * 100 : 0
  const isOnTrack = published >= Math.floor(target * 0.7)
  const needsAttention = published < Math.floor(target * 0.5) && target > 0
  
  let statusLabel = "On Track"
  let statusColor = "text-green-600"
  let statusBg = "bg-green-50"
  let statusDot = "bg-green-500"
  
  if (needsAttention) {
    statusLabel = "Needs Attention"
    statusColor = "text-amber-600"
    statusBg = "bg-amber-50"
    statusDot = "bg-amber-500"
  } else if (!isOnTrack && target > 0) {
    statusLabel = "At Risk"
    statusColor = "text-red-600"
    statusBg = "bg-red-50"
    statusDot = "bg-red-500"
  }

  const getProgressColor = (achieved: number, target: number) => {
    const percentage = target > 0 ? (achieved / target) * 100 : 0
    if (percentage >= 70) return "bg-green-500"
    if (percentage >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-4">
      {/* Main Collapsed Summary - 5 Second View */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">Total Target vs Achieved</h3>
            </div>
            <p className="text-sm text-gray-500 ml-7">{clientName} - {new Date().toLocaleString('default', { month: 'short' })}</p>
          </div>
          <div className={cn("px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2", statusBg, statusColor)}>
            <span className={cn("w-2 h-2 rounded-full", statusDot)} />
            {statusLabel}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="w-full">
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={cn("h-2.5 rounded-full transition-all", getProgressColor(published, target))}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-gray-900">{published}/{target}</div>
              <div className="text-xs text-gray-500 font-medium">{Math.round(progress)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Platform Breakdown */}
      {isExpanded && platformMetrics && platformMetrics.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Platform Breakdown</h4>
          
          <div className="space-y-3">
            {platformMetrics.map((platform) => {
              const platformProgress = platform.target > 0 ? (platform.achieved / platform.target) * 100 : 0
              const platformColor = getProgressColor(platform.achieved, platform.target)
              
              return (
                <div key={platform.name} className="flex items-center gap-4">
                  <div className="w-32">
                    <p className="text-sm font-medium text-gray-700">{platform.name}</p>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full", platformColor)}
                          style={{ width: `${Math.min(platformProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-fit">
                      <span className="text-sm font-semibold text-gray-900">{platform.achieved}/{platform.target}</span>
                      <span className="text-xs text-gray-500 ml-2">({Math.round(platformProgress)}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
