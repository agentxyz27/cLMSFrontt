import { useState, useCallback, useEffect } from 'react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const ZOOM_SENSITIVITY = 0.001
const PAN_ARROW_NUDGE = 10
const PAN_ARROW_NUDGE_FAST = 40

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

    // Ctrl held → zoom (standard behavior)
    if (e.ctrlKey) {
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
      return
    }

    // No modifier → pan in all 4 directions (trackpad or scroll wheel)
    setStageOffset(prev => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }))
  }, [wrapperRef])

  // Arrow key fine panning — lives here since stageOffset is owned here
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (!arrowKeys.includes(e.key)) return

      e.preventDefault() // prevent page scroll

      const nudge = e.shiftKey ? PAN_ARROW_NUDGE_FAST : PAN_ARROW_NUDGE

      setStageOffset(prev => {
        switch (e.key) {
          case 'ArrowUp':    return { ...prev, y: prev.y + nudge }
          case 'ArrowDown':  return { ...prev, y: prev.y - nudge }
          case 'ArrowLeft':  return { ...prev, x: prev.x + nudge }
          case 'ArrowRight': return { ...prev, x: prev.x - nudge }
          default:           return prev
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel, wrapperRef])

  return { zoom, stageOffset, setStageOffset }
}