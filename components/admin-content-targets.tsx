'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, Trash2, ChevronDown, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getClientTargets,
  batchUpdateTargets,
  PLATFORMS,
  getCurrentMonthYear,
  formatMonthYear,
  type Platform,
  type ContentTarget,
} from '@/lib/platform-targets-service'

interface Client {
  id: string
  name: string
}

interface AdminContentTargetsProps {
  clients: Client[]
}

export function AdminContentTargets({ clients }: AdminContentTargetsProps) {
  const [selectedClient, setSelectedClient] = useState<string>(clients[0]?.id || '')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [targets, setTargets] = useState<Record<Platform, number>>({} as Record<Platform, number>)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialize with current month
  useEffect(() => {
    const { month: currentMonth } = getCurrentMonthYear()
    setMonth(currentMonth)
  }, [])

  // Load targets for selected client/month
  useEffect(() => {
    if (!selectedClient || !month) return

    const loadTargets = async () => {
      setLoading(true)
      const data = await getClientTargets(selectedClient, month, year)
      
      // Initialize all platforms with 0
      const platformTargets = {} as Record<Platform, number>
      PLATFORMS.forEach((platform) => {
        const target = data.find((t) => t.platform === platform)
        platformTargets[platform] = target?.target_count || 0
      })
      
      setTargets(platformTargets)
      setLoading(false)
    }

    loadTargets()
  }, [selectedClient, month, year])

  const handleUpdateTarget = (platform: Platform, value: number) => {
    setTargets((prev) => ({
      ...prev,
      [platform]: Math.max(0, value),
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedClient) return

    setLoading(true)
    await batchUpdateTargets(selectedClient, month, year, targets)
    setSaved(true)
    setLoading(false)

    // Clear saved state after 2 seconds
    setTimeout(() => setSaved(false), 2000)
  }

  const totalTarget = Object.values(targets).reduce((sum, count) => sum + count, 0)
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Targets</h2>
        <p className="text-sm text-gray-600 mt-1">Set platform-specific content targets for each client by month</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Client Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Input Grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatMonthYear(month, year)} - Platform Targets
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-4">
              {/* Platform Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => (
                  <div
                    key={platform}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">{platform}</label>
                    <input
                      type="number"
                      min="0"
                      value={targets[platform] || 0}
                      onChange={(e) => handleUpdateTarget(platform, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">posts/month</p>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">Total Monthly Target:</div>
                  <div className="text-3xl font-black text-blue-600">{totalTarget}</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Across {Object.values(targets).filter((v) => v > 0).length} platforms
                </p>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                    saved
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  )}
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Targets'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Set targets for each platform to track content production across your social channels. These targets
          are used to calculate completion percentages and identify bottlenecks in your content pipeline.
        </p>
      </div>
    </div>
  )
}
