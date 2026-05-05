import type { CanvasElement, LessonNode } from '@/shared/types'
import { BLANK_CANVAS } from './constants'

// ── ID generators ──────────────────────────────────────────────────────────

let _elCounter = 0
export const generateElementId = () => `el_${Date.now()}_${++_elCounter}`

let _nodeCounter = 0
export const generateNodeId = () => `node_${Date.now()}_${++_nodeCounter}`

// ── Element factories ──────────────────────────────────────────────────────

export const makeTextElement = (): CanvasElement => ({
  id: generateElementId(),
  type: 'text',
  x: 100, y: 100, width: 300, height: 60,
  props: { text: 'Text here', fontSize: 24, color: '#111111', fontStyle: 'normal', align: 'left' }
})

export const makeImageElement = (url: string): CanvasElement => ({
  id: generateElementId(),
  type: 'image',
  x: 100, y: 100, width: 300, height: 200,
  props: { url, alt: 'Image' }
})

export const makeShapeElement = (): CanvasElement => ({
  id: generateElementId(),
  type: 'shape',
  x: 100, y: 100, width: 200, height: 120,
  props: { fill: '#4A90D9', stroke: '#2c5f8a', strokeWidth: 2, shape: 'rect' }
})

// ── Node factory ───────────────────────────────────────────────────────────

export const makeBlankNode = (): LessonNode => ({
  id: generateNodeId(),
  type: 'explanation',
  contentJson: { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } },
  nextNodeId: null,
  hintNodeId: null
})