import { useEffect } from 'react'

interface UseKeyboardShortcutsOptions {
  selectedId: string | null
  onDeleteElement: (id: string) => void
  onEscape: () => void
}

export function useKeyboardShortcuts({
  selectedId,
  onDeleteElement,
  onEscape
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === 'Escape') {
        onEscape()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onDeleteElement(selectedId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, onDeleteElement, onEscape])
}