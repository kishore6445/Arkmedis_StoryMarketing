"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentPipelineFlowProps {
  target: number
  productionDone: number
  scheduled: number
  published: number
}

export function ContentPipelineFlow({
  target,
  productionDone,
  scheduled,
  published,
}: ContentPipelineFlowProps) {
  const stages = [
    { label: "Target", value: target, color: "bg-gray-100 text-gray-700" },
    { label: "Production Done", value: productionDone, color: "bg-amber-100 text-amber-700" },
    { label: "Scheduled", value: scheduled, color: "bg-blue-100 text-blue-700" },
    { label: "Published", value: published, color: "bg-green-100 text-green-700" },
  ]

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Content Pipeline Flow</h3>
      
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {stages.map((stage, idx) => (
          <div key={stage.label} className="flex items-center gap-2 flex-shrink-0">
            <div className={cn("px-4 py-2 rounded-lg text-center min-w-24", stage.color)}>
              <div className="text-lg font-bold">{stage.value}</div>
              <div className="text-xs font-medium">{stage.label}</div>
            </div>
            
            {idx < stages.length - 1 && (
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drop-off indicators */}
      {target > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="font-semibold">Target → Production:</span>
              <span className="ml-2 text-amber-600 font-medium">
                {Math.round(((target - productionDone) / target) * 100)}% gap
              </span>
            </div>
            <div>
              <span className="font-semibold">Production → Scheduled:</span>
              <span className="ml-2 text-blue-600 font-medium">
                {Math.round(((productionDone - scheduled) / productionDone) * 100)}% gap
              </span>
            </div>
            <div>
              <span className="font-semibold">Scheduled → Published:</span>
              <span className="ml-2 text-green-600 font-medium">
                {Math.round(((scheduled - published) / scheduled) * 100)}% gap
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
