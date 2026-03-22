"use client"

import { useState } from "react"
import { ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClientPipeline {
  id: string
  name: string
  planned: number
  scheduled: number
  published: number
}

interface ContentClientPipelineProps {
  clients: ClientPipeline[]
  loading?: boolean
}

export function ContentClientPipeline({ clients, loading = false }: ContentClientPipelineProps) {
  const [expandedClient, setExpandedClient] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading pipeline...</p>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No clients found</p>
      </div>
    )
  }

  const getGapStatus = (planned: number, published: number) => {
    const gap = planned - published
    if (gap === 0) return { status: "on-track", label: "On Track", color: "text-green-600" }
    if (gap <= 2) return { status: "warning", label: `${gap} Behind`, color: "text-amber-600" }
    return { status: "critical", label: `${gap} Behind`, color: "text-red-600" }
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => {
        const gapStatus = getGapStatus(client.planned, client.published)
        const publishPercentage = client.planned > 0 ? Math.round((client.published / client.planned) * 100) : 0
        const isExpanded = expandedClient === client.id

        return (
          <div key={client.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
            {/* Client Header */}
            <button
              onClick={() => setExpandedClient(isExpanded ? null : client.id)}
              className="w-full px-4 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">{client.name}</h3>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-4 mr-3">
                <div className="text-right">
                  {gapStatus.status === "on-track" ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-600">On Track</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertCircle className={cn("w-4 h-4", gapStatus.color)} />
                      <span className={cn("text-xs font-semibold", gapStatus.color)}>
                        {gapStatus.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  "w-5 h-5 text-gray-400 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Pipeline Bars */}
            <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
              {/* Planned */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Planned</span>
                  <span className="text-xs font-semibold text-gray-900">{client.planned}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-400" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Scheduled */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Scheduled</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {client.scheduled}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{
                      width: `${client.planned > 0 ? (client.scheduled / client.planned) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Published */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">Published</span>
                  <span className="text-xs font-semibold text-gray-900">{client.published}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      publishPercentage === 100 ? "bg-green-500" : "bg-green-400"
                    )}
                    style={{
                      width: `${publishPercentage}%`,
                    }}
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {publishPercentage}% complete
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Gap to Publish</p>
                    <p className={cn("text-2xl font-bold", gapStatus.color)}>
                      {client.planned - client.published}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Scheduled Pending</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {client.scheduled - client.published}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Not Yet Scheduled</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {client.planned - client.scheduled}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
