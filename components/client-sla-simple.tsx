"use client"

import { cn } from "@/lib/utils"

interface ClientSLAItem {
  client: string
  promised: number
  delivered: number
  risk: "On Track" | "Medium Risk" | "High Risk"
}

export default function ClientSLASimple() {
  const slaData: ClientSLAItem[] = [
    { client: "Telugu Pizza", promised: 20, delivered: 14, risk: "Medium Risk" },
    { client: "Smart Snaxx", promised: 16, delivered: 9, risk: "High Risk" },
    { client: "Visa Nagendar", promised: 12, delivered: 11, risk: "On Track" },
    { client: "Story Marketing", promised: 15, delivered: 15, risk: "On Track" },
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "On Track":
        return { badge: "bg-green-100 text-green-700", bar: "bg-green-600" }
      case "Medium Risk":
        return { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-600" }
      case "High Risk":
        return { badge: "bg-red-100 text-red-700", bar: "bg-red-600" }
      default:
        return { badge: "bg-gray-100 text-gray-700", bar: "bg-gray-600" }
    }
  }

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Client SLA Tracker</h2>

      <div className="space-y-4">
        {slaData.map((item) => {
          const slaPercentage = Math.round((item.delivered / item.promised) * 100)
          const colors = getRiskColor(item.risk)

          return (
            <div key={item.client} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              {/* Row header with client and stats */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.client}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm">
                    <span className="text-gray-600">{item.delivered} / {item.promised}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 min-w-12">
                    {slaPercentage}%
                  </div>
                  <div className={cn("px-3 py-1 rounded-full text-xs font-medium", colors.badge)}>
                    {item.risk}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(colors.bar, "h-2 rounded-full transition-all")}
                  style={{ width: `${slaPercentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
