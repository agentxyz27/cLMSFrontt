// shared/components/editor/elements/konva/TextElement.tsx
import { useRef, useEffect } from 'react'
import { Text } from 'react-konva'
import type Konva from 'konva'
import type { CanvasElement, TextElementProps } from '@/shared/types'
import type { BaseElementProps } from './types'

export function TextElement({ element, onSelect, onChange, nodeRefCallback }: BaseElementProps) {
  const props = element.props as TextElementProps
  const nodeRef = useRef<Konva.Text>(null)
  useEffect(() => { nodeRefCallback(nodeRef.current); return () => nodeRefCallback(null) }, [])
  return (
    <Text ref={nodeRef}
      x={element.x} y={element.y}
      width={element.width} height={element.height}
      text={props.text} fontSize={props.fontSize}
      fill={props.color} fontStyle={props.fontStyle || 'normal'}
      align={props.align || 'left'}
      draggable
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect}
      onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={e => {
        const node = e.target
        onChange({ ...element, x: node.x(), y: node.y(),
          width: Math.max(50, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()) })
        node.scaleX(1); node.scaleY(1)
      }}
    />
  )
}