"use client"

import { useMemo } from "react"
import { GripVertical, Trash2 } from "lucide-react"
import type { KBNode } from "./kb-outline-tree"

interface KBBoardViewProps {
  nodes: KBNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
  onDelete: (nodeId: string) => void
  searchQuery: string
}

const statusMap: Record<string, string[]> = {
  todo: ["task"],
  inProgress: ["task"],
  done: ["task"],
  notes: ["note"],
  projects: ["project"],
}

export function KBBoardView({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDelete,
  searchQuery,
}: KBBoardViewProps) {
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

  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "bg-gray-50",
      nodes: filteredNodes.filter((n) => n.priority !== "high" && !n.dueDate),
    },
    {
      id: "inProgress",
      title: "In Progress",
      color: "bg-blue-50",
      nodes: filteredNodes.filter((n) => n.priority === "medium"),
    },
    {
      id: "done",
      title: "Done",
      color: "bg-green-50",
      nodes: filteredNodes.filter((n) => n.priority === "low"),
    },
  ]

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`flex-shrink-0 w-80 rounded-lg p-4 border border-gray-200 ${column.color}`}
        >
          <h3 className="font-semibold text-gray-900 mb-4">{column.title}</h3>
          <div className="space-y-2">
            {column.nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`p-3 bg-white rounded border cursor-pointer transition-all hover:shadow-md group ${
                  selectedNodeId === node.id ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{node.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{node.content}</p>
                    {node.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">Due: {node.dueDate}</p>
                    )}
                    {node.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {node.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(node.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
