// shared/components/editor/stages/EditorElementDispatcher.tsx
import type { CanvasElement } from '@/shared/types'
import type { DragTargetProps } from '@/shared/types'
import type Konva from 'konva'
import {
  TextElement, ImageElement, ShapeElement,
  DragItemElement, DragTargetElement, McOptionElement,
} from '../../elements/konva'
import type { BaseElementProps } from '../../elements/konva/types'

interface EditorElementDispatcherProps {
  element: CanvasElement
  onSelect: () => void
  onChange: (updated: CanvasElement) => void
  nodeRefCallback: (node: Konva.Node | null) => void
  linkMode: boolean
  isLinkSource: boolean
  dragItems: CanvasElement[]
  onLinkPick: (itemId: string) => void
  onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => void
}

export function EditorElementDispatcher({
  element, onSelect, onChange, nodeRefCallback,
  linkMode, isLinkSource, dragItems,
  onLinkPick, onContextMenu,
}: EditorElementDispatcherProps) {
  const shared: BaseElementProps = { element, onSelect, onChange, nodeRefCallback }

  if (element.type === 'text')   return <TextElement  {...shared} />
  if (element.type === 'image')  return <ImageElement {...shared} />
  if (element.type === 'shape')  return <ShapeElement {...shared} />

  if (element.type === 'drag-item') return (
    <DragItemElement {...shared}
      linkMode={linkMode}
      onLinkPick={onLinkPick}
    />
  )

  if (element.type === 'drag-target') return (
    <DragTargetElement {...shared}
      linkMode={linkMode}
      isLinkSource={isLinkSource}
      dragItems={dragItems}
      onContextMenu={onContextMenu}
    />
  )

  if (element.type === 'mc-option') return <McOptionElement {...shared} />
  return null
}