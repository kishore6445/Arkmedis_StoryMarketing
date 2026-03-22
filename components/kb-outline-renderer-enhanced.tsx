'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, Trash2, Copy, Tag, Calendar, CheckCircle, Plus } from 'lucide-react'
import { KBNode } from '@/lib/kb-types'

interface OutlineRendererProps {
  nodes: KBNode[]
  selectedId: string | null
  autoEditNodeId?: string | null
  onAutoEditHandled?: () => void
  onSelectNode: (id: string) => void
  onEditNode: (id: string, text: string) => void
  onDeleteNode: (id: string) => void
  onToggleComplete: (id: string) => void
  onAddNode: (parentId: string | null, text?: string) => void
  onIndent: (id: string) => void
  onOutdent: (id: string) => void
  onZoom?: (id: string) => void
  onAddTag?: (id: string, tag: string) => void
  onRemoveTag?: (id: string, tag: string) => void
  onSetDueDate?: (id: string, date: Date | null) => void
  onSetStatus?: (id: string, status: string) => void
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  depth?: number
}

export function OutlineRendererEnhanced({
  nodes,
  selectedId,
  autoEditNodeId,
  onAutoEditHandled,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onToggleComplete,
  onAddNode,
  onIndent,
  onOutdent,
  onZoom,
  onAddTag,
  onRemoveTag,
  onSetDueDate,
  onSetStatus,
  expandedIds,
  onToggleExpand,
  depth = 0,
}: OutlineRendererProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [addingTagId, setAddingTagId] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  useEffect(() => {
    if (addingTagId && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [addingTagId])

  useEffect(() => {
    if (!autoEditNodeId) return

    const findNodeById = (nodeList: KBNode[]): KBNode | null => {
      for (const node of nodeList) {
        if (node.id === autoEditNodeId) return node
        const childMatch = findNodeById(node.children)
        if (childMatch) return childMatch
      }

      return null
    }

    const nodeToEdit = findNodeById(nodes)
    if (!nodeToEdit) return

    setEditingId(nodeToEdit.id)
    setEditText(nodeToEdit.text)
    onAutoEditHandled?.()
  }, [autoEditNodeId, nodes, onAutoEditHandled])

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

  const handleAddTag = (nodeId: string) => {
    if (newTag.trim() && onAddTag) {
      onAddTag(nodeId, newTag)
      setNewTag('')
      setAddingTagId(null)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700'
      case 'todo':
        return 'bg-gray-100 text-gray-700'
      default:
        return ''
    }
  }

  const getDueDateDisplay = (date?: Date) => {
    if (!date) return null
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleAddNodeWithPrompt = (parentId: string | null) => {
    const enteredTitle = window.prompt('Enter item title', '')
    if (enteredTitle === null) return
    onAddNode(parentId, enteredTitle.trim())
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
          className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors ${
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

          {/* Status Badge */}
          {node.status && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(node.status)}`}>
              {node.status}
            </span>
          )}

          {/* Due Date */}
          {node.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
              <Calendar className="w-3 h-3" />
              {getDueDateDisplay(node.dueDate)}
            </div>
          )}

          {/* Tags */}
          {node.tags.length > 0 && (
            <div className="flex gap-1">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1 group/tag"
                >
                  #{tag}
                  {onRemoveTag && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveTag(node.id, tag)
                      }}
                      className="opacity-0 group-hover/tag:opacity-100 hover:text-blue-900"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-auto flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddNodeWithPrompt(node.id)
                if (!expandedIds.has(node.id)) onToggleExpand(node.id)
              }}
              className="p-1 hover:bg-green-100 rounded text-gray-400 hover:text-green-600"
              title="Add child item"
            >
              <Plus className="w-4 h-4" />
            </button>
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
            {onAddTag && addingTagId !== node.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setAddingTagId(node.id)
                }}
                className="p-1 hover:bg-blue-100 rounded text-gray-600"
                title="Add tag"
              >
                <Tag className="w-4 h-4" />
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

        {/* Add Tag Input */}
        {addingTagId === node.id && (
          <div className="flex items-center gap-2 px-8 py-2">
            <input
              ref={tagInputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={() => setAddingTagId(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag(node.id)
                if (e.key === 'Escape') setAddingTagId(null)
              }}
              placeholder="Add tag..."
              className="text-xs px-2 py-1 border border-gray-300 rounded outline-none flex-1"
            />
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="pl-6 border-l border-gray-200 ml-2">
            <OutlineRendererEnhanced
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
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onSetDueDate={onSetDueDate}
              onSetStatus={onSetStatus}
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
          onClick={() => handleAddNodeWithPrompt(null)}
          className="text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
        >
          <Copy className="w-4 h-4" />
          Add item
        </button>
      </div>
    </div>
  )
}
