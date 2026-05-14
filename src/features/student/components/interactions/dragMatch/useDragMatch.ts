import { useState } from 'react'
import type { CanvasElement } from '@/shared/types'

type MatchState = Record<string, string | null>

interface UseDragMatchProps {
  targets: CanvasElement[]
  hints: string[]
  disabled: boolean
  onSubmit: (answer: unknown) => void
  onHint: (hintIndex: number) => void
}

export function useDragMatch({ targets, hints, disabled, onSubmit, onHint }: UseDragMatchProps) {
  const [matches, setMatches] = useState<MatchState>(() =>
    Object.fromEntries(targets.map(t => [t.id, null]))
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hintIndex, setHintIndex] = useState<number | null>(null)

  const placedItemIds = new Set(Object.values(matches).filter(Boolean) as string[])
  const allFilled = targets.every(t => matches[t.id] !== null)

  function handleDragStart(itemId: string) {
    if (disabled) return
    setDraggingId(itemId)
  }

  function handleDrop(targetId: string) {
    if (disabled || !draggingId) return
    setMatches(prev => {
      const next = { ...prev }
      for (const tid of Object.keys(next)) {
        if (next[tid] === draggingId) next[tid] = null
      }
      next[targetId] = draggingId
      return next
    })
    setDraggingId(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleUnplace(targetId: string) {
    if (disabled) return
    setMatches(prev => ({ ...prev, [targetId]: null }))
  }

  function handleSubmit() {
    if (disabled) return
    const answer = Object.fromEntries(targets.map(t => [t.id, matches[t.id]]))
    onSubmit(answer)
  }

  function handleShowHint() {
    const next = hintIndex === null ? 0 : hintIndex + 1
    if (next >= hints.length) return
    setHintIndex(next)
    onHint(next)
  }

  return {
    matches, draggingId, hintIndex,
    placedItemIds, allFilled,
    handleDragStart, handleDrop, handleDragOver, handleUnplace, handleSubmit, handleShowHint,
  }
}