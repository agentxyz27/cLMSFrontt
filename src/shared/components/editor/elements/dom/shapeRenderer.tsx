// shared/components/editor/elements/dom/ShapeRenderer.tsx
import type { CanvasElement, ShapeElementProps } from '@/shared/types'

export function ShapeRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ShapeElementProps
  return (
    <div style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height,
      background: p.fill, border: `${p.strokeWidth}px solid ${p.stroke}`,
      borderRadius: p.shape === 'ellipse' ? '50%' : '0', boxSizing: 'border-box'
    }} />
  )
}