// shared/components/editor/stages/PreviewStage.tsx
// Konva-based, read-only thumbnail — used in lesson cards, template browser
import { Stage, Layer, Rect, Text, Ellipse, Image as KonvaImage } from 'react-konva'
import type { CanvasData, TextElementProps, ImageElementProps, ShapeElementProps } from '@/shared/types'
import { BackgroundImage } from '../elements/konva'
import { useImage } from '../hooks/useImage'

function PreviewImage({ element }: { element: import('@/shared/types').CanvasElement }) {
  const props = element.props as ImageElementProps
  const image = useImage(props.url)
  if (!image) return null
  return (
    <KonvaImage
      x={element.x} y={element.y}
      width={element.width} height={element.height}
      rotation={element.rotation ?? 0}
      image={image} listening={false}
    />
  )
}

interface PreviewStageProps {
  contentJson?: CanvasData | null
  previewWidth?: number
}

export function PreviewStage({ contentJson, previewWidth = 640 }: PreviewStageProps) {
  const fallback = (msg: string) => (
    <div style={{ width: previewWidth, height: previewWidth * 0.5625, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#999' }}>{msg}</p>
    </div>
  )

  if (!contentJson?.canvas) return fallback('No preview')

  const { canvas, elements = [] } = contentJson
  if (!canvas.width || !canvas.height) return fallback('Invalid canvas')

  const scale = previewWidth / canvas.width
  const previewHeight = canvas.height * scale

  return (
    <div style={{ width: previewWidth, height: previewHeight, overflow: 'hidden' }}>
      <Stage width={previewWidth} height={previewHeight} scaleX={scale} scaleY={scale} listening={false}>
        <Layer>
          <Rect x={0} y={0} width={canvas.width} height={canvas.height} fill={canvas.background || '#ffffff'} listening={false} />
          {canvas.backgroundImage && <BackgroundImage url={canvas.backgroundImage} width={canvas.width} height={canvas.height} />}
          {elements.map(el => {
            if (!el) return null
            if (el.type === 'text') {
              const p = el.props as TextElementProps
              return <Text key={el.id} x={el.x} y={el.y} width={el.width} height={el.height}
                rotation={el.rotation ?? 0} text={p.text || ''} fontSize={p.fontSize || 16}
                fill={p.color || '#000'} fontStyle={p.fontStyle || 'normal'}
                align={p.align || 'left'} listening={false} />
            }
            if (el.type === 'image') return <PreviewImage key={el.id} element={el} />
            if (el.type === 'shape') {
              const p = el.props as ShapeElementProps
              return p.shape === 'ellipse'
                ? <Ellipse key={el.id} x={el.x + el.width / 2} y={el.y + el.height / 2}
                    radiusX={el.width / 2} radiusY={el.height / 2} rotation={el.rotation ?? 0}
                    fill={p.fill || '#ccc'} stroke={p.stroke || '#000'} strokeWidth={p.strokeWidth || 1} listening={false} />
                : <Rect key={el.id} x={el.x} y={el.y} width={el.width} height={el.height}
                    rotation={el.rotation ?? 0} fill={p.fill || '#ccc'} stroke={p.stroke || '#000'}
                    strokeWidth={p.strokeWidth || 1} listening={false} />
            }
            // drag-item, drag-target, mc-option intentionally not rendered in preview
            // they are interaction elements — showing them as static Konva is misleading
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}