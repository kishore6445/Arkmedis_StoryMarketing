"use client"

import { useState, useEffect } from "react"
import { FileText, AlertCircle, CheckCircle, Clock, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ContentRecordListItem } from "@/lib/content-records"

interface ContentVisibilityTableProps {
  activeTab?: string
  searchQuery?: string
  filters?: {
    month?: string
    week?: string
    client?: string
  }
  refreshKey?: number
  onEdit?: (record: ContentRecordListItem) => void
  onDataChanged?: () => void
  showActions?: boolean
}

export default function ContentVisibilityTable({
  activeTab = "all",
  searchQuery = "",
  filters = {},
  refreshKey = 0,
  onEdit,
  onDataChanged,
  showActions = true,
}: ContentVisibilityTableProps) {
  const [records, setRecords] = useState<ContentRecordListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          viewMode: activeTab,
        })

        if (filters.client) params.append("client", filters.client)
        if (filters.month) params.append("month", filters.month)
        if (filters.week) params.append("week", filters.week)
        if (searchQuery) params.append("search", searchQuery)

        const token = localStorage.getItem("sessionToken")

        const response = await fetch(`/api/content/records?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!response.ok) throw new Error("Failed to fetch records")

        const data = await response.json()
        setRecords(data.records || [])
      } catch (err) {
        console.error("[v0] Error fetching content records:", err)
        setError(err instanceof Error ? err.message : "Failed to load records")
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [activeTab, filters.client, filters.month, filters.week, refreshKey, searchQuery])

  const handleDelete = async (record: ContentRecordListItem) => {
    const confirmed = window.confirm(`Delete "${record.title}"?`)
    if (!confirmed) {
      return
    }

    try {
      setDeletingId(record.id)
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/content/records/${record.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete content")
      }

      setRecords((currentRecords) => currentRecords.filter((currentRecord) => currentRecord.id !== record.id))
      onDataChanged?.()
    } catch (deleteError) {
      console.error("[v0] Failed to delete content record:", deleteError)
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete content")
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PUBLISHED: "bg-green-50 text-green-700 border-green-200",
      SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
      IN_PRODUCTION: "bg-yellow-50 text-yellow-700 border-yellow-200",
      PLANNED: "bg-gray-50 text-gray-700 border-gray-200",
      DELAYED: "bg-red-50 text-red-700 border-red-200",
    }
    return colors[status] || colors.PLANNED
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <CheckCircle className="w-4 h-4" />
      case "DELAYED":
        return <AlertCircle className="w-4 h-4" />
      case "SCHEDULED":
        return <Clock className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading content records...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="text-sm font-medium">{error}</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No content records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Title</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Client</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Platform</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Scheduled</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Owner</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
            {showActions && <th className="px-4 py-3 text-right font-semibold text-gray-900">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-medium">{record.title}</td>
              <td className="px-4 py-3 text-gray-600">{record.client}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{record.platform}</td>
              <td className="px-4 py-3 text-gray-600">{record.scheduledDate}</td>
              <td className="px-4 py-3 text-gray-600">{record.owner}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border",
                    getStatusColor(record.status)
                  )}
                >
                  {getStatusIcon(record.status)}
                  {record.status}
                </span>
              </td>
              {showActions && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(record)}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      disabled={deletingId === record.id}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === record.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
