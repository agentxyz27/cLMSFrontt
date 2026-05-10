import type { CanvasElement, LessonNode } from '@/shared/types'
import { BLANK_CANVAS } from './constants'

// ── ID generators ──────────────────────────────────────────────────────────

let _elCounter = 0
export const generateElementId = () => `el_${Date.now()}_${++_elCounter}`

let _nodeCounter = 0
export const generateNodeId = () => `node_${Date.now()}_${++_nodeCounter}`

// ── Element factories — existing ───────────────────────────────────────────

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

// ── Element factories — interactive ───────────────────────────────────────

// Creates a draggable item for DRAG_MATCH.
// Teacher places these on the canvas and sets the label.
export const makeDragItem = (): CanvasElement => ({
  id: generateElementId(),
  type: 'drag-item',
  x: 100, y: 400, width: 140, height: 52,
  props: {
    label: 'Item',
    color: '#4A90D9',
    textColor: '#ffffff'
  }
})

// Creates a drop target for DRAG_MATCH.
// Teacher places these on the canvas, sets label and which drag-item it accepts.
// accepts is set to '' initially — teacher must link it to a drag-item id.
export const makeDragTarget = (): CanvasElement => ({
  id: generateElementId(),
  type: 'drag-target',
  x: 300, y: 200, width: 140, height: 140,
  props: {
    accepts: '',     // teacher sets this to a drag-item id
    label: 'Target',
    color: '#10b981'
  }
})

// Creates a multiple choice option element.
// Teacher places these freely on the canvas.
// index maps to QuizData.correctIndex on the node.
export const makeMcOption = (index: number): CanvasElement => ({
  id: generateElementId(),
  type: 'mc-option',
  x: 100 + index * 160, y: 500, width: 140, height: 52,
  props: {
    label: `Option ${index + 1}`,
    index,
    color: '#f3f4f6',
    textColor: '#111111'
  }
})

// ── Node factory ───────────────────────────────────────────────────────────

export const makeBlankNode = (): LessonNode => ({
  id: generateNodeId(),
  type: 'explanation',
  contentJson: { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } },
  nextNodeId: null,
  hintNodeId: null
})