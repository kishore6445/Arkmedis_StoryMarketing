"use client"

import { useState, useCallback } from "react"
import { ChevronRight, ChevronDown, Plus, X, Edit2, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KBNode {
  id: string
  title: string
  content: string
  type: "topic" | "decision" | "action" | "insight"
  clientId: string
  parentId: string | null
  children?: KBNode[]
  createdAt: string
  createdFromMeetingId?: string
  tags?: string[]
  priority?: "high" | "medium" | "low"
}

interface KBTreeNodeProps {
  node: KBNode
  level: number
  expanded: string[]
  onToggle: (nodeId: string) => void
  onEdit: (node: KBNode) => void
  onDelete: (nodeId: string) => void
  onAddChild: (parentId: string) => void
}

function KBTreeNode({
  node,
  level,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: KBTreeNodeProps) {
  const isExpanded = expanded.includes(node.id)
  const hasChildren = (node.children || []).length > 0

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

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors",
          `ml-${level * 4}`
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Drag Handle */}
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Type Icon + Badge */}
        <span className="text-lg flex-shrink-0">{typeIcons[node.type]}</span>

        {/* Title */}
        <span className={cn("flex-1 text-sm font-medium text-gray-900", "truncate")}>
          {node.title}
        </span>

        {/* Priority Badge */}
        {node.priority && (
          <div
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded flex-shrink-0",
              node.priority === "high"
                ? "bg-red-100 text-red-700"
                : node.priority === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            )}
          >
            {node.priority.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(node)}
            className="p-1 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAddChild(node.id)}
            className="p-1 text-gray-600 hover:bg-green-100 hover:text-green-600 rounded transition-colors"
            title="Add child item"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {(node.children || []).map((child) => (
            <KBTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface KBTreeProps {
  nodes: KBNode[]
  onEdit: (node: KBNode) => void
  onDelete: (nodeId: string) => void
  onAddChild: (parentId: string) => void
}

export function KBTree({ nodes, onEdit, onDelete, onAddChild }: KBTreeProps) {
  const [expanded, setExpanded] = useState<string[]>([])

  const toggleNode = useCallback(
    (nodeId: string) => {
      setExpanded((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId]
      )
    },
    []
  )

  if (nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No knowledge base items yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <KBTreeNode
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          onToggle={toggleNode}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  )
}
