import type { CanvasData, CanvasElement, TextElementProps, ImageElementProps, ShapeElementProps } from '../../../types'

export const NODE_TYPE_COLOR: Record<string, string> = {
  explanation: '#3b82f6', example: '#8b5cf6',
  quiz: '#f59e0b', hint: '#10b981', result: '#ef4444'
}

export const NODE_TYPE_LABEL: Record<string, string> = {
  explanation: 'Explanation', example: 'Example',
  quiz: 'Quiz', hint: 'Hint', result: 'Result'
}

function TextRenderer({ element }: { element: CanvasElement }) {
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

function ImageRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ImageElementProps
  return (
    <img src={p.url} alt={p.alt} style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height, objectFit: 'contain'
    }} />
  )
}

function ShapeRenderer({ element }: { element: CanvasElement }) {
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

export function CanvasRenderer({ canvasData, scale }: { canvasData: CanvasData; scale: number }) {
  const { canvas, elements } = canvasData
  return (
    <div style={{
      position: 'relative', width: canvas.width, height: canvas.height,
      background: canvas.background,
      ...(canvas.backgroundImage ? {
        backgroundImage: `url(${canvas.backgroundImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      } : {}),
      transform: `scale(${scale})`, transformOrigin: 'top left',
      marginBottom: canvas.height * (scale - 1), overflow: 'hidden'
    }}>
      {elements.map(el => {
        if (el.type === 'text') return <TextRenderer key={el.id} element={el} />
        if (el.type === 'image') return <ImageRenderer key={el.id} element={el} />
        if (el.type === 'shape') return <ShapeRenderer key={el.id} element={el} />
        return null
      })}
    </div>
  )
}