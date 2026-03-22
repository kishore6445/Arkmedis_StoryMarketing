"use client"

import { TrendingUp } from "lucide-react"

interface ClientDelivery {
  id: string
  clientName: string
  planned: number
  published: number
  completionPercentage: number
  healthStatus: "excellent" | "good" | "at-risk"
}

const mockClientDeliveries: ClientDelivery[] = [
  {
    id: "1",
    clientName: "Telugu Pizza",
    planned: 15,
    published: 14,
    completionPercentage: 93,
    healthStatus: "excellent",
  },
  {
    id: "2",
    clientName: "Story Marketing",
    planned: 18,
    published: 13,
    completionPercentage: 72,
    healthStatus: "at-risk",
  },
  {
    id: "3",
    clientName: "Visa Nagendar",
    planned: 10,
    published: 9,
    completionPercentage: 90,
    healthStatus: "excellent",
  },
  {
    id: "4",
    clientName: "Smart Snaxx",
    planned: 12,
    published: 8,
    completionPercentage: 67,
    healthStatus: "at-risk",
  },
  {
    id: "5",
    clientName: "ArkTechies",
    planned: 5,
    published: 5,
    completionPercentage: 100,
    healthStatus: "excellent",
  },
]

const healthColors = {
  excellent: { bg: "bg-green-50", badge: "bg-green-100 text-green-700", bar: "bg-green-500", icon: "✓" },
  good: { bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500", icon: "→" },
  "at-risk": { bg: "bg-red-50", badge: "bg-red-100 text-red-700", bar: "bg-red-500", icon: "!" },
}

export default function ClientDeliveryStatus({ month }: { month?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Client Delivery Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockClientDeliveries.map((client) => {
          const colors = healthColors[client.healthStatus]
          return (
            <div key={client.id} className={`rounded-lg p-4 border-2 border-gray-200 ${colors.bg} hover:shadow-md transition-all`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{client.clientName}</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${colors.badge}`}>
                  {client.healthStatus === "excellent"
                    ? "Excellent"
                    : client.healthStatus === "good"
                      ? "Good"
                      : "At Risk"}
                </span>
              </div>

              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`${colors.bar} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${client.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-bold mb-1">Progress</p>
                  <p className="text-sm font-bold text-gray-900">
                    <span className="text-lg">{client.published}</span>/<span className="text-sm">{client.planned}</span>
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{client.completionPercentage}%</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
