import { useState, useRef } from 'react'
import { KBNode, KBPage, SelectionState, UndoAction, ZoomPath } from '@/lib/kb-types'

export function useWorkflowyState(initialPage: KBPage) {
  const [currentPage, setCurrentPage] = useState<KBPage>(initialPage)
  const [selection, setSelection] = useState<SelectionState | null>(null)
  const [zoomPath, setZoomPath] = useState<ZoomPath>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Undo/redo stack
  const undoStackRef = useRef<UndoAction[]>([])
  const redoStackRef = useRef<UndoAction[]>([])

  // Find a node by ID in the tree
  const findNode = (nodes: KBNode[], id: string): KBNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // Get current root nodes (either all nodes or zoomed-in subtree)
  const getRootNodes = () => {
    if (zoomPath.length === 0) return currentPage.nodes
    
    let current = currentPage.nodes
    for (const { id } of zoomPath) {
      const node = findNode(current, id)
      if (node) current = node.children
      else return []
    }
    return current
  }

  // Add a new node
  const addNode = (parentId: string | null, text: string = '', index?: number, id?: string) => {
    const newNode: KBNode = {
      id: id ?? `node-${Date.now()}`,
      text,
      children: [],
      completed: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setCurrentPage((prev) => {
      const updateNodes = (nodes: KBNode[]): KBNode[] => {
        if (parentId === null) {
          const newNodes = [...nodes]
          if (index !== undefined) {
            newNodes.splice(index, 0, newNode)
          } else {
            newNodes.push(newNode)
          }
          return newNodes
        }

        return nodes.map((node) => {
          if (node.id === parentId) {
            const children = [...node.children]
            if (index !== undefined) {
              children.splice(index, 0, newNode)
            } else {
              children.push(newNode)
            }
            return { ...node, children, updatedAt: new Date() }
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) }
          }
          return node
        })
      }

      return {
        ...prev,
        nodes: updateNodes(prev.nodes),
      }
    })

    // Record undo action
    undoStackRef.current.push({
      type: 'add',
      nodeId: newNode.id,
      timestamp: Date.now(),
    })
    redoStackRef.current = []

    return newNode.id
  }

  // Edit node text
  const editNode = (nodeId: string, text: string) => {
    setCurrentPage((prev) => {
      const updateNodes = (nodes: KBNode[]): KBNode[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, text, updatedAt: new Date() }
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) }
          }
          return node
        })
      }

      return {
        ...prev,
        nodes: updateNodes(prev.nodes),
      }
    })

    undoStackRef.current.push({
      type: 'edit',
      nodeId,
      previousValue: text,
      timestamp: Date.now(),
    })
    redoStackRef.current = []
  }

  // Delete node
  const deleteNode = (nodeId: string) => {
    setCurrentPage((prev) => {
      const updateNodes = (nodes: KBNode[]): KBNode[] => {
        return nodes
          .filter((n) => n.id !== nodeId)
          .map((n) => ({
            ...n,
            children: n.children ? updateNodes(n.children) : [],
          }))
      }

      return {
        ...prev,
        nodes: updateNodes(prev.nodes),
      }
    })

    undoStackRef.current.push({
      type: 'delete',
      nodeId,
      timestamp: Date.now(),
    })
    redoStackRef.current = []
  }

  // Toggle completion
  const toggleComplete = (nodeId: string) => {
    setCurrentPage((prev) => {
      const updateNodes = (nodes: KBNode[]): KBNode[] => {
        return nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, completed: !node.completed, updatedAt: new Date() }
          }
          if (node.children) {
            return { ...node, children: updateNodes(node.children) }
          }
          return node
        })
      }

      return {
        ...prev,
        nodes: updateNodes(prev.nodes),
      }
    })

    undoStackRef.current.push({
      type: 'complete',
      nodeId,
      timestamp: Date.now(),
    })
    redoStackRef.current = []
  }

  // Indent node (make it a child of the previous sibling)
  const indentNode = (nodeId: string) => {
    setCurrentPage((prev) => {
      const updateNodes = (nodes: KBNode[]): KBNode[] => {
        const index = nodes.findIndex((n) => n.id === nodeId)
        if (index > 0) {
          const newNodes = [...nodes]
          const [node] = newNodes.splice(index, 1)
          const previousSibling = newNodes[index - 1]
          previousSibling.children.push(node)
          return newNodes
        }

        return nodes.map((n) => ({
          ...n,
          children: n.children ? updateNodes(n.children) : [],
        }))
      }

      return {
        ...prev,
        nodes: updateNodes(prev.nodes),
      }
    })

    undoStackRef.current.push({
      type: 'indent',
      nodeId,
      timestamp: Date.now(),
    })
    redoStackRef.current = []
  }

  // Outdent node (make it a sibling of its parent)
  const outdentNode = (nodeId: string) => {
    setCurrentPage((prev) => {
      const findAndOutdent = (nodes: KBNode[], parentId: string | null): KBNode[] => {
        const index = nodes.findIndex((n) => n.id === nodeId)
        if (index !== -1 && parentId !== null) {
          const newNodes = [...nodes]
          const [node] = newNodes.splice(index, 1)
          return newNodes
        }

        return nodes.map((n) => {
          if (n.children) {
            const updated = findAndOutdent(n.children, n.id)
            if (updated.length !== n.children.length) {
              const newNode = updated.find((c) => c.id === nodeId)
              if (newNode) {
                const parentIndex = currentPage.nodes.findIndex((r) => r.id === n.id)
                if (parentIndex !== -1) {
                  currentPage.nodes.splice(parentIndex + 1, 0, newNode)
                }
              }
              return { ...n, children: updated.filter((c) => c.id !== nodeId) }
            }
          }
          return n
        })
      }

      return {
        ...prev,
        nodes: findAndOutdent(prev.nodes, null),
      }
    })

    undoStackRef.current.push({
      type: 'outdent',
      nodeId,
      timestamp: Date.now(),
    })
    redoStackRef.current = []
  }

  // Zoom into a node
  const zoomIn = (nodeId: string) => {
    const node = findNode(currentPage.nodes, nodeId)
    if (node) {
      setZoomPath((prev) => [...prev, { id: nodeId, text: node.text }])
    }
  }

  // Zoom out
  const zoomOut = () => {
    setZoomPath((prev) => prev.slice(0, -1))
  }

  return {
    currentPage,
    setCurrentPage,
    selection,
    setSelection,
    zoomPath,
    zoomIn,
    zoomOut,
    getRootNodes,
    findNode,
    addNode,
    editNode,
    deleteNode,
    toggleComplete,
    indentNode,
    outdentNode,
    searchQuery,
    setSearchQuery,
    undoStack: undoStackRef.current,
    redoStack: redoStackRef.current,
  }
}
