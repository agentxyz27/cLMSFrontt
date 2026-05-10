// shared/components/editor/elements/konva/McOptionElement.tsx
import { useRef, useEffect } from 'react'
import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { McOptionProps } from '@/shared/types'
import type { BaseElementProps } from './types'

export function McOptionElement({ element, onSelect, onChange, nodeRefCallback }: BaseElementProps) {
  const props = element.props as McOptionProps
  const groupRef = useRef<Konva.Group>(null)
  useEffect(() => { nodeRefCallback(groupRef.current); return () => nodeRefCallback(null) }, [])
  return (
    <Group ref={groupRef}
      x={element.x} y={element.y} draggable
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect}
      onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={e => {
        const node = e.target
        onChange({ ...element, x: node.x(), y: node.y(),
          width: Math.max(60, element.width * node.scaleX()),
          height: Math.max(30, element.height * node.scaleY()) })
        node.scaleX(1); node.scaleY(1)
      }}
    >
      <Rect x={0} y={0} width={element.width} height={element.height}
        fill={props.color} stroke="#d1d5db" strokeWidth={2} cornerRadius={8} />
      <Text x={0} y={0} width={element.width} height={element.height}
        text={props.label} fontSize={14}
        fill={props.textColor} align="center" verticalAlign="middle" listening={false} />
      <Rect x={-10} y={-10} width={20} height={20} fill="#6366f1" cornerRadius={4} />
      <Text x={-10} y={-10} width={20} height={20}
        text={String(props.index + 1)} fontSize={10} fontStyle="bold" fill="#fff"
        align="center" verticalAlign="middle" listening={false} />
    </Group>
  )
}