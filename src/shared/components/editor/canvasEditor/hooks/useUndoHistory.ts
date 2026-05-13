import { useCallback, useRef } from 'react'
import type { LessonGraph } from '@/shared/types'

const MAX = 50

export function useUndoHistory(
  setLessonContent: React.Dispatch<React.SetStateAction<LessonGraph>>,
) {
  const undoStack = useRef<LessonGraph[]>([])
  const redoStack = useRef<LessonGraph[]>([])

  const push = useCallback((snapshot: LessonGraph) => {
    undoStack.current = [...undoStack.current.slice(-MAX + 1), snapshot]
    redoStack.current = []
  }, [])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    setLessonContent(current => {
      const prev = undoStack.current[undoStack.current.length - 1]
      if (!prev?.nodes) return current
      undoStack.current = undoStack.current.slice(0, -1)
      redoStack.current = [current, ...redoStack.current.slice(0, MAX - 1)]
      return prev
    })
  }, [setLessonContent])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    setLessonContent(current => {
      const next = redoStack.current[0]
      undoStack.current = [...undoStack.current.slice(-MAX + 1), current]
      redoStack.current = redoStack.current.slice(1)
      return next
    })
  }, [setLessonContent])

  return { push, undo, redo }
}