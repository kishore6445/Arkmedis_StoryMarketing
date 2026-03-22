"use client"

import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

interface ClientSLA {
  id: string
  clientName: string
  promised: number
  published: number
  pending: number
  delayed: number
  slaPercentage: number
  riskLevel: "on-track" | "medium-risk" | "high-risk"
}

const mockClientSLAs: ClientSLA[] = [
  {
    id: "1",
    clientName: "Telugu Pizza",
    promised: 15,
    published: 14,
    pending: 1,
    delayed: 0,
    slaPercentage: 93,
    riskLevel: "on-track",
  },
  {
    id: "2",
    clientName: "Smart Snaxx",
    promised: 12,
    published: 8,
    pending: 2,
    delayed: 2,
    slaPercentage: 67,
    riskLevel: "high-risk",
  },
  {
    id: "3",
    clientName: "Story Marketing",
    promised: 18,
    published: 13,
    pending: 4,
    delayed: 1,
    slaPercentage: 72,
    riskLevel: "medium-risk",
  },
  {
    id: "4",
    clientName: "Visa Nagendar",
    promised: 10,
    published: 9,
    pending: 1,
    delayed: 0,
    slaPercentage: 90,
    riskLevel: "on-track",
  },
  {
    id: "5",
    clientName: "ArkTechies",
    promised: 5,
    published: 5,
    pending: 0,
    delayed: 0,
    slaPercentage: 100,
    riskLevel: "on-track",
  },
]

const riskColors = {
  "on-track": {
    badge: "bg-green-100 text-green-700",
    progressBar: "bg-green-500",
    border: "border-green-200",
  },
  "medium-risk": {
    badge: "bg-amber-100 text-amber-700",
    progressBar: "bg-amber-500",
    border: "border-amber-200",
  },
  "high-risk": {
    badge: "bg-red-100 text-red-700",
    progressBar: "bg-red-500",
    border: "border-red-200",
  },
}

const riskLabels = {
  "on-track": "On Track",
  "medium-risk": "Medium Risk",
  "high-risk": "High Risk",
}

export default function ClientSLATracker({ month }: { month?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Client Content SLA Tracker</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Client</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Promised</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Published</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Pending</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Delayed</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">SLA %</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockClientSLAs.map((client) => {
              const colors = riskColors[client.riskLevel]
              return (
                <tr key={client.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${colors.border}`}>
                  <td className="py-4 px-4 font-medium text-gray-900">{client.clientName}</td>
                  <td className="py-4 px-4 text-center text-gray-700 font-semibold">{client.promised}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                      {client.published}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-lg">
                      {client.pending}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-lg">
                      {client.delayed}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-gray-900">{client.slaPercentage}%</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${colors.badge}`}>
                      {riskLabels[client.riskLevel]}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
