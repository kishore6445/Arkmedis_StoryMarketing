"use client"

import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface DeliveryHealthHeroProps {
  month: string
  week: string
  client: string
}

// Enhanced mock data with week info
const mockData = [
  { id: "1", month: "march", week: "Week 1", client: "Telugu Pizza", status: "Published", plannedDate: "2024-03-01" },
  { id: "2", month: "march", week: "Week 1", client: "Smart Snaxx", status: "Delayed", plannedDate: "2024-03-02" },
  { id: "3", month: "march", week: "Week 2", client: "Visa Nagendar", status: "Scheduled", plannedDate: "2024-03-05" },
  { id: "4", month: "march", week: "Week 2", client: "Story Marketing", status: "Planned", plannedDate: "2024-03-08" },
  { id: "5", month: "march", week: "Week 3", client: "Telugu Pizza", status: "Published", plannedDate: "2024-03-15" },
  { id: "6", month: "march", week: "Week 3", client: "Smart Snaxx", status: "Published", plannedDate: "2024-03-17" },
  { id: "7", month: "march", week: "Week 4", client: "ArkTechies", status: "Scheduled", plannedDate: "2024-03-22" },
  { id: "8", month: "march", week: "Week 4", client: "Visa Nagendar", status: "Delayed", plannedDate: "2024-03-25" },
  { id: "9", month: "april", week: "Week 1", client: "Telugu Pizza", status: "Scheduled", plannedDate: "2024-04-01" },
  { id: "10", month: "april", week: "Week 1", client: "Smart Snaxx", status: "Scheduled", plannedDate: "2024-04-02" },
]

export default function DeliveryHealthHero({ month, week, client }: DeliveryHealthHeroProps) {
  const metrics = useMemo(() => {
    let filtered = mockData.filter((item) => item.month === month.toLowerCase())
    
    if (week !== "All Weeks") {
      filtered = filtered.filter((item) => item.week === week)
    }
    
    if (client !== "All Clients") {
      filtered = filtered.filter((item) => item.client === client)
    }

    const delivered = filtered.filter((item) => item.status === "Published" || item.status === "Scheduled").length
    const total = filtered.length
    const pending = filtered.filter((item) => item.status === "Planned").length
    const delayed = filtered.filter((item) => item.status === "Delayed").length
    const healthPercentage = total > 0 ? Math.round((delivered / total) * 100) : 0

    return { delivered, total, pending, delayed, healthPercentage }
  }, [month, week, client])

  // Color logic: 90-100% green, 70-89% yellow, below 70% red
  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return { bg: "bg-green-50", text: "text-green-700", bar: "bg-green-600" }
    if (percentage >= 70) return { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-600" }
    return { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-600" }
  }

  const colors = getHealthColor(metrics.healthPercentage)

  return (
    <div className={cn(colors.bg, "rounded-lg p-8 mb-12 border border-gray-200")}>
      {/* Title */}
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-6">Delivery Health</p>

      {/* Large Percentage */}
      <div className="flex items-baseline gap-3 mb-8">
        <span className={cn("text-7xl font-bold", colors.text)}>
          {metrics.healthPercentage}%
        </span>
        <span className="text-gray-500 text-lg font-medium">
          Content On Time
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex gap-12 mb-8">
        <div>
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.delivered} / {metrics.total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.pending}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Delayed</p>
          <p className="text-2xl font-bold text-red-600">{metrics.delayed}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={cn(colors.bar, "h-3 rounded-full transition-all")}
          style={{ width: `${metrics.healthPercentage}%` }}
        />
      </div>
    </div>
  )
}
