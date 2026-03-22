"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface WeeklyDeliveryTrackerProps {
  month: string
  client: string
}

const mockData = [
  { id: "1", month: "march", week: "Week 1", client: "Telugu Pizza", status: "Published", plannedDate: "2024-03-01" },
  { id: "2", month: "march", week: "Week 1", client: "Smart Snaxx", status: "Delayed", plannedDate: "2024-03-02" },
  { id: "3", month: "march", week: "Week 1", client: "Visa Nagendar", status: "Scheduled", plannedDate: "2024-03-03" },
  { id: "4", month: "march", week: "Week 2", client: "Story Marketing", status: "Planned", plannedDate: "2024-03-08" },
  { id: "5", month: "march", week: "Week 2", client: "Telugu Pizza", status: "Scheduled", plannedDate: "2024-03-10" },
  { id: "6", month: "march", week: "Week 3", client: "Smart Snaxx", status: "Published", plannedDate: "2024-03-17" },
  { id: "7", month: "march", week: "Week 3", client: "ArkTechies", status: "Published", plannedDate: "2024-03-19" },
  { id: "8", month: "march", week: "Week 4", client: "Visa Nagendar", status: "Delayed", plannedDate: "2024-03-25" },
  { id: "9", month: "march", week: "Week 4", client: "Telugu Pizza", status: "Scheduled", plannedDate: "2024-03-28" },
]

export default function WeeklyDeliveryTracker({ month, client }: WeeklyDeliveryTrackerProps) {
  const weeklyMetrics = useMemo(() => {
    const weeks = new Map<string, { planned: number; delivered: number }>()

    mockData.forEach((item) => {
      if (item.month === month.toLowerCase() && (client === "All Clients" || item.client === client)) {
        if (!weeks.has(item.week)) {
          weeks.set(item.week, { planned: 0, delivered: 0 })
        }

        const weekData = weeks.get(item.week)!
        weekData.planned += 1
        
        // Delivered = Published + Scheduled
        if (item.status === "Published" || item.status === "Scheduled") {
          weekData.delivered += 1
        }
      }
    })

    // Convert to array and calculate percentages
    return Array.from(weeks.entries()).map(([week, data]) => ({
      week,
      planned: data.planned,
      delivered: data.delivered,
      percentage: data.planned > 0 ? Math.round((data.delivered / data.planned) * 100) : 0,
    }))
  }, [month, client])

  const getDeliveryColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-700"
    if (percentage >= 70) return "bg-amber-100 text-amber-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Delivery Tracker</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeklyMetrics.map((week) => (
          <div key={week.week} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{week.week}</p>
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Planned</p>
                <p className="text-2xl font-bold text-gray-900">{week.planned}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{week.delivered}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={cn("h-2 rounded-full transition-all", week.percentage >= 90 ? "bg-green-600" : week.percentage >= 70 ? "bg-amber-600" : "bg-red-600")}
                  style={{ width: `${week.percentage}%` }}
                />
              </div>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", getDeliveryColor(week.percentage))}>
                {week.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
