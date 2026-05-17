import type React from 'react'
import type { DragMatchContent, CanvasElement } from '@/shared/types'

export interface SkinItemState {
  item: DragMatchContent['items'][number]
  canvasEl: CanvasElement
  scale: number
  isPlaced: boolean
  isDragging: boolean
  disabled: boolean
  onDragStart: () => void
}

export interface SkinTargetState {
  target: DragMatchContent['targets'][number]
  canvasEl: CanvasElement
  scale: number
  placedItem: DragMatchContent['items'][number] | null
  disabled: boolean
  onDrop: () => void
  onDragOver: (e: React.DragEvent) => void
  onUnplace: () => void
}

export interface SkinConfigProps {
  pairs: { itemLabel: string; targetLabel: string }[]
  skinMeta: Record<string, unknown>
  onChange: (meta: Record<string, unknown>) => void
}

export interface DragMatchSkinPlugin {
  id: string
  prepare: (content: DragMatchContent) => { items: any[]; targets: any[] }
  ItemRenderer: React.FC<SkinItemState>
  TargetRenderer: React.FC<SkinTargetState>
  ConfigFields?: React.FC<SkinConfigProps>
  defaultMeta?: () => Record<string, unknown>
}