import { useRef, useCallback } from 'react'

interface UseCanvasPanningProps {
  stageOffset: { x: number; y: number }
  onOffsetChange: (offset: { x: number; y: number }) => void
}

export function useCanvasPanning({ stageOffset, onOffsetChange }: UseCanvasPanningProps) {
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0 })
  const panOriginOffset = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.ctrlKey && e.button === 0)) return
    e.preventDefault()
    isPanning.current = true
    panStart.current = { x: e.clientX, y: e.clientY }
    panOriginOffset.current = { ...stageOffset }
  }, [stageOffset])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    onOffsetChange({
      x: panOriginOffset.current.x + (e.clientX - panStart.current.x),
      y: panOriginOffset.current.y + (e.clientY - panStart.current.y),
    })
  }, [onOffsetChange])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) isPanning.current = false
  }, [])

  const onMouseLeave = useCallback(() => {
    isPanning.current = false
  }, [])

  return { isPanning, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }
}