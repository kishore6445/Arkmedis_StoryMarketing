"use client"

import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react"

interface ContentTrackerSummaryProps {
  stats: {
    totalPlanned: number
    totalPosted: number
    totalPending: number
    totalMissed: number
  }
}

export function ContentTrackerSummary({ stats }: ContentTrackerSummaryProps) {
  const summaryCards = [
    {
      icon: Clock,
      label: "Total Planned",
      value: stats.totalPlanned,
      color: "gray",
      bgColor: "bg-gray-50",
      textColor: "text-gray-900",
      iconColor: "text-gray-600",
    },
    {
      icon: CheckCircle2,
      label: "Total Posted",
      value: stats.totalPosted,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
    },
    {
      icon: Zap,
      label: "Total Pending",
      value: stats.totalPending,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
    },
    {
      icon: AlertCircle,
      label: "Total Missed",
      value: stats.totalMissed,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      iconColor: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={`${card.bgColor} rounded-xl p-6 border border-gray-200 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.iconColor}`} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
