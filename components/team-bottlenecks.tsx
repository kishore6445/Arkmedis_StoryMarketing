"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember {
  name: string
  assigned: number
  delayed: number
}

export default function TeamBottlenecks() {
  const teamData: TeamMember[] = [
    { name: "Ravi", assigned: 12, delayed: 3 },
    { name: "Kavitha", assigned: 15, delayed: 1 },
    { name: "Gaurav", assigned: 9, delayed: 2 },
    { name: "Pujitha", assigned: 11, delayed: 0 },
  ]

  const needsSupport = teamData.filter((member) => member.delayed > 2)

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Bottlenecks</h2>

      <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-600 uppercase">Owner</div>
          <div className="text-xs font-semibold text-gray-600 uppercase">Assigned</div>
          <div className="text-xs font-semibold text-gray-600 uppercase">Delayed</div>
        </div>

        {/* Table Body */}
        {teamData.map((member) => {
          const isBottleneck = member.delayed > 2

          return (
            <div
              key={member.name}
              className={cn(
                "grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0",
                isBottleneck && "bg-red-50"
              )}
            >
              <div className={cn("font-medium", isBottleneck && "text-red-700 flex items-center gap-2")}>
                {isBottleneck && <AlertCircle className="w-4 h-4" />}
                {member.name}
              </div>
              <div className="text-sm text-gray-600">{member.assigned}</div>
              <div className={cn("font-medium", member.delayed > 0 ? "text-red-600" : "text-gray-600")}>
                {member.delayed}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
