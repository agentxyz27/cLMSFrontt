// shared/components/editor/elements/dom/ImageRenderer.tsx
import type { CanvasElement, ImageElementProps } from '@/shared/types'

export function ImageRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ImageElementProps
  return (
    <img src={p.url} alt={p.alt} style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height, objectFit: 'contain'
    }} />
  )
}