import { useState, useEffect, useCallback } from 'react'
import { progressApi } from '@/shared/api/progressApi'
import { attemptApi } from '@/shared/api/attemptApi'
import type { LessonNode, LessonGraph, QuestionAttemptSession } from '@/shared/types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

/**
 * useLessonRunner
 *
 * Manages the full student lesson experience.
 *
 * Responsibilities:
 *   - Graph navigation (goToNode, currentNode)
 *   - Attempt pipeline (startQuestion, submitAnswer, useHint, giveUp)
 *   - Lesson completion (progressApi.completeLesson → XP + badges)
 *
 * Attempt lifecycle per quiz node:
 *   1. Node becomes active → startQuestion(node.questionId)
 *   2. Student opens hint  → useHint(hintIndex)
 *   3. Student submits     → submitAnswer(answer, correct)
 *      correct  → SESSION_FINISHED auto-fired, move to next node
 *      wrong    → feedback shown, session stays open
 *   4. Student gives up    → giveUp() → SESSION_FINISHED with correct=false
 *
 * Gamification:
 *   correctCount tracks correct answers for XP score calculation.
 *   MPS is computed separately by the backend snapshot engine.
 *   These two must never be confused.
 */
export function useLessonRunner(
  graph: LessonGraph | null,
  lessonId: string | undefined,
  token: string | null
) {
  // ── Graph navigation ─────────────────────────────────────────────────────
  const [currentNodeId, setCurrentNodeId]   = useState<string | null>(null)

  // ── Gamification ─────────────────────────────────────────────────────────
  const [correctCount, setCorrectCount]     = useState(0)
  const [totalQuizNodes, setTotalQuizNodes] = useState(0)

  // ── Lesson completion ─────────────────────────────────────────────────────
  const [lessonDone, setLessonDone]         = useState(false)
  const [reward, setReward]                 = useState<CompleteResponse | null>(null)
  const [completing, setCompleting]         = useState(false)
  const [completeError, setCompleteError]   = useState<string | null>(null)

  // ── Attempt pipeline ──────────────────────────────────────────────────────
  const [session, setSession]               = useState<QuestionAttemptSession | null>(null)
  const [sessionToken, setSessionToken]     = useState<string | null>(null)
  const [feedback, setFeedback]             = useState<'correct' | 'wrong' | null>(null)
  const [hintsUsed, setHintsUsed]           = useState(0)
  const [attempts, setAttempts]             = useState(0)
  const [attemptLoading, setAttemptLoading] = useState(false)
  const [attemptError, setAttemptError]     = useState<string | null>(null)
  const [questionFinished, setQuestionFinished] = useState(false)

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!graph?.nodes?.length) return
    setCurrentNodeId(graph.nodes[0].id)
    setTotalQuizNodes(graph.nodes.filter(n => n.type === 'quiz').length)
  }, [graph])

  const currentNode: LessonNode | null =
    graph?.nodes?.find(n => n.id === currentNodeId) ?? null

  // ── Auto-start attempt when entering a quiz node ───────────────────────
  useEffect(() => {
    if (!currentNode || currentNode.type !== 'quiz' || !currentNode.questionId || !token) return
    startQuestion(currentNode.questionId)
  }, [currentNodeId])

  // ── Lesson complete ───────────────────────────────────────────────────────
  async function handleLessonComplete() {
    if (lessonDone || !token) return
    setLessonDone(true)
    setCompleting(true)
    try {
      const score = totalQuizNodes > 0
        ? Math.round((correctCount / totalQuizNodes) * 100)
        : 100
      const res = await progressApi.completeLesson(
        { lessonId: Number(lessonId), score },
        token
      )
      setReward(res)
    } catch (err: unknown) {
      setCompleteError(err instanceof Error ? err.message : 'Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  // ── Graph navigation ──────────────────────────────────────────────────────
  function goToNode(nodeId: string | null) {
    const nodes = graph?.nodes ?? []

    // Reset attempt state when moving between nodes
    resetAttempt()

    if (!nodeId) {
      const currentIndex = nodes.findIndex(n => n.id === currentNodeId)
      const nextNode = nodes[currentIndex + 1]
      if (nextNode) {
        setCurrentNodeId(nextNode.id)
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
  }

  // ── Reset attempt state between nodes ─────────────────────────────────────
  const resetAttempt = useCallback(() => {
    setSession(null)
    setSessionToken(null)
    setFeedback(null)
    setHintsUsed(0)
    setAttempts(0)
    setAttemptLoading(false)
    setAttemptError(null)
    setQuestionFinished(false)
  }, [])

  // ── Start or resume a question session ────────────────────────────────────
  const startQuestion = useCallback(async (questionId: number) => {
    if (!token) return
    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.startQuestion(questionId, token)
      setSession(res.session)
      setSessionToken(res.session.sessionToken)
      setHintsUsed(res.session.hintsUsed)
      setAttempts(res.session.attempts)
      if (res.session.isSubmitted) setQuestionFinished(true)
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to start question')
    } finally {
      setAttemptLoading(false)
    }
  }, [token])

  // ── Submit an answer ──────────────────────────────────────────────────────
  // correct is determined by the frontend interaction component
  // Backend trusts this flag and records it
  const submitAnswer = useCallback(async (answer: unknown, correct: boolean) => {
    if (!token || !sessionToken || questionFinished) return
    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.submitAnswer(sessionToken, { answer, correct }, token)
      setSession(res.session)
      setAttempts(res.session.attempts)
      setFeedback(correct ? 'correct' : 'wrong')

      if (correct) {
        setQuestionFinished(true)
        setCorrectCount(prev => prev + 1)
        setTimeout(() => {
          setFeedback(null)
          goToNode(currentNode?.nextNodeId ?? null)
        }, 1000)
      } else {
        setTimeout(() => {
          setFeedback(null)
          // Navigate to hint node if available
          if (currentNode?.hintNodeId) goToNode(currentNode.hintNodeId)
        }, 1000)
      }
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setAttemptLoading(false)
    }
  }, [token, sessionToken, questionFinished, currentNode])

  // ── Open a hint ───────────────────────────────────────────────────────────
  const useHint = useCallback(async (hintIndex: number) => {
    if (!token || !sessionToken || questionFinished) return
    setAttemptError(null)
    try {
      const res = await attemptApi.useHint(sessionToken, hintIndex, token)
      setHintsUsed(res.hintsUsed)
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to record hint')
    }
  }, [token, sessionToken, questionFinished])

  // ── Give up — finalize session with correct = false ───────────────────────
  const giveUp = useCallback(async () => {
    if (!token || !sessionToken || questionFinished) return
    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.finishSession(sessionToken, token)
      setSession(res.session)
      setQuestionFinished(true)
      goToNode(currentNode?.nextNodeId ?? null)
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to finish session')
    } finally {
      setAttemptLoading(false)
    }
  }, [token, sessionToken, questionFinished, currentNode])

  return {
    // Graph
    currentNode,
    currentNodeId,
    goToNode,

    // Attempt pipeline
    session,
    sessionToken,
    feedback,
    hintsUsed,
    attempts,
    attemptLoading,
    attemptError,
    questionFinished,
    submitAnswer,
    useHint,
    giveUp,

    // Gamification
    correctCount,
    totalQuizNodes,

    // Lesson completion
    lessonDone,
    reward,
    completing,
    completeError,
  }
}