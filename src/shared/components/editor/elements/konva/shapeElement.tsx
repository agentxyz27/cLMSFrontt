// shared/components/editor/elements/konva/ShapeElement.tsx
import { useRef, useEffect } from 'react'
import { Rect, Ellipse } from 'react-konva'
import type Konva from 'konva'
import type { ShapeElementProps } from '@/shared/types'
import type { BaseElementProps } from './types'

export function ShapeElement({ element, onSelect, onChange, nodeRefCallback }: BaseElementProps) {
  const props = element.props as ShapeElementProps
  const nodeRef = useRef<Konva.Rect | Konva.Ellipse>(null)
  useEffect(() => { nodeRefCallback(nodeRef.current); return () => nodeRefCallback(null) }, [])

  const cx = element.x + element.width / 2
  const cy = element.y + element.height / 2

  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (props.shape === 'ellipse')
      onChange({ ...element, x: e.target.x() - element.width / 2, y: e.target.y() - element.height / 2 })
    else
      onChange({ ...element, x: e.target.x(), y: e.target.y() })
  }

  const onTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target
    const newW = Math.max(20, node.width() * node.scaleX())
    const newH = Math.max(20, node.height() * node.scaleY())
    node.scaleX(1); node.scaleY(1)
    if (props.shape === 'ellipse')
      onChange({ ...element, x: node.x() - newW / 2, y: node.y() - newH / 2, width: newW, height: newH, rotation: node.rotation() })
    else
      onChange({ ...element, x: node.x(), y: node.y(), width: newW, height: newH, rotation: node.rotation() })
  }

  return props.shape === 'ellipse' ? (
    <Ellipse ref={nodeRef as React.RefObject<Konva.Ellipse>}
      x={cx} y={cy} radiusX={element.width / 2} radiusY={element.height / 2}
      fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth}
      rotation={element.rotation ?? 0} draggable
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect} onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} />
  ) : (
    <Rect ref={nodeRef as React.RefObject<Konva.Rect>}
      x={element.x} y={element.y} width={element.width} height={element.height}
      fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth}
      rotation={element.rotation ?? 0} draggable
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect} onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} />
  )
}