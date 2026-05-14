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
          n.id === activeNodeId ? { ...n, content: updater(n.content) } : n
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


  const bringForward = useCallback((id: string) => {
    updateActiveCanvas(prev => {
      const els = [...prev.elements]
      const i = els.findIndex(el => el.id === id)
      if (i === -1 || i === els.length - 1) return prev
      ;[els[i], els[i + 1]] = [els[i + 1], els[i]]
      return { ...prev, elements: els }
    })
  }, [updateActiveCanvas])

  const sendBackward = useCallback((id: string) => {
    updateActiveCanvas(prev => {
      const els = [...prev.elements]
      const i = els.findIndex(el => el.id === id)
      if (i <= 0) return prev
      ;[els[i], els[i - 1]] = [els[i - 1], els[i]]
      return { ...prev, elements: els }
    })
  }, [updateActiveCanvas])


  return { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage, bringForward, sendBackward }
}