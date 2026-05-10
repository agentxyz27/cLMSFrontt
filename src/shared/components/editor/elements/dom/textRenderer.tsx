// shared/components/editor/elements/dom/TextRenderer.tsx
import type { CanvasElement, TextElementProps } from '@/shared/types'

export function TextRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as TextElementProps
  return (
    <div style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height,
      fontSize: p.fontSize, color: p.color,
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      textAlign: p.align || 'left',
      overflow: 'hidden', whiteSpace: 'pre-wrap',
      wordBreak: 'break-word', lineHeight: 1.2, boxSizing: 'border-box'
    }}>
      {p.text}
    </div>
  )
}