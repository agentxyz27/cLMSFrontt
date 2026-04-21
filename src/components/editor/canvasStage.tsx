/**
 * CanvasStage.tsx
 *
 * Renders the canvas using react-konva.
 * Fixes ellipse position bug — Konva Ellipse centers at x/y,
 * so we store top-left x/y in state and offset to center for rendering,
 * then convert back on drag/transform end.
 *
 * Also renders background image if present in canvas config.
 */
import { useEffect, useRef } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Ellipse, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { CanvasStageProps } from './editorTypes'
import type { CanvasElement, TextElementProps, ImageElementProps, ShapeElementProps } from '../../types'

function useImage(url: string): HTMLImageElement | null {
  const imgRef = useRef<HTMLImageElement | null>(null)
  if (!imgRef.current) {
    const img = new window.Image()
    img.src = url
    imgRef.current = img
  }
  return imgRef.current
}

function TextElement({ element, isSelected, onSelect, onChange }: {
  element: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updated: CanvasElement) => void
}) {
  const props = element.props as TextElementProps
  const nodeRef = useRef<Konva.Text>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  return (
    <>
      <Text
        ref={nodeRef}
        x={element.x} y={element.y}
        width={element.width} height={element.height}
        text={props.text} fontSize={props.fontSize}
        fill={props.color} fontStyle={props.fontStyle || 'normal'}
        align={props.align || 'left'}
        draggable
        onClick={onSelect} onTap={onSelect}
        onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={e => {
          const node = e.target
          onChange({
            ...element,
            x: node.x(), y: node.y(),
            width: Math.max(50, node.width() * node.scaleX()),
            height: Math.max(20, node.height() * node.scaleY())
          })
          node.scaleX(1); node.scaleY(1)
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  )
}

function ImageElement({ element, isSelected, onSelect, onChange }: {
  element: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updated: CanvasElement) => void
}) {
  const props = element.props as ImageElementProps
  const image = useImage(props.url)
  const nodeRef = useRef<Konva.Image>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  if (!image) return null

  return (
    <>
      <KonvaImage
        ref={nodeRef}
        x={element.x} y={element.y}
        width={element.width} height={element.height}
        image={image} draggable
        onClick={onSelect} onTap={onSelect}
        onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
        onTransformEnd={e => {
          const node = e.target
          onChange({
            ...element,
            x: node.x(), y: node.y(),
            width: Math.max(50, node.width() * node.scaleX()),
            height: Math.max(50, node.height() * node.scaleY())
          })
          node.scaleX(1); node.scaleY(1)
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  )
}

function ShapeElement({ element, isSelected, onSelect, onChange }: {
  element: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updated: CanvasElement) => void
}) {
  const props = element.props as ShapeElementProps
  const nodeRef = useRef<Konva.Rect | Konva.Ellipse>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current as Konva.Node])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  // Ellipse fix — Konva centers ellipse at x/y
  // We store top-left x/y, so offset to center for rendering
  const ellipseCenterX = element.x + element.width / 2
  const ellipseCenterY = element.y + element.height / 2

  const sharedDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (props.shape === 'ellipse') {
      // node.x() returns center after drag — convert back to top-left
      onChange({
        ...element,
        x: e.target.x() - element.width / 2,
        y: e.target.y() - element.height / 2
      })
    } else {
      onChange({ ...element, x: e.target.x(), y: e.target.y() })
    }
  }

  const sharedTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const newWidth = Math.max(20, node.width() * node.scaleX())
    const newHeight = Math.max(20, node.height() * node.scaleY())
    node.scaleX(1); node.scaleY(1)

    if (props.shape === 'ellipse') {
      // node.x() returns center — convert back to top-left
      onChange({
        ...element,
        x: node.x() - newWidth / 2,
        y: node.y() - newHeight / 2,
        width: newWidth,
        height: newHeight
      })
    } else {
      onChange({
        ...element,
        x: node.x(), y: node.y(),
        width: newWidth, height: newHeight
      })
    }
  }

  return (
    <>
      {props.shape === 'ellipse' ? (
        <Ellipse
          ref={nodeRef as React.RefObject<Konva.Ellipse>}
          x={ellipseCenterX}
          y={ellipseCenterY}
          radiusX={element.width / 2}
          radiusY={element.height / 2}
          fill={props.fill}
          stroke={props.stroke}
          strokeWidth={props.strokeWidth}
          draggable
          onClick={onSelect} onTap={onSelect}
          onDragEnd={sharedDragEnd}
          onTransformEnd={sharedTransformEnd}
        />
      ) : (
        <Rect
          ref={nodeRef as React.RefObject<Konva.Rect>}
          x={element.x} y={element.y}
          width={element.width} height={element.height}
          fill={props.fill}
          stroke={props.stroke}
          strokeWidth={props.strokeWidth}
          draggable
          onClick={onSelect} onTap={onSelect}
          onDragEnd={sharedDragEnd}
          onTransformEnd={sharedTransformEnd}
        />
      )}
      {isSelected && <Transformer ref={trRef} />}
    </>
  )
}

// Background image renderer
function BackgroundImage({ url, width, height }: { url: string; width: number; height: number }) {
  const image = useImage(url)
  if (!image) return null
  return (
    <KonvaImage
      x={0} y={0}
      width={width} height={height}
      image={image}
      listening={false}
    />
  )
}

export default function CanvasStage({ canvasData, selectedId, onSelect, onChange }: CanvasStageProps) {
  const { canvas, elements } = canvasData

  return (
    <div style={{
      overflow: 'auto', background: '#e5e5e5', flex: 1,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px'
    }}>
      <Stage
        width={canvas.width} height={canvas.height}
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        onMouseDown={e => {
          if (e.target === e.target.getStage()) onSelect(null)
        }}
      >
        <Layer>
          {/* Background color */}
          <Rect
            x={0} y={0}
            width={canvas.width} height={canvas.height}
            fill={canvas.background}
            listening={false}
          />

          {/* Background image — rendered above color, below elements */}
          {canvas.backgroundImage && (
            <BackgroundImage
              url={canvas.backgroundImage}
              width={canvas.width}
              height={canvas.height}
            />
          )}

          {/* Elements */}
          {elements.map(el => {
            const isSelected = el.id === selectedId
            if (el.type === 'text') return (
              <TextElement key={el.id} element={el} isSelected={isSelected}
                onSelect={() => onSelect(el.id)} onChange={onChange} />
            )
            if (el.type === 'image') return (
              <ImageElement key={el.id} element={el} isSelected={isSelected}
                onSelect={() => onSelect(el.id)} onChange={onChange} />
            )
            if (el.type === 'shape') return (
              <ShapeElement key={el.id} element={el} isSelected={isSelected}
                onSelect={() => onSelect(el.id)} onChange={onChange} />
            )
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}