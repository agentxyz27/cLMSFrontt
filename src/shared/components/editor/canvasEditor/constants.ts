import type { CanvasData, LessonGraph, LessonNodeType } from '@/shared/types'

export const BLANK_CANVAS: CanvasData = {
  canvas: { width: 1280, height: 720, background: '#ffffff' },
  elements: []
}

export const BLANK_LESSON: LessonGraph = {
  nodes: [
    {
      id: 'node_1',
      type: 'explanation',
      contentJson: { ...BLANK_CANVAS },
      nextNodeId: null,
      hintNodeId: null
    }
  ],
  settings: { passingScore: 70, retryLimit: null, badgeId: null }
}

export const NODE_TYPE_COLOR: Record<LessonNodeType, string> = {
  explanation: '#3b82f6',
  example:     '#8b5cf6',
  quiz:        '#f59e0b',
  hint:        '#10b981',
  result:      '#ef4444'
}

export const NODE_TYPE_LABEL: Record<LessonNodeType, string> = {
  explanation: 'Explanation',
  example:     'Example',
  quiz:        'Quiz',
  hint:        'Hint',
  result:      'Result'
}