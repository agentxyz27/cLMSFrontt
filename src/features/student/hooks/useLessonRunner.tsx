import { useState, useEffect } from 'react'
import { progressApi } from '../../../shared/api/progressApi'
import type { LessonNode, LessonGraph } from '../../../shared/types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

export function useLessonRunner(
  graph: LessonGraph | null,
  lessonId: string | undefined,
  token: string | null
) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalQuizNodes, setTotalQuizNodes] = useState(0)
  const [lessonDone, setLessonDone] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!graph?.nodes?.length) return
    setCurrentNodeId(graph.nodes[0].id)
    setTotalQuizNodes(graph.nodes.filter(n => n.type === 'quiz').length)
  }, [graph])

  const currentNode: LessonNode | null =
    graph?.nodes?.find(n => n.id === currentNodeId) ?? null

  async function handleLessonComplete() {
    if (lessonDone || !token) return
    setLessonDone(true)
    setCompleting(true)
    try {
      const score = totalQuizNodes > 0
        ? Math.round((correctCount / totalQuizNodes) * 100)
        : 100
      const res = await progressApi.completeLesson({ lessonId: Number(lessonId), score }, token)
      setReward(res)
    } catch (err: unknown) {
      setCompleteError(err instanceof Error ? err.message : 'Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  function goToNode(nodeId: string | null) {
    const nodes = graph?.nodes ?? []
    if (!nodeId) {
      const currentIndex = nodes.findIndex(n => n.id === currentNodeId)
      const nextNode = nodes[currentIndex + 1]
      if (nextNode) {
        setCurrentNodeId(nextNode.id)
        setSelectedChoice(null)
        setAnswerFeedback(null)
        return
      }
      handleLessonComplete()
      return
    }
    const next = nodes.find(n => n.id === nodeId)
    if (!next) { handleLessonComplete(); return }
    if (next.type === 'result') {
      setCurrentNodeId(nodeId)
      setTimeout(() => handleLessonComplete(), 1500)
      return
    }
    setCurrentNodeId(nodeId)
    setSelectedChoice(null)
    setAnswerFeedback(null)
  }

  function handleAnswer() {
    if (!currentNode?.quiz || selectedChoice === null) return
    const isCorrect = selectedChoice === currentNode.quiz.correctIndex
    if (isCorrect) {
      setAnswerFeedback('correct')
      setCorrectCount(prev => prev + 1)
      setTimeout(() => { setAnswerFeedback(null); goToNode(currentNode.nextNodeId) }, 1000)
    } else {
      setAnswerFeedback('wrong')
      setTimeout(() => {
        setAnswerFeedback(null)
        setSelectedChoice(null)
        if (currentNode.hintNodeId) goToNode(currentNode.hintNodeId)
      }, 1000)
    }
  }

  return {
    currentNode, currentNodeId,
    selectedChoice, setSelectedChoice,
    answerFeedback, correctCount, totalQuizNodes,
    lessonDone, reward, completing, completeError,
    goToNode, handleAnswer
  }
}