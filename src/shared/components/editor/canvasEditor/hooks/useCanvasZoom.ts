import { useState, useCallback, useEffect } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const ZOOM_SENSITIVITY = 0.001

interface UseCanvasZoomProps {
  wrapperRef: React.RefObject<HTMLDivElement | null>
}

export function useCanvasZoom({ wrapperRef }: UseCanvasZoomProps) {
  const [zoom, setZoom] = useState(1)
  const [stageOffset, setStageOffset] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()

    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const pointerX = e.clientX - rect.left
    const pointerY = e.clientY - rect.top

    setZoom(prevZoom => {
      const delta = -e.deltaY * ZOOM_SENSITIVITY
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom + delta * prevZoom))

      const scaleChange = newZoom / prevZoom
      setStageOffset(prevOffset => ({
        x: pointerX - scaleChange * (pointerX - prevOffset.x),
        y: pointerY - scaleChange * (pointerY - prevOffset.y),
      }))

      return newZoom
    })
  }, [wrapperRef])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel, wrapperRef])

  return { zoom, stageOffset, setStageOffset }
}