import { useState, useCallback, useEffect } from 'react'
import type Konva from 'konva'
import type { CanvasElement, DragTargetProps } from '@/shared/types'

export interface ContextPopover {
  targetId: string
  targetLabel: string
  currentAccepts: string
  x: number
  y: number
}

export interface LinkModeState {
  targetId: string
}

interface UseLinkModeParams {
  elements: CanvasElement[]
  selectedId: string | null
  zoom: number
  stageOffset: { x: number; y: number }
  onLinkTarget: (targetId: string, itemId: string) => void
}

interface UseLinkModeReturn {
  linkMode: LinkModeState | null
  popover: ContextPopover | null
  setPopover: (p: ContextPopover | null) => void
  enterLinkMode: (targetId: string) => void
  cancelLinkMode: () => void
  handleLinkPick: (itemId: string) => void
  handleTargetContextMenu: (e: Konva.KonvaEventObject<PointerEvent>, target: CanvasElement) => void
}

export function useLinkMode({
  elements,
  selectedId,
  zoom,
  stageOffset,
  onLinkTarget,
}: UseLinkModeParams): UseLinkModeReturn {
  const [linkMode, setLinkMode] = useState<LinkModeState | null>(null)
  const [popover, setPopoverRaw] = useState<ContextPopover | null>(null)
const setPopover = (p: ContextPopover | null) => {
  if (p === null) console.trace('CLOSING POPOVER')
  setPopoverRaw(p)
}
  const canvasToDOMPos = useCallback(
    (cx: number, cy: number) => ({
      x: cx * zoom + stageOffset.x,
      y: cy * zoom + stageOffset.y,
    }),
    [zoom, stageOffset]
  )

  // Escape cancels link mode
  useEffect(() => {
    if (!linkMode) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLinkMode(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [linkMode])

  // L key — enter link mode from selected drag-target
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'l' && e.key !== 'L') return
      if (!selectedId) return
      const el = elements.find(el => el.id === selectedId)
      if (el?.type === 'drag-target') {
        setPopover(null)
        setLinkMode({ targetId: selectedId })
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedId, elements])

  const enterLinkMode = useCallback((targetId: string) => {
    setPopover(null)
    setLinkMode({ targetId })
  }, [])

  const cancelLinkMode = useCallback(() => {
    setLinkMode(null)
  }, [])

  const handleLinkPick = useCallback(
    (itemId: string) => {
      if (!linkMode) return
      onLinkTarget(linkMode.targetId, itemId)
      setLinkMode(null)
    },
    [linkMode, onLinkTarget]
  )

const handleTargetContextMenu = useCallback(
  (e: Konva.KonvaEventObject<PointerEvent>, target: CanvasElement) => {
    e.evt.preventDefault()
    e.cancelBubble = true
    setLinkMode(null)

    const p = target.props as DragTargetProps
    const pos = canvasToDOMPos(target.x, target.y + target.height + 6)

    // Defer so the mousedown that triggered this doesn't immediately
    // fire the outside-click listener in DragLinkPopover
    setTimeout(() => {
      setPopover({
        targetId: target.id,
        targetLabel: p.label,
        currentAccepts: p.accepts,
        x: pos.x,
        y: pos.y,
      })
    }, 0)
  },
  [canvasToDOMPos]
  )

  return {
    linkMode,
    popover,
    setPopover,
    enterLinkMode,
    cancelLinkMode,
    handleLinkPick,
    handleTargetContextMenu,
  }
}