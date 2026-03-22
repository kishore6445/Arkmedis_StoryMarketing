"use client"

import { useMemo } from "react"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SchedulingReadinessProps {
  month: string
}

const mockData = [
  { id: "1", month: "march", week: "Week 1", client: "Telugu Pizza", status: "Published", plannedDate: "2024-03-01" },
  { id: "2", month: "march", week: "Week 1", client: "Smart Snaxx", status: "Scheduled", plannedDate: "2024-03-02" },
  { id: "3", month: "march", week: "Week 2", client: "Visa Nagendar", status: "Scheduled", plannedDate: "2024-03-10" },
  { id: "4", month: "april", week: "Week 1", client: "Telugu Pizza", status: "Scheduled", plannedDate: "2024-04-01" },
  { id: "5", month: "april", week: "Week 1", client: "Smart Snaxx", status: "Scheduled", plannedDate: "2024-04-02" },
  { id: "6", month: "april", week: "Week 1", client: "Visa Nagendar", status: "Scheduled", plannedDate: "2024-04-03" },
  { id: "7", month: "april", week: "Week 2", client: "Story Marketing", status: "Scheduled", plannedDate: "2024-04-08" },
  { id: "8", month: "april", week: "Week 2", client: "ArkTechies", status: "Scheduled", plannedDate: "2024-04-10" },
  { id: "9", month: "april", week: "Week 3", client: "Telugu Pizza", status: "Scheduled", plannedDate: "2024-04-17" },
]

export default function SchedulingReadiness({ month }: SchedulingReadinessProps) {
  const nextMonth = useMemo(() => {
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
    const currentIndex = months.indexOf(month.toLowerCase())
    return months[(currentIndex + 1) % 12]
  }, [month])

  const scheduledForNextMonth = useMemo(() => {
    return mockData.filter((item) => item.month === nextMonth && item.status === "Scheduled").length
  }, [nextMonth])

  const totalForNextMonth = useMemo(() => {
    return mockData.filter((item) => item.month === nextMonth).length
  }, [nextMonth])

  const readinessPercentage = totalForNextMonth > 0 ? Math.round((scheduledForNextMonth / totalForNextMonth) * 100) : 0

  return (
    <div className="mb-12 border border-blue-200 rounded-lg p-6 bg-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2">Scheduling Readiness</p>
          <p className="text-gray-600 mb-4">
            <span className="font-bold text-gray-900">{scheduledForNextMonth}</span> of <span className="font-bold text-gray-900">{totalForNextMonth}</span> posts for {nextMonth.charAt(0).toUpperCase() + nextMonth.slice(1)} are already scheduled
          </p>
          <div className="w-96 bg-blue-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-blue-600 transition-all"
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold text-blue-700">{readinessPercentage}%</p>
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-4 h-4" />
            Ready for launch
          </p>
        </div>
      </div>
    </div>
  )
}
