"use client"

import { TrendingUp, CheckCircle2, Clock, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandCenterProps {
  target: number
  productionDone: number
  scheduled: number
  published: number
  clientName?: string
}

export function CommandCenterSummary({
  target,
  productionDone,
  scheduled,
  published,
  clientName = "All Clients",
}: CommandCenterProps) {
  const progress = target > 0 ? (published / target) * 100 : 0
  const isOnTrack = published >= Math.floor(target * 0.7)
  const needsAttention = published < Math.floor(target * 0.5) && target > 0
  
  let statusLabel = "On Track"
  let statusColor = "text-green-600"
  let statusBg = "bg-green-50"
  
  if (needsAttention) {
    statusLabel = "Needs Attention"
    statusColor = "text-amber-600"
    statusBg = "bg-amber-50"
  } else if (!isOnTrack && target > 0) {
    statusLabel = "At Risk"
    statusColor = "text-red-600"
    statusBg = "bg-red-50"
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{clientName}</h2>
        <p className="text-sm text-gray-500 mt-1">Content performance for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-3xl font-black text-gray-900">{target}</div>
          <p className="text-xs text-gray-500 mt-2">posts for month</p>
        </div>

        {/* Production Done Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Production</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">{productionDone}</div>
          <p className="text-xs text-gray-500 mt-2">ready for scheduling</p>
        </div>

        {/* Scheduled Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-600">{scheduled}</div>
          <p className="text-xs text-gray-500 mt-2">queued for publication</p>
        </div>

        {/* Published Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Published</span>
            <Globe className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-black text-green-600">{published}</div>
          <p className="text-xs text-gray-500 mt-2">live and active</p>
        </div>
      </div>

      {/* Progress Bar and Status */}
      <div className="mt-5 flex items-end justify-between">
        <div className="flex-1 mr-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{published} of {target} published ({Math.round(progress)}%)</p>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-sm font-medium", statusBg, statusColor)}>
          {statusLabel}
        </div>
      </div>
    </div>
  )
}
