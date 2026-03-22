import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, Trash2, Copy } from 'lucide-react'
import { KBNode } from '@/lib/kb-types'

interface OutlineRendererProps {
  nodes: KBNode[]
  selectedId: string | null
  onSelectNode: (id: string) => void
  onEditNode: (id: string, text: string) => void
  onDeleteNode: (id: string) => void
  onToggleComplete: (id: string) => void
  onAddNode: (parentId: string | null) => void
  onIndent: (id: string) => void
  onOutdent: (id: string) => void
  onZoom?: (id: string) => void
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  depth?: number
}

export function OutlineRenderer({
  nodes,
  selectedId,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onToggleComplete,
  onAddNode,
  onIndent,
  onOutdent,
  onZoom,
  expandedIds,
  onToggleExpand,
  depth = 0,
}: OutlineRendererProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const finishEditing = () => {
    if (editingId && editText !== '') {
      onEditNode(editingId, editText)
    }
    setEditingId(null)
  }

  const renderNode = (node: KBNode) => {
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.children.length > 0
    const isSelected = selectedId === node.id
    const isEditing = editingId === node.id

    return (
      <div key={node.id} className="group">
        {/* Node Item */}
        <div
          onClick={() => onSelectNode(node.id)}
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-blue-50 border border-blue-200'
              : 'hover:bg-gray-50 border border-transparent'
          }`}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.id)
            }}
            className={`w-5 flex items-center justify-center flex-shrink-0 ${
              !hasChildren ? 'invisible' : ''
            }`}
          >
            {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />)}
          </button>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={node.completed}
            onChange={(e) => {
              e.stopPropagation()
              onToggleComplete(node.id)
            }}
            className="w-4 h-4 cursor-pointer flex-shrink-0"
          />

          {/* Text Content */}
          {isEditing ? (
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={finishEditing}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter') finishEditing()
                if (e.key === 'Escape') setEditingId(null)
                if (e.key === 'Tab') {
                  e.preventDefault()
                  finishEditing()
                  if (e.shiftKey) onOutdent(node.id)
                  else onIndent(node.id)
                }
              }}
              className="flex-1 px-2 py-0.5 border border-blue-500 rounded outline-none text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onDoubleClick={() => startEditing(node.id, node.text)}
              className={`flex-1 px-2 py-0.5 text-sm cursor-text rounded ${
                node.completed ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
            >
              {node.text || <span className="text-gray-300">Untitled</span>}
            </div>
          )}

          {/* Tags */}
          {node.tags.length > 0 && (
            <div className="flex gap-1">
              {node.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto flex-shrink-0">
            {hasChildren && onZoom && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onZoom(node.id)
                }}
                className="p-1 hover:bg-blue-100 rounded text-gray-600"
                title="Zoom in"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteNode(node.id)
              }}
              className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="pl-6 border-l border-gray-200 ml-2">
            <OutlineRenderer
              nodes={node.children}
              selectedId={selectedId}
              onSelectNode={onSelectNode}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onToggleComplete={onToggleComplete}
              onAddNode={onAddNode}
              onIndent={onIndent}
              onOutdent={onOutdent}
              onZoom={onZoom}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              depth={depth + 1}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {nodes.map(renderNode)}
      <div className="py-1 px-2">
        <button
          onClick={() => onAddNode(null)}
          className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
        >
          <Copy className="w-4 h-4" />
          Add item
        </button>
      </div>
    </div>
  )
}
