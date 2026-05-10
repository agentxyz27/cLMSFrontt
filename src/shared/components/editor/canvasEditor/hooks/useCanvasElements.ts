import { useCallback } from 'react'
import type { CanvasData, CanvasElement, LessonGraph } from '@/shared/types'

interface UseCanvasElementsOptions {
  activeNodeId: string
  setLessonContent: React.Dispatch<React.SetStateAction<LessonGraph>>
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
}

export function useCanvasElements({
  activeNodeId,
  setLessonContent,
  setSelectedId
}: UseCanvasElementsOptions) {

  const updateActiveCanvas = useCallback(
    (updater: (prev: CanvasData) => CanvasData) => {
      setLessonContent(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === activeNodeId ? { ...n, contentJson: updater(n.contentJson) } : n
        )
      }))
    },
    [activeNodeId, setLessonContent]
  )

  const addElement = useCallback(
    (el: CanvasElement) => {
      updateActiveCanvas(prev => ({ ...prev, elements: [...prev.elements, el] }))
      setSelectedId(el.id)
    },
    [updateActiveCanvas, setSelectedId]
  )

  const updateElement = useCallback(
    (updated: CanvasElement) => {
      updateActiveCanvas(prev => ({
        ...prev,
        elements: prev.elements.map(el => el.id === updated.id ? updated : el)
      }))
    },
    [updateActiveCanvas]
  )

  const deleteElement = useCallback(
    (id: string) => {
      updateActiveCanvas(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== id)
      }))
      setSelectedId(null)
    },
    [updateActiveCanvas, setSelectedId]
  )

  const setBackgroundColor = useCallback(
    (color: string) => {
      updateActiveCanvas(prev => ({ ...prev, canvas: { ...prev.canvas, background: color } }))
    },
    [updateActiveCanvas]
  )

  const setBackgroundImage = useCallback(
    (url: string) => {
      updateActiveCanvas(prev => ({ ...prev, canvas: { ...prev.canvas, backgroundImage: url } }))
    },
    [updateActiveCanvas]
  )

  return { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage }
}