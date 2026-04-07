"use client"

import { AlertCircle, Zap, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottleneckInsight {
  type: "shortfall" | "production_lag" | "scheduling_lag" | "publishing_lag"
  message: string
  count?: number
  severity: "low" | "medium" | "high"
}

interface BottleneckInsightRowProps {
  insights: BottleneckInsight[]
}

export function BottleneckInsightRow({ insights }: BottleneckInsightRowProps) {
  if (insights.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, idx) => {
          const icon = insight.type === "shortfall" ? AlertCircle : insight.type === "production_lag" ? Zap : Clock
          const Icon = icon
          
          let bgColor = "bg-blue-50"
          let borderColor = "border-blue-200"
          let textColor = "text-blue-700"
          let iconColor = "text-blue-500"
          
          if (insight.severity === "high") {
            bgColor = "bg-red-50"
            borderColor = "border-red-200"
            textColor = "text-red-700"
            iconColor = "text-red-500"
          } else if (insight.severity === "medium") {
            bgColor = "bg-amber-50"
            borderColor = "border-amber-200"
            textColor = "text-amber-700"
            iconColor = "text-amber-500"
          }

          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border p-4 flex items-start gap-3",
                bgColor,
                borderColor
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColor)} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", textColor)}>
                  {insight.message}
                </p>
                {insight.count !== undefined && (
                  <p className={cn("text-xs mt-1", textColor.replace("700", "600"))}>
                    {insight.count} {insight.type.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
