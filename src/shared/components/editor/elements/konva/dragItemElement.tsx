// shared/components/editor/elements/konva/DragItemElement.tsx
import { useRef, useEffect } from 'react'
import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { DragItemProps } from '@/shared/types'
import type { BaseElementProps } from './types'

interface DragItemElementProps extends BaseElementProps {
  linkMode: boolean
  onLinkPick: (itemId: string) => void
}

export function DragItemElement({ element, onSelect, onChange, nodeRefCallback, linkMode, onLinkPick }: DragItemElementProps) {
  const props = element.props as DragItemProps
  const groupRef = useRef<Konva.Group>(null)
  useEffect(() => { nodeRefCallback(groupRef.current); return () => nodeRefCallback(null) }, [])

  return (
    <Group ref={groupRef}
      x={element.x} y={element.y}
      draggable={!linkMode}
      onClick={e => { if (e.evt.button !== 0) return; linkMode ? onLinkPick(element.id) : onSelect() }}
      onTap={() => linkMode ? onLinkPick(element.id) : onSelect()}
      onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={e => {
        const node = e.target
        onChange({ ...element, x: node.x(), y: node.y(),
          width: Math.max(60, element.width * node.scaleX()),
          height: Math.max(30, element.height * node.scaleY()) })
        node.scaleX(1); node.scaleY(1)
      }}
    >
      {linkMode && (
        <Rect x={-4} y={-4} width={element.width + 8} height={element.height + 8}
          stroke="#f59e0b" strokeWidth={2} dash={[5, 3]}
          fill="transparent" cornerRadius={10} listening={false} />
      )}
      <Rect x={0} y={0} width={element.width} height={element.height}
        fill={props.color} cornerRadius={8}
        shadowColor="rgba(0,0,0,0.2)" shadowBlur={linkMode ? 14 : 6} shadowOffsetY={2} />
      <Text x={0} y={0} width={element.width} height={element.height}
        text={props.label} fontSize={14} fontStyle="bold"
        fill={props.textColor} align="center" verticalAlign="middle" listening={false} />
      <Rect x={element.width - 32} y={-10} width={30} height={14} fill="#f59e0b" cornerRadius={3} />
      <Text x={element.width - 32} y={-10} width={30} height={14}
        text="DRAG" fontSize={8} fontStyle="bold" fill="#fff"
        align="center" verticalAlign="middle" listening={false} />
    </Group>
  )
}