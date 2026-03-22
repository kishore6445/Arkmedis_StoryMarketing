"use client"

import { Users, AlertCircle, CheckCircle2 } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  assigned: number
  inProduction: number
  scheduled: number
  delayed: number
  workloadStatus: "on-track" | "busy" | "needs-support"
}

const mockTeamWorkload: TeamMember[] = [
  {
    id: "1",
    name: "Ravi",
    assigned: 12,
    inProduction: 4,
    scheduled: 6,
    delayed: 2,
    workloadStatus: "busy",
  },
  {
    id: "2",
    name: "Kavitha",
    assigned: 8,
    inProduction: 2,
    scheduled: 5,
    delayed: 1,
    workloadStatus: "on-track",
  },
  {
    id: "3",
    name: "Gaurav",
    assigned: 15,
    inProduction: 6,
    scheduled: 7,
    delayed: 2,
    workloadStatus: "needs-support",
  },
  {
    id: "4",
    name: "Pujitha",
    assigned: 10,
    inProduction: 3,
    scheduled: 5,
    delayed: 2,
    workloadStatus: "on-track",
  },
  {
    id: "5",
    name: "Fayaz",
    assigned: 9,
    inProduction: 2,
    scheduled: 6,
    delayed: 1,
    workloadStatus: "on-track",
  },
]

const statusColors = {
  "on-track": { bg: "bg-green-50", badge: "bg-green-100 text-green-700", icon: "✓" },
  busy: { bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", icon: "⚠" },
  "needs-support": { bg: "bg-red-50", badge: "bg-red-100 text-red-700", icon: "!" },
}

const statusLabels = {
  "on-track": "On Track",
  busy: "Busy",
  "needs-support": "Needs Support",
}

export default function TeamWorkloadSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Team Workload</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Owner</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Assigned</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">In Production</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Scheduled</th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Delayed</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTeamWorkload.map((member) => {
              const colors = statusColors[member.workloadStatus]
              return (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900">{member.name}</td>
                  <td className="py-4 px-4 text-center font-bold text-gray-900">{member.assigned}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">
                      {member.inProduction}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
                      {member.scheduled}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-lg">
                      {member.delayed}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${colors.badge}`}>
                      {statusLabels[member.workloadStatus]}
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
