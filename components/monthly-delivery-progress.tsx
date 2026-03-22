"use client"

import { TrendingUp } from "lucide-react"

interface MonthlyDeliveryProgressProps {
  month?: string
}

export default function MonthlyDeliveryProgress({ month }: MonthlyDeliveryProgressProps) {
  const published = 42
  const total = 60
  const percentage = (published / total) * 100

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-8 border border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Monthly Delivery Progress</h2>
          <p className="text-sm text-gray-600 mt-1">March 2026 content delivery status</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">{Math.round(percentage)}% Complete</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-700 font-medium">
          <span className="font-bold text-gray-900">{published}</span> of <span className="font-bold text-gray-900">{total}</span> content pieces delivered
        </p>
      </div>
    </div>
  )
}
