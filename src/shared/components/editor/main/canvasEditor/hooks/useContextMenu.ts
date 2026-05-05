import { useState, useEffect, useRef } from 'react'

export interface ContextMenuState {
  nodeId: string
  x: number
  y: number
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!contextMenu) return
    function handleMouseDown(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [contextMenu])

  function openAt(e: React.MouseEvent, nodeId: string) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY })
  }

  function close() {
    setContextMenu(null)
  }

  return { contextMenu, contextMenuRef, openAt, close }
}