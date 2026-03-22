"use client"

import { AlertCircle, ChevronRight } from "lucide-react"

interface AttentionItem {
  id: string
  client: string
  contentTitle: string
  type: "delayed" | "due-today" | "awaiting-approval"
  priority: "critical" | "high" | "medium"
}

const mockAttentionItems: AttentionItem[] = [
  {
    id: "1",
    client: "Smart Snaxx",
    contentTitle: "Product Launch Reel",
    type: "delayed",
    priority: "critical",
  },
  {
    id: "2",
    client: "Visa Nagendar",
    contentTitle: "Webinar Promo",
    type: "delayed",
    priority: "critical",
  },
  {
    id: "3",
    client: "Telugu Pizza",
    contentTitle: "Founder Reel",
    type: "due-today",
    priority: "high",
  },
  {
    id: "4",
    client: "Story Marketing",
    contentTitle: "Hiring Blog",
    type: "awaiting-approval",
    priority: "high",
  },
]

const typeLabels = {
  delayed: "Delayed",
  "due-today": "Due Today",
  "awaiting-approval": "Awaiting Approval",
}

const typeColors = {
  delayed: { bg: "bg-red-50", badge: "bg-red-100 text-red-700", border: "border-red-200" },
  "due-today": { bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  "awaiting-approval": { bg: "bg-orange-50", badge: "bg-orange-100 text-orange-700", border: "border-orange-200" },
}

export default function NeedsAttentionPanel() {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Needs Attention Today</h2>
        <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 font-bold text-sm rounded-full">
          {mockAttentionItems.length} Items
        </span>
      </div>

      <div className="space-y-2">
        {mockAttentionItems.map((item) => {
          const colors = typeColors[item.type]
          return (
            <button
              key={item.id}
              className={`w-full p-4 rounded-lg border-2 transition-all hover:shadow-md ${colors.bg} ${colors.border} text-left`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{item.client}</p>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${colors.badge}`}>
                      {typeLabels[item.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{item.contentTitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
