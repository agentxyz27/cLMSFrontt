import type { CanvasData, LessonGraph, LessonNodeType } from '@/shared/types'

export const BLANK_CANVAS: CanvasData = {
  canvas: { width: 1280, height: 720, background: '#ffffff' },
  elements: []
}

export const BLANK_LESSON: LessonGraph = {
  version: 1,
  startNodeId: 'node_1',
  nodes: [
    {
      id: 'node_1',
      type: 'hook',
      content: { ...BLANK_CANVAS },
      transitions: []
    }
  ],
  settings: { passingScore: 70, retryLimit: null, badgeId: null }
}

export const NODE_TYPE_COLOR: Record<LessonNodeType, string> = {
  hook:     '#60a5fa',  // blue    — attention grab
  teach:    '#8b5cf6',  // purple  — concept delivery
  practice: '#f59e0b',  // amber   — guided skill
  mastery:  '#ef4444',  // red     — independent assessment
  reward:   '#10b981',  // green   — celebration
}

export const NODE_TYPE_LABEL: Record<LessonNodeType, string> = {
  hook:     'Hook',
  teach:    'Teach',
  practice: 'Practice',
  mastery:  'Mastery',
  reward:   'Reward',
}