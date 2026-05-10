// shared/components/editor/elements/konva/ImageElement.tsx
import { useRef, useEffect } from 'react'
import { Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import type { ImageElementProps } from '@/shared/types'
import type { BaseElementProps } from './types'
import { useImage } from '../../hooks/useImage'

export function ImageElement({ element, onSelect, onChange, nodeRefCallback }: BaseElementProps) {
  const props = element.props as ImageElementProps
  const image = useImage(props.url)
  const nodeRef = useRef<Konva.Image>(null)
  useEffect(() => { nodeRefCallback(nodeRef.current); return () => nodeRefCallback(null) }, [])
  if (!image) return null
  return (
    <KonvaImage ref={nodeRef}
      x={element.x} y={element.y}
      width={element.width} height={element.height}
      image={image} draggable rotation={element.rotation ?? 0}
      onClick={e => { if (e.evt.button === 0) onSelect() }}
      onTap={onSelect}
      onDragEnd={e => onChange({ ...element, x: e.target.x(), y: e.target.y() })}
      onTransformEnd={e => {
        const node = e.target
        onChange({ ...element, x: node.x(), y: node.y(),
          rotation: node.rotation(),
          width: Math.max(50, node.width() * node.scaleX()),
          height: Math.max(50, node.height() * node.scaleY()) })
        node.scaleX(1); node.scaleY(1)
      }}
    />
  )
}