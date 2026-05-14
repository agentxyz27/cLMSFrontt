import { useCallback } from 'react'
import type {
  LessonGraph,
  LessonNode,
  LessonNodeType,
  TransitionCondition,
} from '@/shared/types'
import { makeBlankNode } from '../factories'

interface UseNodeGraphOptions {
  setLessonContent: React.Dispatch<React.SetStateAction<LessonGraph>>
  setActiveNodeId: React.Dispatch<React.SetStateAction<string>>
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  closeContextMenu: () => void
}

export function useNodeGraph({
  setLessonContent,
  setActiveNodeId,
  setSelectedId,
  closeContextMenu,
}: UseNodeGraphOptions) {

  // ── Core updater ──────────────────────────────────────────────────────────

  const updateNode = useCallback(
    (nodeId: string, updater: (prev: LessonNode) => LessonNode) => {
      setLessonContent(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === nodeId ? updater(n) : n),
      }))
    },
    [setLessonContent]
  )

  // ── Node CRUD ─────────────────────────────────────────────────────────────

  const addNode = useCallback(() => {
    const newNode = makeBlankNode()
    setLessonContent(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }))
    setActiveNodeId(newNode.id)
    setSelectedId(null)
    closeContextMenu()
  }, [setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu])

  const deleteNode = useCallback(
    (nodeId: string, currentNodes: LessonNode[]) => {
      if (currentNodes.length === 1) return
      const remaining = currentNodes.filter(n => n.id !== nodeId)
      const deletedIndex = currentNodes.findIndex(n => n.id === nodeId)
      setLessonContent(prev => ({ ...prev, nodes: remaining }))
      setActiveNodeId(remaining[Math.max(0, deletedIndex - 1)].id)
      setSelectedId(null)
      closeContextMenu()
    },
    [setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu]
  )

  const changeNodeType = useCallback(
    (nodeId: string, type: LessonNodeType) => {
      updateNode(nodeId, prev => ({ ...prev, type }))
    },
    [updateNode]
  )

  // ── Transitions ───────────────────────────────────────────────────────────

  /**
   * Set or remove a transition for a given condition.
   * - targetNodeId null  → removes that condition's transition
   * - targetNodeId value → upserts that condition's transition
   */
  const setTransition = useCallback(
    (nodeId: string, condition: TransitionCondition, targetNodeId: string | null) => {
      updateNode(nodeId, prev => {
        const without = (prev.transitions ?? []).filter(t => t.condition !== condition)
        if (!targetNodeId) return { ...prev, transitions: without }
        return {
          ...prev,
          transitions: [...without, { condition, targetNodeId }],
        }
      })
    },
    [updateNode]
  )

  // ── Question linkage ──────────────────────────────────────────────────────

  /**
   * Links a Question DB record to a node after creation.
   * Question is the source of truth for interaction config and topic.
   */
const addQuestionId = useCallback(
  (nodeId: string, questionId: number) => {
    updateNode(nodeId, prev => ({
      ...prev,
      questionIds: [...(prev.questionIds ?? []), questionId],
    }))
  },
  [updateNode]
)

const removeQuestionId = useCallback(
  (nodeId: string, questionId: number) => {
    updateNode(nodeId, prev => ({
      ...prev,
      questionIds: (prev.questionIds ?? []).filter(id => id !== questionId),
    }))
  },
  [updateNode]
)

  return {
    addNode,
    deleteNode,
    changeNodeType,
    setTransition,
    addQuestionId,
    removeQuestionId,
    updateNode,
  }
}