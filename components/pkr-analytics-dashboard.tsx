"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface PKRRowData {
  id: string
  name: string
  pkrPercentage: number
  total: number
  kept: number
  atRisk: number
  missed: number
}

interface PKRAnalyticsDashboardProps {
  usersPKRData?: PKRRowData[]
  clientsPKRData?: PKRRowData[]
  overallPKR?: number
  internalPKR?: number
  externalPKR?: number
  totalPromises?: number
  keptPromises?: number
  atRiskPromises?: number
  missedPromises?: number
  totalInternalTasks?: number
  keptInternalTasks?: number
}

const PKRCircle = ({ percentage, size = "lg" }: { percentage: number; size?: "sm" | "md" | "lg" }) => {
  const radius = size === "lg" ? 45 : size === "md" ? 35 : 25
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 90) return "#10B981" // green
    if (percentage >= 80) return "#3B82F6" // blue
    if (percentage >= 70) return "#F59E0B" // amber
    return "#EF4444" // red
  }

  const sizeClasses = size === "lg" ? "w-32 h-32" : size === "md" ? "w-24 h-24" : "w-16 h-16"
  const textSize = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg"

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses)}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </svg>
      <div className={`absolute text-center ${textSize} font-semibold text-gray-900`}>{percentage}%</div>
    </div>
  )
}

export function PKRAnalyticsDashboard({
  usersPKRData = [],
  clientsPKRData = [],
  overallPKR = 0,
  internalPKR = 0,
  externalPKR = 0,
  totalPromises = 0,
  keptPromises = 0,
  atRiskPromises = 0,
  missedPromises = 0,
  totalInternalTasks = 0,
  keptInternalTasks = 0,
}: PKRAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"users" | "clients">("users")
  const [searchTerm, setSearchTerm] = useState("")

  const currentData = activeTab === "users" ? usersPKRData : clientsPKRData
  const filteredData = currentData.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-8">
      {/* Company-Wide PKR Hero */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Overall PKR</p>
            <p className="text-6xl font-bold text-gray-900 mb-2">{overallPKR}%</p>
            <p className="text-sm text-gray-500">
              (Internal {internalPKR}% + External {externalPKR}%) ÷ 2
            </p>
          </div>
          <div className="flex-shrink-0">
            <PKRCircle percentage={overallPKR} size="lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal (Team)</p>
            <p className="text-2xl font-bold text-gray-900">{internalPKR}%</p>
            <p className="text-sm text-gray-600">{keptInternalTasks} of {totalInternalTasks} tasks on time</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">External (Client)</p>
            <p className="text-2xl font-bold text-gray-900">{externalPKR}%</p>
            <p className="text-sm text-gray-600">{keptPromises} of {totalPromises} client promises kept</p>
            {(missedPromises > 0 || atRiskPromises > 0) && (
              <p className="text-xs text-red-600 font-medium">{missedPromises} missed · {atRiskPromises} at risk</p>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "px-4 py-3 font-medium text-sm transition-colors border-b-2",
            activeTab === "users"
              ? "text-gray-900 border-gray-900"
              : "text-gray-600 hover:text-gray-900 border-transparent"
          )}
        >
          By Team Member
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={cn(
            "px-4 py-3 font-medium text-sm transition-colors border-b-2",
            activeTab === "clients"
              ? "text-gray-900 border-gray-900"
              : "text-gray-600 hover:text-gray-900 border-transparent"
          )}
        >
          By Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab === "users" ? "team members" : "clients"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid of PKR Circles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredData.map((item) => (
          <div key={item.id} className="flex flex-col items-center justify-center space-y-4 p-6 rounded-xl hover:bg-gray-50 transition-colors">
            <PKRCircle percentage={item.pkrPercentage} size="md" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-gray-900 text-sm truncate max-w-xs">{item.name}</p>
              <p className="text-xs text-gray-600">
                {item.kept}/{item.total} promises
              </p>
              {item.missed > 0 && (
                <p className="text-xs text-red-600 font-medium">{item.missed} missed</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found</p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 space-y-2">
        <p className="font-semibold text-blue-900 text-sm">About PKR</p>
        <p className="text-sm text-blue-800">
          Promises Kept Ratio measures commitment adherence. Higher percentages indicate better reliability and follow-through. Target: 90%+ for exceptional performance.
        </p>
      </div>
    </div>
  )
}
