"use client"

import { useState } from "react"
import { Calendar, Clock, User, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { KBNode } from "./kb-tree"

interface TimelineItem {
  id: string
  date: Date
  title: string
  content: string
  type: string
  priority?: string
  createdBy?: string
  tags?: string[]
}

interface KBTimelineProps {
  nodes: KBNode[]
  onSelectItem?: (nodeId: string) => void
}

export function KBTimeline({ nodes, onSelectItem }: KBTimelineProps) {
  const [groupBy, setGroupBy] = useState<"date" | "type">("date")

  // Flatten and convert nodes to timeline items
  const flattenNodes = (nodeList: KBNode[]): TimelineItem[] => {
    const result: TimelineItem[] = []
    const traverse = (node: KBNode) => {
      result.push({
        id: node.id,
        date: new Date(node.createdAt),
        title: node.title,
        content: node.content,
        type: node.type,
        priority: node.priority,
        tags: node.tags,
      })
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    nodeList.forEach(traverse)
    return result
  }

  const timelineItems = flattenNodes(nodes).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )

  const typeColors = {
    topic: "bg-blue-100 text-blue-700 border-blue-200",
    decision: "bg-purple-100 text-purple-700 border-purple-200",
    action: "bg-green-100 text-green-700 border-green-200",
    insight: "bg-amber-100 text-amber-700 border-amber-200",
  }

  const typeIcons = {
    topic: "📋",
    decision: "✅",
    action: "⚡",
    insight: "💡",
  }

  // Group by date
  const groupByDate = (): Record<string, TimelineItem[]> => {
    const groups: Record<string, TimelineItem[]> = {}
    timelineItems.forEach((item) => {
      const dateKey = item.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })
    return groups
  }

  // Group by type
  const groupByType = (): Record<string, TimelineItem[]> => {
    const groups: Record<string, TimelineItem[]> = {}
    timelineItems.forEach((item) => {
      if (!groups[item.type]) {
        groups[item.type] = []
      }
      groups[item.type].push(item)
    })
    return groups
  }

  const groupedItems = groupBy === "date" ? groupByDate() : groupByType()

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setGroupBy("date")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
              groupBy === "date"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Calendar className="w-4 h-4" />
            By Date
          </button>
          <button
            onClick={() => setGroupBy("type")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors",
              groupBy === "type"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Tag className="w-4 h-4" />
            By Type
          </button>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {timelineItems.length} items
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedItems).map(([groupKey, items]) => (
          <div key={groupKey}>
            {/* Group Header */}
            <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900">{groupKey}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Timeline Items */}
            <div className="relative ml-4 space-y-6">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-200 to-gray-200" />

              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => onSelectItem?.(item.id)}
                  className="group relative flex gap-4 text-left transition-all hover:translate-x-1 pl-6"
                >
                  {/* Dot on timeline */}
                  <div className="absolute -left-2.5 top-2 w-5 h-5 rounded-full border-2 border-white bg-blue-500 shadow-md group-hover:scale-110 transition-transform" />

                  {/* Content */}
                  <div className="flex-1 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      {/* Type Icon */}
                      <span className="text-lg flex-shrink-0">
                        {typeIcons[item.type as keyof typeof typeIcons]}
                      </span>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.title}
                        </h4>
                      </div>

                      {/* Type Badge */}
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded border flex-shrink-0",
                          typeColors[item.type as keyof typeof typeColors]
                        )}
                      >
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>

                    {/* Content Preview */}
                    {item.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.content}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>

                      {item.priority && (
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            item.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : item.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          )}
                        >
                          {item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1)}{" "}
                          Priority
                        </div>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1">
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-gray-500">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {timelineItems.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No items to display</p>
        </div>
      )}
    </div>
  )
}
