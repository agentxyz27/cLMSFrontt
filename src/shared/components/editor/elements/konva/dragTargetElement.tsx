// shared/components/editor/elements/konva/DragTargetElement.tsx
import { useRef, useEffect } from 'react'
import { Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { DragTargetProps, DragItemProps, CanvasElement } from '@/shared/types'
import type { BaseElementProps } from './types'

interface DragTargetElementProps extends BaseElementProps {
  linkMode: boolean
  isLinkSource: boolean
  onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => void
  dragItems: CanvasElement[]
}

export function DragTargetElement({ element, onSelect, onChange, nodeRefCallback, linkMode, isLinkSource, onContextMenu, dragItems }: DragTargetElementProps) {
  const props = element.props as DragTargetProps
  const groupRef = useRef<Konva.Group>(null)
  useEffect(() => { nodeRefCallback(groupRef.current); return () => nodeRefCallback(null) }, [])

  const acceptedItem = dragItems.find(i => i.id === props.accepts)
  const acceptedLabel = acceptedItem ? (acceptedItem.props as DragItemProps).label : null
  const labelAreaHeight = acceptedLabel ? element.height - 22 : element.height

  return (
    <Group ref={groupRef}
      x={element.x} y={element.y}
      draggable={!linkMode}
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect}
      onContextMenu={onContextMenu}
      onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={e => {
        const node = e.target
        onChange({ ...element, x: node.x(), y: node.y(),
          width: Math.max(60, element.width * node.scaleX()),
          height: Math.max(60, element.height * node.scaleY()) })
        node.scaleX(1); node.scaleY(1)
      }}
    >
      {isLinkSource && (
        <Rect x={-4} y={-4} width={element.width + 8} height={element.height + 8}
          stroke="#f59e0b" strokeWidth={2.5} dash={[5, 3]}
          fill="transparent" cornerRadius={10} listening={false} />
      )}
      <Rect x={0} y={0} width={element.width} height={element.height}
        fill={props.color + '18'}
        stroke={isLinkSource ? '#f59e0b' : props.color}
        strokeWidth={isLinkSource ? 2.5 : 2}
        dash={[6, 4]} cornerRadius={8} />
      <Text x={0} y={0} width={element.width} height={labelAreaHeight}
        text={props.label} fontSize={12} fontStyle="bold"
        fill={props.color} align="center" verticalAlign="middle" listening={false} />
      {acceptedLabel && (
        <>
          <Rect x={8} y={element.height - 22} width={element.width - 16} height={16}
            fill={props.color + '22'} cornerRadius={3} listening={false} />
          <Text x={8} y={element.height - 22} width={element.width - 16} height={16}
            text={`← ${acceptedLabel}`} fontSize={9} fill={props.color} opacity={0.85}
            align="center" verticalAlign="middle" listening={false} />
        </>
      )}
      <Rect x={element.width - 34} y={-10} width={32} height={14} fill="#10b981" cornerRadius={3} />
      <Text x={element.width - 34} y={-10} width={32} height={14}
        text="DROP" fontSize={8} fontStyle="bold" fill="#fff"
        align="center" verticalAlign="middle" listening={false} />
    </Group>
  )
}