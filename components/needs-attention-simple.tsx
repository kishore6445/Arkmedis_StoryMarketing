"use client"

import { AlertCircle } from "lucide-react"

interface DelayedItem {
  id: string
  client: string
  title: string
}

export default function NeedsAttentionSimple() {
  const delayedItems: DelayedItem[] = [
    { id: "1", client: "Smart Snaxx", title: "Product Launch Reel" },
    { id: "2", client: "Visa Nagendar", title: "Webinar Promo" },
    { id: "3", client: "Telugu Pizza", title: "Founder Reel" },
    { id: "4", client: "Story Marketing", title: "Hiring Blog" },
  ]

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold text-gray-900">Needs Attention</h2>
        <span className="text-sm text-red-600 font-medium">{delayedItems.length} Delayed Items</span>
      </div>

      <ul className="space-y-3">
        {delayedItems.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5 px-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
            <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.client}</p>
              <p className="text-xs text-gray-600 truncate">{item.title}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
