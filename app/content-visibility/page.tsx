"use client"

import { useEffect, useState } from "react"
import { Plus, Download, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { ContentClientPipeline } from "@/components/content-client-pipeline"
import { ContentCalendarView } from "@/components/content-calendar-view"
import ContentVisibilityTable from "@/components/content-visibility-table"
import AddContentModal from "@/components/add-content-modal-cv"
import { CommandCenterSummary } from "@/components/command-center-summary"
import { BottleneckInsightRow } from "@/components/bottleneck-insight-row"
import { ClientSnapshotRow } from "@/components/client-snapshot-row"
import { ContentPipelineFlow } from "@/components/content-pipeline-flow"
import type { ContentRecordListItem } from "@/lib/content-records"

// Get current month
const getCurrentMonth = () => {
  const date = new Date()
  return date.toLocaleString("default", { month: "long" }).toLowerCase()
}

type ClientOption = {
  id: string
  name: string
}

type PipelineClient = {
  id: string
  name: string
  planned: number
  scheduled: number
  published: number
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

const TABS = [
  { id: "pipeline", label: "Pipeline Overview" },
  { id: "calendar", label: "Content Calendar" },
  { id: "tracker", label: "Content Tracker" },
]

export default function ContentVisibilityPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedClient, setSelectedClient] = useState("All Clients")
  const [activeTab, setActiveTab] = useState("pipeline")
  const [isLoading, setIsLoading] = useState(true)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [pipelineRecords, setPipelineRecords] = useState<ContentRecordListItem[]>([])
  const [pageError, setPageError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingRecord, setEditingRecord] = useState<ContentRecordListItem | null>(null)

  useEffect(() => {
    const loadContentManagementData = async () => {
      try {
        setIsLoading(true)
        setPageError(null)

        const token = localStorage.getItem("sessionToken")
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const params = new URLSearchParams({
          viewMode: "all",
          month: selectedMonth,
        })

        if (selectedClient !== "All Clients") {
          params.append("client", selectedClient)
        }

        const [clientsResponse, recordsResponse] = await Promise.all([
          fetch("/api/clients", { headers }),
          fetch(`/api/content/records?${params.toString()}`, { headers }),
        ])

        if (!clientsResponse.ok || !recordsResponse.ok) {
          throw new Error("Failed to load content management data")
        }

        const clientsData = await clientsResponse.json()
        const recordsData = await recordsResponse.json()

        setClients(clientsData.clients || [])
        setPipelineRecords(recordsData.records || [])
      } catch (loadError) {
        console.error("[v0] Failed to load content management data:", loadError)
        setPageError(loadError instanceof Error ? loadError.message : "Failed to load content management data")
        setClients([])
        setPipelineRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    loadContentManagementData()
  }, [selectedMonth, selectedClient, refreshKey])

  const clientOptions = ["All Clients", ...clients.map((client) => client.name)]

  const pipelineMap = new Map<string, PipelineClient>()

  clients.forEach((client) => {
    if (selectedClient === "All Clients" || client.name === selectedClient) {
      pipelineMap.set(client.name, {
        id: client.id,
        name: client.name,
        planned: 0,
        scheduled: 0,
        published: 0,
      })
    }
  })

  pipelineRecords.forEach((record) => {
    const currentClient = pipelineMap.get(record.client) || {
      id: record.clientId,
      name: record.client,
      planned: 0,
      scheduled: 0,
      published: 0,
    }

    const hasPlannedDate = Boolean(record.plannedDate)
    const hasScheduledDate = Boolean(record.scheduledDate)
    const hasPublishedDate = Boolean(record.publishedDate)
    const isScheduledStatus = record.status === "SCHEDULED"
    const isPublishedStatus = record.status === "PUBLISHED"

    if (hasPlannedDate || hasScheduledDate || hasPublishedDate || record.status) {
      currentClient.planned += 1
    }

    if (hasScheduledDate || isScheduledStatus || isPublishedStatus) {
      currentClient.scheduled += 1
    }

    if (hasPublishedDate || isPublishedStatus) {
      currentClient.published += 1
    }

    pipelineMap.set(record.client, currentClient)
  })

  const displayClients = Array.from(pipelineMap.values())

  const totals = displayClients.reduce(
    (accumulator, client) => ({
      planned: accumulator.planned + client.planned,
      scheduled: accumulator.scheduled + client.scheduled,
      published: accumulator.published + client.published,
    }),
    { planned: 0, scheduled: 0, published: 0 }
  )

  // Calculate insights for bottleneck detection
  const generateInsights = () => {
    const insights = []
    const targetCount = totals.planned // Using planned as the target
    const productionDone = totals.scheduled - totals.published
    
    // Shortfall check
    if (targetCount > 0 && totals.published < Math.floor(targetCount * 0.7)) {
      const gap = targetCount - totals.published
      insights.push({
        type: "shortfall" as const,
        message: `${gap} more posts needed to hit target`,
        count: gap,
        severity: gap > Math.floor(targetCount * 0.5) ? "high" : "medium",
      })
    }

    // Production lag
    if (totals.planned > 0 && totals.scheduled < Math.floor(totals.planned * 0.5)) {
      const lag = totals.planned - totals.scheduled
      insights.push({
        type: "production_lag" as const,
        message: `${lag} posts not yet scheduled`,
        count: lag,
        severity: lag > Math.floor(totals.planned * 0.3) ? "high" : "medium",
      })
    }

    // Publishing lag
    if (totals.scheduled > totals.published) {
      const lag = totals.scheduled - totals.published
      insights.push({
        type: "publishing_lag" as const,
        message: `${lag} scheduled posts pending publication`,
        count: lag,
        severity: lag > 5 ? "high" : "low",
      })
    }

    return insights
  }

  // Generate platform metrics for expandable view
  const generatePlatformMetrics = () => {
    try {
      const PLATFORMS = ["Instagram", "LinkedIn", "YouTube", "Blog", "Facebook", "Email", "TikTok", "Twitter/X", "Website"]
      
      // Initialize platform counts
      const platformCounts: Record<string, { achieved: number; target: number }> = {}
      PLATFORMS.forEach(platform => {
        platformCounts[platform] = { achieved: 0, target: 0 }
      })

      // Aggregate platform data from pipelineRecords
      if (Array.isArray(pipelineRecords) && pipelineRecords.length > 0) {
        pipelineRecords.forEach((record: any) => {
          const platform = (record?.platform && record.platform.trim()) ? record.platform : "Blog"
          if (platformCounts[platform]) {
            platformCounts[platform].achieved += 1
          }
        })
      }

      // Calculate targets - divide total planned by number of active platforms
      const activePlatforms = Object.keys(platformCounts).filter(p => platformCounts[p].achieved > 0)
      
      if (activePlatforms.length === 0) {
        return []
      }

      const targetsPerPlatform = Math.ceil(totals.planned / activePlatforms.length)
      
      activePlatforms.forEach(platform => {
        platformCounts[platform].target = Math.max(targetsPerPlatform, 1)
      })

      return activePlatforms
        .map(platform => ({
          name: platform,
          achieved: platformCounts[platform].achieved,
          target: platformCounts[platform].target,
        }))
        .sort((a, b) => b.achieved - a.achieved) // Sort by achieved count descending
    } catch (error) {
      console.error("[v0] Error generating platform metrics:", error)
      return []
    }
  }

  // Generate client snapshots for "All Clients" view
  const generateClientSnapshots = () => {
    try {
      if (selectedClient !== "All Clients") return []
      
      return displayClients.slice(0, 5).map((client) => ({
        id: client.id,
        name: client.name,
        published: client.published,
        target: client.planned,
        status: client.published >= Math.floor(client.planned * 0.7) 
          ? "on-track" 
          : client.published >= Math.floor(client.planned * 0.4) 
          ? "needs-attention" 
          : "at-risk",
      }))
    } catch (error) {
      console.error("[v0] Error generating client snapshots:", error)
      return []
    }
  }

  return (
    <div className="w-full max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-600 mt-2">Plan, schedule, and track content across all clients</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Upload">
            <Upload className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              setEditingRecord(null)
              setShowAddModal(true)
            }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Content
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Month</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Client</label>
          <select 
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white hover:border-gray-400 transition-colors"
          >
            {clientOptions.map((client) => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
      </div>

      {pageError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "text-blue-600 border-b-blue-600"
                : "text-gray-600 border-b-transparent hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "pipeline" && (
        <div className="space-y-8">
          {/* Command Center Summary - New Premium Redesign */}
          <CommandCenterSummary
            target={totals.planned}
            productionDone={totals.scheduled - totals.published + totals.published}
            scheduled={totals.scheduled}
            published={totals.published}
            clientName={selectedClient === "All Clients" ? `All Clients - ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}` : selectedClient}
            platformMetrics={generatePlatformMetrics()}
            isAllClients={selectedClient === "All Clients"}
          />

          {/* Content Pipeline Flow Visualization - New */}
          <ContentPipelineFlow
            target={totals.planned}
            productionDone={totals.scheduled - totals.published}
            scheduled={totals.scheduled}
            published={totals.published}
          />

          {/* Bottleneck Insights - New */}
          <BottleneckInsightRow insights={generateInsights()} />

          {/* Client Snapshots - Only show when All Clients selected - New */}
          {selectedClient === "All Clients" && (
            <ClientSnapshotRow clients={generateClientSnapshots()} />
          )}

          {/* Original Pipeline Overview Stats - Kept for backward compatibility */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pipeline Overview</h3>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Total Planned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totals.planned}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totals.scheduled}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {totals.published}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Gap</p>
                <p className="text-2xl font-bold text-red-600">
                  {totals.planned - totals.published}
                </p>
              </div>
            </div>
          </div>

          {/* Client Pipeline */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              {selectedClient === "All Clients" ? "All Clients" : selectedClient} - {selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}
            </h2>
            <ContentClientPipeline 
              clients={displayClients} 
              loading={isLoading}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Content Records
            </h2>
            <ContentVisibilityTable
              filters={{
                month: selectedMonth,
                client: selectedClient,
              }}
              refreshKey={refreshKey}
              onDataChanged={() => setRefreshKey((currentKey) => currentKey + 1)}
              onEdit={(record) => {
                setEditingRecord(record)
                setShowAddModal(true)
                setActiveTab("tracker")
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <div key="calendar-tab">
          <ContentCalendarView 
            clientName={selectedClient === "All Clients" ? null : selectedClient}
            selectedMonth={selectedMonth}
            refreshKey={refreshKey}
            onCreatePost={() => setShowAddModal(true)}
          />
        </div>
      )}

      {activeTab === "tracker" && (
        <div key="tracker-tab">
          <ContentVisibilityTable
            refreshKey={refreshKey}
            onDataChanged={() => setRefreshKey((currentKey) => currentKey + 1)}
            onEdit={(record) => {
              setEditingRecord(record)
              setShowAddModal(true)
            }}
          />
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal 
          onClose={() => setShowAddModal(false)}
          initialData={editingRecord}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingRecord(null)
            setRefreshKey((currentKey) => currentKey + 1)
            setActiveTab("tracker")
          }}
        />
      )}
    </div>
  )
}

