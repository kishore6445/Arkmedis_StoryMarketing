'use client'

import { useState, useEffect } from 'react'
import { Plus, BookOpen, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KBTree, KBNode } from '@/components/kb-tree'
import { KBNodeEditor } from '@/components/kb-node-editor'
import { KBSearch } from '@/components/kb-search'
import { KBTimeline } from '@/components/kb-timeline'
import { useParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface DetailedKBNode extends KBNode {
  children?: DetailedKBNode[]
}

export default function ClientKnowledgeBasePage() {
  const params = useParams()
  const clientId = params?.clientId as string

  const [nodes, setNodes] = useState<DetailedKBNode[]>([])
  const [selectedNode, setSelectedNode] = useState<DetailedKBNode | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'tree' | 'timeline'>('tree')
  const [searchResults, setSearchResults] = useState<KBNode[]>([])

  // Simulated data - replace with API call
  useEffect(() => {
    const mockData: DetailedKBNode[] = [
      {
        id: 'kb-1',
        title: 'Q1 2024 Strategy',
        content: 'Overall strategy and goals for Q1',
        type: 'topic',
        clientId: clientId || 'client-1',
        parentId: null,
        createdAt: new Date().toISOString(),
        tags: ['strategy', 'q1'],
        priority: 'high',
        children: [
          {
            id: 'kb-1-1',
            title: 'Content Pillars',
            content: 'Main content themes to focus on',
            type: 'decision',
            clientId: clientId || 'client-1',
            parentId: 'kb-1',
            createdAt: new Date().toISOString(),
            tags: ['content', 'planning'],
            priority: 'high',
            children: [
              {
                id: 'kb-1-1-1',
                title: 'Create monthly theme guides',
                content: 'Develop comprehensive theme guidelines for each month',
                type: 'action',
                clientId: clientId || 'client-1',
                parentId: 'kb-1-1',
                createdAt: new Date().toISOString(),
                tags: ['action'],
                priority: 'medium',
              },
            ],
          },
          {
            id: 'kb-1-2',
            title: 'Budget Allocation',
            content: '50% organic, 40% paid, 10% partnerships',
            type: 'decision',
            clientId: clientId || 'client-1',
            parentId: 'kb-1',
            createdAt: new Date().toISOString(),
            tags: ['budget', 'allocation'],
            priority: 'high',
          },
        ],
      },
      {
        id: 'kb-2',
        title: 'Brand Voice Guidelines',
        content: 'Documentation on brand tone, messaging, and values',
        type: 'topic',
        clientId: clientId || 'client-1',
        parentId: null,
        createdAt: new Date().toISOString(),
        tags: ['brand', 'guidelines'],
        priority: 'medium',
        children: [
          {
            id: 'kb-2-1',
            title: 'Tone of Voice',
            content: 'Professional yet approachable, friendly and helpful',
            type: 'insight',
            clientId: clientId || 'client-1',
            parentId: 'kb-2',
            createdAt: new Date().toISOString(),
            tags: ['voice', 'branding'],
            priority: 'medium',
          },
        ],
      },
    ]

    setNodes(mockData)
    setLoading(false)
  }, [clientId])

  const handleAddNode = () => {
    setSelectedNode(null)
    setEditorOpen(true)
  }

  const handleEditNode = (node: DetailedKBNode) => {
    setSelectedNode(node)
    setEditorOpen(true)
  }

  const handleAddChild = (parentId: string) => {
    const newNode: DetailedKBNode = {
      id: `kb-${Date.now()}`,
      title: '',
      content: '',
      type: 'topic',
      clientId: clientId || '',
      parentId: parentId,
      createdAt: new Date().toISOString(),
      children: [],
    }
    setSelectedNode(newNode)
    setEditorOpen(true)
  }

  const handleSaveNode = (node: DetailedKBNode) => {
    if (node.parentId === null) {
      const existingIndex = nodes.findIndex((n) => n.id === node.id)
      if (existingIndex >= 0) {
        const updated = [...nodes]
        updated[existingIndex] = node
        setNodes(updated)
      } else {
        setNodes([...nodes, node])
      }
    } else {
      const updateNodeInTree = (nodeList: DetailedKBNode[]): DetailedKBNode[] => {
        return nodeList.map((n) => {
          if (n.id === node.parentId) {
            const children = n.children || []
            const existingIndex = children.findIndex((c) => c.id === node.id)
            if (existingIndex >= 0) {
              children[existingIndex] = node
            } else {
              children.push(node)
            }
            return { ...n, children }
          }
          return {
            ...n,
            children: n.children ? updateNodeInTree(n.children) : undefined,
          }
        })
      }
      setNodes(updateNodeInTree(nodes))
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    const deleteFromTree = (nodeList: DetailedKBNode[]): DetailedKBNode[] => {
      return nodeList
        .filter((n) => n.id !== nodeId)
        .map((n) => ({
          ...n,
          children: n.children ? deleteFromTree(n.children) : undefined,
        }))
    }
    setNodes(deleteFromTree(nodes))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('tree')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  viewMode === 'tree'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Tree View
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                Timeline View
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Organized repository of decisions, actions, and insights from all client meetings
          </p>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'tree' ? (
        <div className="grid grid-cols-4 gap-6 p-8 h-[calc(100vh-160px)]">
          {/* Left: Tree View */}
          <div className="col-span-2 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            {/* Controls */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <button
                onClick={handleAddNode}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Topic
              </button>
              <KBSearch clientId={clientId} onResultsUpdate={setSearchResults} />
            </div>

            {/* Tree */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading knowledge base...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => setSelectedNode(result as DetailedKBNode)}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-900">{result.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <KBTree
                  nodes={nodes}
                  onEdit={handleEditNode}
                  onDelete={handleDeleteNode}
                  onAddChild={handleAddChild}
                />
              )}
            </div>
          </div>

          {/* Right: Detail View + Stats */}
          <div className="col-span-2 space-y-6">
            {/* Detail Panel */}
            {selectedNode && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Title
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedNode.title}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Type
                    </h3>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedNode.type === 'topic'
                        ? 'Topic'
                        : selectedNode.type === 'decision'
                          ? 'Decision'
                          : selectedNode.type === 'action'
                            ? 'Action Item'
                            : 'Insight'}
                    </p>
                  </div>

                  {selectedNode.priority && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Priority
                      </h3>
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                          selectedNode.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : selectedNode.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        )}
                      >
                        {selectedNode.priority.charAt(0).toUpperCase() +
                          selectedNode.priority.slice(1)}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Content
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedNode.content}
                    </p>
                  </div>

                  {selectedNode.tags && selectedNode.tags.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleEditNode(selectedNode)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                  >
                    Edit Item
                  </button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Total Items
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {nodes.length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  High Priority
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {nodes.filter((n) => n.priority === 'high').length}
                </p>
              </div>
            </div>

            {/* Export Button */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
              <Download className="w-4 h-4" />
              Export Knowledge Base
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8 h-[calc(100vh-160px)]">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 h-full overflow-y-auto">
            <KBTimeline 
              nodes={nodes} 
              onSelectItem={(nodeId) => {
                const findNode = (nodeList: DetailedKBNode[]): DetailedKBNode | null => {
                  for (const node of nodeList) {
                    if (node.id === nodeId) return node
                    if (node.children) {
                      const found = findNode(node.children)
                      if (found) return found
                    }
                  }
                  return null
                }
                const node = findNode(nodes)
                if (node) setSelectedNode(node)
              }}
            />
          </div>
        </div>
      )}

      {/* Node Editor Modal */}
      <KBNodeEditor
        node={selectedNode || null}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setSelectedNode(null)
        }}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
        clientId={clientId || ''}
      />
    </div>
  )
}
