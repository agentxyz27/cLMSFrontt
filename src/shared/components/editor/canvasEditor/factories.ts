import type { CanvasElement, LessonNode, LessonGraph, LessonNodeType, CanvasData } from '@/shared/types'
import { BLANK_CANVAS, NODE_TYPE_COLOR } from './constants'

// ── ID generators ──────────────────────────────────────────────────────────

let _elCounter   = 0
let _nodeCounter = 0

export const generateElementId = () => `el_${Date.now()}_${++_elCounter}`
export const generateNodeId    = () => `node_${Date.now()}_${++_nodeCounter}`

// ── Element factories — base ───────────────────────────────────────────────

export const makeTextElement = (): CanvasElement => ({
  id: generateElementId(),
  type: 'text',
  x: 100, y: 100, width: 300, height: 60,
  rotation: 0,
  props: { text: 'Text here', fontSize: 24, color: '#111111', fontStyle: 'normal', align: 'left' }
})

export const makeImageElement = (url: string): CanvasElement => ({
  id: generateElementId(),
  type: 'image',
  x: 100, y: 100, width: 300, height: 200,
  rotation: 0,
  props: { url, alt: 'Image' }
})

export const makeShapeElement = (): CanvasElement => ({
  id: generateElementId(),
  type: 'shape',
  x: 100, y: 100, width: 200, height: 120,
  rotation: 0,
  props: { fill: '#4A90D9', stroke: '#2c5f8a', strokeWidth: 2, shape: 'rect' }
})

// ── Element factories — interactive ───────────────────────────────────────
// Transitional: drag/mc elements remain on canvas for now.
// Long-term: canvas = visuals only; interaction logic lives in Question.contentJson.

/**
 * Draggable item for DRAG_MATCH.
 * Teacher places on canvas and sets the label.
 * Correctness config lives in Question.contentJson (DragMatchConfig).
 */
export const makeDragItem = (): CanvasElement => ({
  id: generateElementId(),
  type: 'drag-item',
  x: 100, y: 400, width: 140, height: 52,
  rotation: 0,
  props: {
    label: 'Item',
    color: '#4A90D9',
    textColor: '#ffffff'
  }
})

/**
 * Drop target for DRAG_MATCH.
 * Teacher places on canvas and links to a drag-item id via accepts.
 * accepts is '' initially — teacher sets it via the link mode tool.
 */
export const makeDragTarget = (): CanvasElement => ({
  id: generateElementId(),
  type: 'drag-target',
  x: 300, y: 200, width: 140, height: 140,
  rotation: 0,
  props: {
    accepts: '',    // set by teacher via link mode
    label: 'Target',
    color: '#10b981'
  }
})

/**
 * Multiple choice option element.
 * Teacher places freely on canvas.
 * index maps to MultipleChoiceConfig.correctIndex in Question.contentJson.
 */
export const makeMcOption = (index: number): CanvasElement => ({
  id: generateElementId(),
  type: 'mc-option',
  x: 100 + index * 160, y: 500, width: 140, height: 52,
  rotation: 0,
  props: {
    label: `Option ${index + 1}`,
    index,
    color: '#f3f4f6',
    textColor: '#111111'
  }
})

// ── Node factory ───────────────────────────────────────────────────────────

/**
 * Produces a blank hook node with empty canvas and no transitions.
 * Default type is hook — teacher changes via NodeSettingsPopover.
 */
export const makeBlankNode = (): LessonNode => ({
  id: generateNodeId(),
  type: 'hook',
  content: {
    ...BLANK_CANVAS,
    canvas: { ...BLANK_CANVAS.canvas }
  },
  transitions: []
})


/**
 * Creates a fully scaffolded default lesson graph.
 * All 5 pedagogical nodes pre-created, wired, and ready to author into.
 * practice and mastery nodes have no questionId — teacher attaches later.
 *
 * This is what a blank lesson gives the teacher.
 * Templates are the same structure with content already filled in.
 */
export function makeDefaultLessonGraph(): LessonGraph {
  const hookId     = generateNodeId()
  const teachId    = generateNodeId()
  const practiceId = generateNodeId()
  const masteryId  = generateNodeId()
  const rewardId   = generateNodeId()

  const makeCanvas = (type: LessonNodeType): CanvasData => ({
    canvas: {
      width: 1280,
      height: 720,
      background: NODE_TYPE_COLOR[type],  // each node starts with its semantic color
    },
    elements: []
  })

  const nodes: LessonNode[] = [
    {
      id: hookId,
      type: 'hook',
      title: 'Hook',
      content: makeCanvas('hook'),
      transitions: [{ targetNodeId: teachId, condition: 'always' }]
    },
    {
      id: teachId,
      type: 'teach',
      title: 'Teach',
      content: makeCanvas('teach'),
      transitions: [{ targetNodeId: practiceId, condition: 'always' }]
    },
    {
      id: practiceId,
      type: 'practice',
      title: 'Practice',
      content: makeCanvas('practice'),
      questionIds: [],
      transitions: [
        { targetNodeId: masteryId,  condition: 'passed' },
        { targetNodeId: practiceId, condition: 'failed' },
      ]
    },
    {
      id: masteryId,
      type: 'mastery',
      title: 'Mastery',
      content: makeCanvas('mastery'),
      questionIds: [],
      transitions: [
        { targetNodeId: rewardId,  condition: 'passed' },
        { targetNodeId: practiceId, condition: 'failed' },
      ]
    },
    {
      id: rewardId,
      type: 'reward',
      title: 'Reward',
      content: makeCanvas('reward'),
      transitions: []
    },
  ]

  return {
    version: 1,
    startNodeId: hookId,
    nodes,
    settings: { passingScore: 75, retryLimit: 3, badgeId: null }
  }
}