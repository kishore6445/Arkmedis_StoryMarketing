"use client"

import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentVisibilitySummaryProps {
  activeTab: string
}

export default function ContentVisibilitySummary({ activeTab }: ContentVisibilitySummaryProps) {
  // Mock data - Planned This Month
  const plannedThisMonth = 60
  const published = 42
  const pending = 12
  const delayed = 6

  const cards = [
    {
      label: "Planned This Month",
      value: plannedThisMonth,
      icon: Calendar,
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconBgColor: "bg-blue-100",
      description: "Total promised content",
    },
    {
      label: "Published",
      value: published,
      icon: CheckCircle2,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconBgColor: "bg-green-100",
      description: "Already delivered",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      iconBgColor: "bg-amber-100",
      description: "Not yet published",
    },
    {
      label: "Delayed",
      value: delayed,
      icon: AlertCircle,
      color: "red",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      iconBgColor: "bg-red-100",
      description: "Past planned date",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className={cn(card.bgColor, "rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{card.label}</p>
                <p className={cn("text-3xl font-bold mt-2", card.textColor)}>
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={cn(card.iconBgColor, "p-2.5 rounded-lg flex-shrink-0")}>
                <Icon className={cn("w-5 h-5", card.textColor)} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
