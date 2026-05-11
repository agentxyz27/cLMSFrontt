// useTimelineReorder.ts
import { useState, useRef } from 'react'
import type { LessonNode } from '@/shared/types'

interface UseTimelineReorderReturn {
  dragIndex: number | null
  dropIndex: number | null
  handleDragStart: (e: React.DragEvent, index: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDrop: (e: React.DragEvent, index: number) => void
  handleDragEnd: () => void
}

export function useTimelineReorder(
  nodes: LessonNode[],
  onReorderNodes: (newNodes: LessonNode[]) => void
): UseTimelineReorderReturn {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragNode = useRef<LessonNode | null>(null)
  const dragIndexRef = useRef<number | null>(null)

  const reset = () => {
    setDragIndex(null)
    setDropIndex(null)
    dragNode.current = null
    dragIndexRef.current = null
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragNode.current = nodes[index]
    dragIndexRef.current = index
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:fixed;top:-999px'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) { reset(); return }
    const reordered = [...nodes]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(index, 0, moved)
    onReorderNodes(reordered)
    reset()
  }

  const handleDragEnd = () => reset()

  return { dragIndex, dropIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd }
}