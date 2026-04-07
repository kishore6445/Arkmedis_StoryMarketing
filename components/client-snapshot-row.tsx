"use client"

import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ClientSnapshot {
  id: string
  name: string
  published: number
  target: number
  status: "on-track" | "needs-attention" | "at-risk"
}

interface ClientSnapshotRowProps {
  clients: ClientSnapshot[]
}

export function ClientSnapshotRow({ clients }: ClientSnapshotRowProps) {
  const router = useRouter()

  if (clients.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Client Performance</h3>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {clients.map((client) => {
            const progress = client.target > 0 ? (client.published / client.target) * 100 : 0
            
            let statusDot = "bg-green-500"
            if (client.status === "needs-attention") statusDot = "bg-amber-500"
            if (client.status === "at-risk") statusDot = "bg-red-500"

            return (
              <button
                key={client.id}
                onClick={() => router.push(`/content-visibility/client/${client.id}`)}
                className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{client.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {client.published} <span className="text-gray-400">of</span> {client.target}
                    </p>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", statusDot)} />
                </div>
                
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                <p className="text-xs text-gray-600">
                  {Math.round(progress)}% complete
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
