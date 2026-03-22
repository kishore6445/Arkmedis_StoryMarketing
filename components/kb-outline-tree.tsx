"use client"

import { useState } from "react"
import { ChevronDown, Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface KBNode {
  id: string
  title: string
  content: string
  type: "task" | "note" | "project"
  priority?: "high" | "medium" | "low"
  tags: string[]
  dueDate?: string
  assignee?: string
  children?: KBNode[]
  createdAt: string
  updatedAt: string
}

interface OutlineTreeProps {
  nodes: KBNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onAddChild: (parentId: string) => void
  onEdit: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  expandedNodes: Set<string>
  onToggleExpand: (nodeId: string) => void
}

export function KBOutlineTree({
  nodes,
  selectedNodeId,
  onSelectNode,
  onAddChild,
  onEdit,
  onDelete,
  expandedNodes,
  onToggleExpand,
}: OutlineTreeProps) {
  const renderNode = (node: KBNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer group transition-colors ${
            selectedNodeId === node.id
              ? "bg-blue-50 border border-blue-200"
              : "hover:bg-gray-100"
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => onSelectNode(node.id)}
        >
          {hasChildren && (
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand(node.id)
              }}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{node.title}</p>
          </div>

          {/* Action buttons - show on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(node.id)
              }}
              className="p-1 hover:bg-blue-100 rounded text-blue-600"
              title="Edit"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddChild(node.id)
              }}
              className="p-1 hover:bg-green-100 rounded text-green-600"
              title="Add child"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(node.id)
              }}
              className="p-1 hover:bg-red-100 rounded text-red-600"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return <div className="space-y-1">{nodes.map((node) => renderNode(node))}</div>
}
