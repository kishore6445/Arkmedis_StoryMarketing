"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Calendar, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { KBNode } from "./kb-tree"

interface KBSearchFilters {
  query: string
  type: string | null
  priority: string | null
  dateFrom: string | null
  dateTo: string | null
  tags: string[]
}

interface KBSearchProps {
  clientId: string
  onResultsUpdate: (results: KBNode[]) => void
}

export function KBSearch({ clientId, onResultsUpdate }: KBSearchProps) {
  const [nodes, setNodes] = useState<KBNode[]>([])
  const [filters, setFilters] = useState<KBSearchFilters>({
    query: "",
    type: null,
    priority: null,
    dateFrom: null,
    dateTo: null,
    tags: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  // In a real app, this would fetch from the API
  // For now, we'll keep it simple and accept nodes from parent
  // Since parent passes clientId, this component is a search interface

  // Flatten tree to search all nodes
  const flattenNodes = (nodeList: KBNode[]): KBNode[] => {
    return nodeList.reduce((acc, node) => {
      acc.push(node)
      if (node.children) {
        acc.push(...flattenNodes(node.children))
      }
      return acc
    }, [] as KBNode[])
  }

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    flattenNodes(nodes).forEach((node) => {
      node.tags?.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [nodes])

  // Perform search
  const results = useMemo(() => {
    const allNodes = flattenNodes(nodes)

    return allNodes.filter((node) => {
      // Query search (title + content + tags)
      if (filters.query) {
        const query = filters.query.toLowerCase()
        const matchesQuery =
          node.title.toLowerCase().includes(query) ||
          node.content.toLowerCase().includes(query) ||
          node.tags?.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesQuery) return false
      }

      // Type filter
      if (filters.type && node.type !== filters.type) return false

      // Priority filter
      if (filters.priority && node.priority !== filters.priority) return false

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const nodeDate = new Date(node.createdAt)
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom)
          if (nodeDate < fromDate) return false
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo)
          toDate.setHours(23, 59, 59)
          if (nodeDate > toDate) return false
        }
      }

      // Tags filter
      if (selectedTags.size > 0) {
        const hasTag = node.tags?.some((tag) => selectedTags.has(tag))
        if (!hasTag) return false
      }

      return true
    })
  }, [nodes, filters, selectedTags])

  // Call onResultsUpdate whenever results change
  useEffect(() => {
    onResultsUpdate(results)
  }, [results, onResultsUpdate])

  const handleQueryChange = (query: string) => {
    const newFilters = { ...filters, query }
    setFilters(newFilters)
    // Note: onResultsUpdate will be called via useMemo effect below
  }

  const handleTypeChange = (type: string | null) => {
    const newFilters = { ...filters, type }
    setFilters(newFilters)
  }

  const handlePriorityChange = (priority: string | null) => {
    const newFilters = { ...filters, priority }
    setFilters(newFilters)
  }

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags)
    if (newTags.has(tag)) {
      newTags.delete(tag)
    } else {
      newTags.add(tag)
    }
    setSelectedTags(newTags)
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      type: null,
      priority: null,
      dateFrom: null,
      dateTo: null,
      tags: [],
    })
    setSelectedTags(new Set())
  }

  const activeFilterCount = [
    filters.query ? 1 : 0,
    filters.type ? 1 : 0,
    filters.priority ? 1 : 0,
    filters.dateFrom || filters.dateTo ? 1 : 0,
    selectedTags.size > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search items by title, content, or tags..."
          value={filters.query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {filters.query && (
          <button
            onClick={() => handleQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
            showAdvanced
              ? "bg-blue-100 text-blue-700 border-blue-200"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
        >
          <Filter className="w-4 h-4" />
          Advanced
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300 text-sm font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          {/* Type Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "topic", label: "📋 Topics" },
                { value: "decision", label: "✅ Decisions" },
                { value: "action", label: "⚡ Actions" },
                { value: "insight", label: "💡 Insights" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleTypeChange(filters.type === value ? null : value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                    filters.type === value
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Priority
            </label>
            <div className="flex gap-2">
              {[
                { value: "high", label: "High", color: "red" },
                { value: "medium", label: "Medium", color: "yellow" },
                { value: "low", label: "Low", color: "green" },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() =>
                    handlePriorityChange(filters.priority === value ? null : (value as any))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                    filters.priority === value
                      ? `bg-${color}-100 text-${color}-700 border-${color}-200`
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
              Created Date Range
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value || null })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center text-gray-500">to</div>
              <div className="flex-1">
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || null })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                Tags ({selectedTags.size} selected)
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                      selectedTags.has(tag)
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {(filters.query ||
        filters.type ||
        filters.priority ||
        filters.dateFrom ||
        filters.dateTo ||
        selectedTags.size > 0) && (
        <div className="text-xs text-gray-600 px-2">
          Found {results.length} item{results.length !== 1 ? "s" : ""} matching your filters
        </div>
      )}
    </div>
  )
}
