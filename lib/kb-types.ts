// Core Workflowy node data model
export interface KBNode {
  id: string
  text: string
  children: KBNode[]
  completed: boolean
  tags: string[]
  dueDate?: Date
  assignee?: string
  status?: 'todo' | 'in-progress' | 'done'
  color?: string
  createdAt: Date
  updatedAt: Date
}

// Root page structure
export interface KBPage {
  id: string
  title: string
  icon?: string
  nodes: KBNode[]
  createdAt: Date
  updatedAt: Date
}

// Selection state for keyboard navigation
export interface SelectionState {
  nodeId: string
  cursorPosition: number
}

// Undo/redo action
export interface UndoAction {
  type: 'add' | 'delete' | 'edit' | 'complete' | 'indent' | 'outdent'
  nodeId: string
  previousValue?: KBNode | string | boolean
  timestamp: number
}

export type ZoomPath = Array<{ id: string; text: string }>
