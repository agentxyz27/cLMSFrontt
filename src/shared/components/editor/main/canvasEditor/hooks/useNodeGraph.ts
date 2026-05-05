import { useCallback } from 'react'
import type { LessonGraph, LessonNode, LessonNodeType, QuizData } from '@/shared/types'
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
  closeContextMenu
}: UseNodeGraphOptions) {

  const updateNode = useCallback(
    (nodeId: string, updater: (prev: LessonNode) => LessonNode) => {
      setLessonContent(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => n.id === nodeId ? updater(n) : n)
      }))
    },
    [setLessonContent]
  )

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
      updateNode(nodeId, prev => ({
        ...prev,
        type,
        quiz: type === 'quiz'
          ? (prev.quiz ?? { question: '', choices: ['', '', '', ''], correctIndex: 0 })
          : undefined
      }))
    },
    [updateNode]
  )

  const setNextNode = useCallback(
    (nodeId: string, nextNodeId: string | null) => {
      updateNode(nodeId, prev => ({ ...prev, nextNodeId }))
    },
    [updateNode]
  )

  const setHintNode = useCallback(
    (nodeId: string, hintNodeId: string | null) => {
      updateNode(nodeId, prev => ({ ...prev, hintNodeId }))
    },
    [updateNode]
  )

  const updateQuiz = useCallback(
    (nodeId: string, quiz: QuizData) => {
      updateNode(nodeId, prev => ({ ...prev, quiz }))
    },
    [updateNode]
  )

  return { addNode, deleteNode, changeNodeType, setNextNode, setHintNode, updateQuiz, updateNode }
}