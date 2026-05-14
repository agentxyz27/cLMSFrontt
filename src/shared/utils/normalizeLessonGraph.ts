import type { LessonGraph, LessonNode, CanvasData } from '@/shared/types'
import { BLANK_CANVAS } from '@/shared/components/editor/canvasEditor/constants'

/**
 * normalizeLessonGraph
 *
 * Upgrades legacy LessonGraph shapes to the current schema.
 * Run ONCE when loading a lesson into the editor.
 *
 * Handles:
 * - node.contentJson → node.content
 * - missing node.transitions → []
 * - missing graph.startNodeId → first node id
 * - missing graph.version → 1
 * - missing node.content entirely → BLANK_CANVAS
 */
export function normalizeLessonGraph(graph: LessonGraph): LessonGraph {
  const nodes = graph.nodes.map(normalizeNode)

  return {
    version:     graph.version     ?? 1,
    startNodeId: graph.startNodeId ?? nodes[0]?.id ?? '',
    nodes,
    settings:    graph.settings,
  }
}

function normalizeNode(node: LessonNode): LessonNode {
  const legacy = node as any

  const content: CanvasData = node.content ?? legacy.contentJson ?? {
    ...BLANK_CANVAS,
    canvas: { ...BLANK_CANVAS.canvas },
  }

  return {
    id:          node.id,
    type:        node.type,
    title:       node.title,
    questionIds: node.questionIds ?? [],
    content,
    feedback:    node.feedback,
    transitions: node.transitions ?? [],
  }
}
