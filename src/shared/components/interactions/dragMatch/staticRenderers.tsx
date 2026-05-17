import type { CanvasElement, TextElementProps, ImageElementProps, ShapeElementProps } from '@/shared/types'

export function StaticText({ el, scale }: { el: CanvasElement; scale: number }) {
  const p = el.props as TextElementProps
  return (
    <div style={{
      position: 'absolute',
      left: el.x * scale, top: el.y * scale,
      width: el.width * scale, height: el.height * scale,
      fontSize: p.fontSize * scale,
      color: p.color,
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      textAlign: p.align || 'left',
      overflow: 'hidden', whiteSpace: 'pre-wrap',
      wordBreak: 'break-word', lineHeight: 1.2,
      boxSizing: 'border-box', pointerEvents: 'none',
    }}>
      {p.text}
    </div>
  )
}

export function StaticImage({ el, scale }: { el: CanvasElement; scale: number }) {
  const p = el.props as ImageElementProps
  return (
    <img src={p.url} alt={p.alt} style={{
      position: 'absolute',
      left: el.x * scale, top: el.y * scale,
      width: el.width * scale, height: el.height * scale,
      objectFit: 'contain', pointerEvents: 'none',
    }} />
  )
}

export function StaticShape({ el, scale }: { el: CanvasElement; scale: number }) {
  const p = el.props as ShapeElementProps
  return (
    <div style={{
      position: 'absolute',
      left: el.x * scale, top: el.y * scale,
      width: el.width * scale, height: el.height * scale,
      background: p.fill,
      border: `${p.strokeWidth * scale}px solid ${p.stroke}`,
      borderRadius: p.shape === 'ellipse' ? '50%' : 0,
      boxSizing: 'border-box', pointerEvents: 'none',
    }} />
  )
}