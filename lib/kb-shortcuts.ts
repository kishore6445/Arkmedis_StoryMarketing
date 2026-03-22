'use client'

import { useEffect } from 'react'

export type KeyboardShortcut = {
  keys: string[]
  description: string
  action: () => void
  category: 'navigation' | 'editing' | 'actions'
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Cmd/Ctrl key for macOS and Windows
      const isMeta = e.metaKey || e.ctrlKey

      shortcuts.forEach(({ keys, action }) => {
        // Handle different key combinations
        let matches = false

        if (keys.length === 1) {
          // Single key (like 'n' for new)
          if ((isMeta && e.key.toLowerCase() === keys[0].toLowerCase())) {
            matches = true
          }
        } else if (keys.length === 2) {
          // Two keys (like Shift+Cmd+K)
          const hasShift = keys.includes('shift') ? e.shiftKey : !e.shiftKey
          const hasCtrlOrCmd = keys.includes('ctrl') || keys.includes('cmd') ? isMeta : !isMeta
          const hasKey = keys.some(k => 
            !['shift', 'ctrl', 'cmd'].includes(k) && 
            e.key.toLowerCase() === k.toLowerCase()
          )

          if (hasCtrlOrCmd && hasKey && hasShift) {
            matches = true
          }
        }

        if (matches) {
          e.preventDefault()
          action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const KB_SHORTCUTS = {
  newItem: { keys: ['cmd', 'n'], description: 'Create new item' },
  search: { keys: ['cmd', 'k'], description: 'Open search' },
  delete: { keys: ['cmd', 'd'], description: 'Delete item' },
  edit: { keys: ['cmd', 'e'], description: 'Edit item' },
  undo: { keys: ['cmd', 'z'], description: 'Undo' },
  redo: { keys: ['cmd', 'shift', 'z'], description: 'Redo' },
  expandAll: { keys: ['cmd', '.'], description: 'Expand all' },
  collapseAll: { keys: ['cmd', ','], description: 'Collapse all' },
}
