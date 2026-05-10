// shared/components/editor/elements/konva/types.ts
import type Konva from 'konva'
import type { CanvasElement } from '@/shared/types'

export interface BaseElementProps {
  element: CanvasElement
  onSelect: () => void
  onChange: (updated: CanvasElement) => void
  nodeRefCallback: (node: Konva.Node | null) => void
}