'use client'

import { useState } from 'react'
import { ChevronRight, Plus, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KBNode {
  id: string
  title: string
  content: string
  type: 'decision' | 'action-item' | 'insight' | 'topic'
  parentId: string | null
  children: KBNode[]
  createdAt: string
  updatedAt: string
  sourceMeeting?: string
  createdBy: string
  tags: string[]
}

interface KnowledgeBaseTreeProps {
  node: KBNode
  selectedNode: KBNode | null
  expandedNodes: Set<string>
  onSelectNode: (node: KBNode) => void
  onToggleExpanded: (nodeId: string) => void
  onCreateChild?: (parentId: string) => void
  getTypeColor: (type: string) => string
  level?: number
}

export default function KnowledgeBaseTree({
  node,
  selectedNode,
  expandedNodes,
  onSelectNode,
  onToggleExpanded,
  onCreateChild,
  getTypeColor,
  level = 0,
}: KnowledgeBaseTreeProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const isExpanded = expandedNodes.has(node.id)
  const hasChildren = node.children && node.children.length > 0
  const isRoot = node.id === 'root'

  if (isRoot) {
    return (
      <div className="space-y-1">
        {node.children.map((child) => (
          <KnowledgeBaseTree
            key={child.id}
            node={child}
            selectedNode={selectedNode}
            expandedNodes={expandedNodes}
            onSelectNode={onSelectNode}
            onToggleExpanded={onToggleExpanded}
            onCreateChild={onCreateChild}
            getTypeColor={getTypeColor}
            level={level}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="select-none">
      {/* Node Item */}
      <div
        onMouseEnter={() => setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
        className={cn(
          'flex items-start gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-colors cursor-pointer group',
          selectedNode?.id === node.id
            ? 'bg-blue-100 border border-blue-300'
            : 'hover:bg-gray-100 border border-transparent'
        )}
      >
        {/* Expand/Collapse Toggle */}
        {hasChildren && (
          <button
            onClick={() => onToggleExpanded(node.id)}
            className="flex-shrink-0 mt-0.5 p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronRight
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}
        {!hasChildren && <div className="w-5" />}

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => onSelectNode(node)}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap',
                getTypeColor(node.type)
              )}
            >
              {node.type === 'action-item' ? 'Action' : node.type}
            </span>
            <p className="text-gray-900 font-medium truncate">{node.title}</p>
          </div>
          {node.content && (
            <p className="text-xs text-gray-600 truncate mt-0.5 ml-0">{node.content}</p>
          )}
        </div>

        {/* Action Buttons */}
        {hoveredId === node.id && (
          <div className="flex-shrink-0 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateChild?.(node.id)
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Add sub-topic"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigator.clipboard.writeText(node.title)
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-6 border-l border-gray-200 pl-0">
          {node.children.map((child) => (
            <KnowledgeBaseTree
              key={child.id}
              node={child}
              selectedNode={selectedNode}
              expandedNodes={expandedNodes}
              onSelectNode={onSelectNode}
              onToggleExpanded={onToggleExpanded}
              onCreateChild={onCreateChild}
              getTypeColor={getTypeColor}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
