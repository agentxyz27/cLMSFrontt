import { useEffect, useRef } from 'react'

interface UseKeyboardShortcutsOptions {
  selectedId: string | null
  onDeleteElement: (id: string) => void
  onEscape: () => void
  onUndo: () => void
  onRedo: () => void
}

export function useKeyboardShortcuts({
  selectedId,
  onDeleteElement,
  onEscape,
  onUndo,
  onRedo
}: UseKeyboardShortcutsOptions) {
  const refs = useRef({ selectedId, onDeleteElement, onEscape, onUndo, onRedo })
  useEffect(() => { refs.current = { selectedId, onDeleteElement, onEscape, onUndo, onRedo } })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const { selectedId, onDeleteElement, onEscape, onUndo, onRedo } = refs.current

      if (e.key === 'Escape') { onEscape(); return }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onDeleteElement(selectedId)
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        onUndo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault()
        onRedo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // runs once, always reads latest via refs
}