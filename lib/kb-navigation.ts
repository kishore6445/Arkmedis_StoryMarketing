import { KBNode } from '@/lib/kb-types'

export function flattenNodes(nodes: KBNode[], includeCollapsed = false): KBNode[] {
  const flattened: KBNode[] = []
  
  const traverse = (nodeList: KBNode[]) => {
    for (const node of nodeList) {
      flattened.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    }
  }
  
  traverse(nodes)
  return flattened
}

export function findNodeIndex(nodes: KBNode[], nodeId: string): number {
  const flattened = flattenNodes(nodes)
  return flattened.findIndex(n => n.id === nodeId)
}

export function getNextNode(nodes: KBNode[], currentNodeId: string): KBNode | null {
  const flattened = flattenNodes(nodes)
  const currentIndex = flattened.findIndex(n => n.id === currentNodeId)
  if (currentIndex < flattened.length - 1) {
    return flattened[currentIndex + 1]
  }
  return null
}

export function getPreviousNode(nodes: KBNode[], currentNodeId: string): KBNode | null {
  const flattened = flattenNodes(nodes)
  const currentIndex = flattened.findIndex(n => n.id === currentNodeId)
  if (currentIndex > 0) {
    return flattened[currentIndex - 1]
  }
  return null
}

export function getFirstChild(node: KBNode): KBNode | null {
  return node.children.length > 0 ? node.children[0] : null
}

export function getParentNode(nodes: KBNode[], nodeId: string, parentId: string | null = null): KBNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return parentId !== null ? { id: parentId, text: '', children: [], completed: false, tags: [], createdAt: new Date(), updatedAt: new Date() } : null
    if (node.children) {
      const result = getParentNode(node.children, nodeId, node.id)
      if (result) return result
    }
  }
  return null
}
