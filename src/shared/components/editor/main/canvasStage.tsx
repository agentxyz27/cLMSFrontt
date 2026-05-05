import { useRef } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Ellipse, Transformer } from 'react-konva'
import { useEffect } from 'react'
import type Konva from 'konva'
import type { CanvasStageProps } from './editorTypes'
import type { CanvasElement, TextElementProps, ImageElementProps, ShapeElementProps } from '@/shared/types'
import { useCanvasZoom } from './canvasEditor/hooks/useCanvasZoom'
import { useCanvasPanning } from './canvasEditor/hooks/useCanvasPanning'

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
  element: CanvasElement; isSelected: boolean
  onSelect: () => void; onChange: (updated: CanvasElement) => void
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
  element: CanvasElement; isSelected: boolean
  onSelect: () => void; onChange: (updated: CanvasElement) => void
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
  element: CanvasElement; isSelected: boolean
  onSelect: () => void; onChange: (updated: CanvasElement) => void
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

  const ellipseCenterX = element.x + element.width / 2
  const ellipseCenterY = element.y + element.height / 2

  const sharedDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (props.shape === 'ellipse') {
      onChange({ ...element, x: e.target.x() - element.width / 2, y: e.target.y() - element.height / 2 })
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
      onChange({ ...element, x: node.x() - newWidth / 2, y: node.y() - newHeight / 2, width: newWidth, height: newHeight })
    } else {
      onChange({ ...element, x: node.x(), y: node.y(), width: newWidth, height: newHeight })
    }
  }

  return (
    <>
      {props.shape === 'ellipse' ? (
        <Ellipse
          ref={nodeRef as React.RefObject<Konva.Ellipse>}
          x={ellipseCenterX} y={ellipseCenterY}
          radiusX={element.width / 2} radiusY={element.height / 2}
          fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth}
          draggable onClick={onSelect} onTap={onSelect}
          onDragEnd={sharedDragEnd} onTransformEnd={sharedTransformEnd}
        />
      ) : (
        <Rect
          ref={nodeRef as React.RefObject<Konva.Rect>}
          x={element.x} y={element.y}
          width={element.width} height={element.height}
          fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth}
          draggable onClick={onSelect} onTap={onSelect}
          onDragEnd={sharedDragEnd} onTransformEnd={sharedTransformEnd}
        />
      )}
      {isSelected && <Transformer ref={trRef} />}
    </>
  )
}

function BackgroundImage({ url, width, height }: { url: string; width: number; height: number }) {
  const image = useImage(url)
  if (!image) return null
  return <KonvaImage x={0} y={0} width={width} height={height} image={image} listening={false} />
}

export default function CanvasStage({ canvasData, selectedId, onSelect, onChange }: CanvasStageProps) {
  const { canvas, elements } = canvasData

  const wrapperRef = useRef<HTMLDivElement>(null)

  const { zoom, stageOffset, setStageOffset } = useCanvasZoom({ wrapperRef })

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useCanvasPanning({
    stageOffset,
    onOffsetChange: setStageOffset,
  })

  return (
    <div
      ref={wrapperRef}
      style={{
        overflow: 'hidden',
        background: '#e5e5e5',
        flex: 1,
        width: '100%',
        height: '100%',
        userSelect: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <Stage
        width={wrapperRef.current?.clientWidth ?? canvas.width}
        height={wrapperRef.current?.clientHeight ?? canvas.height}
        scaleX={zoom}
        scaleY={zoom}
        x={stageOffset.x}
        y={stageOffset.y}
        onMouseDown={e => {
          if (e.target === e.target.getStage()) onSelect(null)
        }}
      >
        <Layer>
          <Rect
            x={0} y={0}
            width={canvas.width} height={canvas.height}
            fill={canvas.background}
            listening={false}
          />

          {canvas.backgroundImage && (
            <BackgroundImage url={canvas.backgroundImage} width={canvas.width} height={canvas.height} />
          )}

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