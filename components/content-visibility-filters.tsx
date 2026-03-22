"use client"

import { Search, LayoutGrid, Calendar, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContentVisibilityFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedFilters: {
    client: string
    month: string
    status: string
    platform: string
  }
  onFilterChange: (filters: any) => void
  viewMode: "table" | "calendar"
  onViewModeChange: (mode: "table" | "calendar") => void
}

export default function ContentVisibilityFilters({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  viewMode,
  onViewModeChange,
}: ContentVisibilityFiltersProps) {
  const clients = ["Telugu Pizza", "Smart Snaxx", "Visa Nagendar", "Story Marketing", "ArkTechies"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const platforms = ["Instagram", "LinkedIn", "YouTube", "Blog", "Email"]
  const statuses = ["Planned", "Scheduled", "Published"]

  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedFilters.client}
          onChange={(e) => onFilterChange({ ...selectedFilters, client: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Clients</option>
          {clients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.month}
          onChange={(e) => onFilterChange({ ...selectedFilters, month: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.status}
          onChange={(e) => onFilterChange({ ...selectedFilters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={selectedFilters.platform}
          onChange={(e) => onFilterChange({ ...selectedFilters, platform: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <div className="flex gap-2 ml-auto">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Sort
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>

        <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("table")}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === "table"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            )}
            title="Table View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("calendar")}
            className={cn(
              "p-2 rounded transition-colors",
              viewMode === "calendar"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            )}
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
