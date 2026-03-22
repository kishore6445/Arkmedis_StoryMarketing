"use client"

import { useMemo } from "react"
import { Calendar, Trash2 } from "lucide-react"
import type { KBNode } from "./kb-outline-tree"

interface KBTimelineViewProps {
  nodes: KBNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  searchQuery: string
}

export function KBTimelineView({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDelete,
  searchQuery,
}: KBTimelineViewProps) {
  const flattenNodes = (nodeList: KBNode[]): KBNode[] => {
    return nodeList.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])])
  }

  const allNodes = flattenNodes(nodes)

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return allNodes
    return allNodes.filter(
      (node) =>
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allNodes, searchQuery])

  const timelineItems = useMemo(() => {
    const withDates = filteredNodes.filter((n) => n.dueDate)
    return withDates.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [filteredNodes])

  const groupedByDate = useMemo(() => {
    const groups: Record<string, KBNode[]> = {}
    timelineItems.forEach((node) => {
      if (node.dueDate) {
        if (!groups[node.dueDate]) groups[node.dueDate] = []
        groups[node.dueDate].push(node)
      }
    })
    return groups
  }, [timelineItems])

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "low":
        return "bg-green-100 text-green-700 border-green-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {Object.entries(groupedByDate).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No items with due dates</p>
        </div>
      ) : (
        Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="flex gap-4">
            <div className="w-32 flex-shrink-0">
              <div className="text-sm font-semibold text-gray-900">
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {items.map((node) => (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md group ${
                    selectedNodeId === node.id
                      ? "bg-blue-50 border-l-blue-500 ring-1 ring-blue-200"
                      : "bg-white border-l-gray-300 hover:border-l-blue-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{node.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{node.content}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {node.priority && (
                          <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(node.priority)}`}>
                            {node.priority.charAt(0).toUpperCase() + node.priority.slice(1)}
                          </span>
                        )}
                        {node.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(node.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
