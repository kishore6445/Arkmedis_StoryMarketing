import { useEffect } from 'react'

interface ShortcutBinding {
  keys: string[]
  description: string
  action: (e: KeyboardEvent) => void
}

export function useKeyboardShortcuts(bindings: ShortcutBinding[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const binding of bindings) {
        const isMeta = e.metaKey || e.ctrlKey
        const isShift = e.shiftKey
        const isAlt = e.altKey

        const matchesKeys = binding.keys.every((key) => {
          if (key === 'cmd' || key === 'ctrl') return isMeta
          if (key === 'shift') return isShift
          if (key === 'alt') return isAlt
          if (key === 'enter') return e.key === 'Enter'
          if (key === 'tab') return e.key === 'Tab'
          if (key === 'escape') return e.key === 'Escape'
          if (key === 'arrowup') return e.key === 'ArrowUp'
          if (key === 'arrowdown') return e.key === 'ArrowDown'
          if (key === 'arrowleft') return e.key === 'ArrowLeft'
          if (key === 'arrowright') return e.key === 'ArrowRight'
          return e.key.toLowerCase() === key.toLowerCase()
        })

        if (matchesKeys) {
          e.preventDefault()
          binding.action(e)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [bindings])
}
