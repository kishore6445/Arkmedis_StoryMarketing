"use client"

import { Search } from "lucide-react"

interface ContentTrackerFiltersProps {
  filters: {
    client: string
    platform: string
    owner: string
    status: string
    month: string
  }
  onFilterChange: (filters: any) => void
  contentData: any[]
}

export function ContentTrackerFilters({ filters, onFilterChange, contentData }: ContentTrackerFiltersProps) {
  // Extract unique values for dropdowns
  const clients = Array.from(new Set(contentData.map((d) => d.client)))
  const platforms = Array.from(new Set(contentData.map((d) => d.platform)))
  const owners = Array.from(new Set(contentData.map((d) => d.owner)))
  const statuses = Array.from(new Set(contentData.map((d) => d.status)))

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onFilterChange({
      client: "",
      platform: "",
      owner: "",
      status: "",
      month: new Date().toISOString().slice(0, 7),
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Client Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Client</label>
          <select
            value={filters.client}
            onChange={(e) => handleFilterChange("client", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Platform</label>
          <select
            value={filters.platform}
            onChange={(e) => handleFilterChange("platform", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Owner</label>
          <select
            value={filters.owner}
            onChange={(e) => handleFilterChange("owner", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Owners</option>
            {owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Month</label>
          <input
            type="month"
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )
}
