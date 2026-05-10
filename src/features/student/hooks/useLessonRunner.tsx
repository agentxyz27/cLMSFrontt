import { useState, useEffect, useCallback, useRef } from 'react'

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

export function useLessonRunner(
  graph: LessonGraph | null,
  lessonId: string | undefined,
  token: string | null
) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalQuizNodes, setTotalQuizNodes] = useState(0)
  const [lessonDone, setLessonDone] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [session, setSession] = useState<QuestionAttemptSession | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [attemptLoading, setAttemptLoading] = useState(false)
  const [attemptError, setAttemptError] = useState<string | null>(null)
  const [questionFinished, setQuestionFinished] = useState(false)

  const sessionTokenRef = useRef<string | null>(null)
  const questionFinishedRef = useRef(false)
  const currentNodeRef = useRef<LessonNode | null>(null)

  useEffect(() => {
    if (!graph?.nodes?.length) return
    setCurrentNodeId(graph.nodes[0].id)
    setTotalQuizNodes(graph.nodes.filter(n => n.type === 'quiz').length)
  }, [graph])

  const currentNode: LessonNode | null =
    graph?.nodes?.find(n => n.id === currentNodeId) ?? null

  useEffect(() => { currentNodeRef.current = currentNode }, [currentNode])

  useEffect(() => {
    if (!currentNode || currentNode.type !== 'quiz' || !currentNode.questionId || !token) return
    startQuestion(currentNode.questionId)
  }, [currentNodeId])

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

  function goToNode(nodeId: string | null) {
    const nodes = graph?.nodes ?? []
    resetAttempt()
    if (!nodeId) {
      const currentIndex = nodes.findIndex(n => n.id === currentNodeId)
      const nextNode = nodes[currentIndex + 1]
      if (nextNode) { setCurrentNodeId(nextNode.id); return }
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

  const resetAttempt = useCallback(() => {
    setSession(null)
    setSessionToken(null)
    sessionTokenRef.current = null
    setFeedback(null)
    setHintsUsed(0)
    setAttempts(0)
    setAttemptLoading(false)
    setAttemptError(null)
    setQuestionFinished(false)
    questionFinishedRef.current = false
  }, [])

  const startQuestion = useCallback(async (questionId: number): Promise<string | null> => {
    if (!token) return null
    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.startQuestion(questionId, token)
      setSession(res.session)
      setSessionToken(res.session.sessionToken)
      sessionTokenRef.current = res.session.sessionToken
      setHintsUsed(res.session.hintsUsed)
      setAttempts(res.session.attempts)
      if (res.session.isSubmitted) {
        setQuestionFinished(true)
        questionFinishedRef.current = true
      }
      return res.session.sessionToken
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to start question')
      return null
    } finally {
      setAttemptLoading(false)
    }
  }, [token])

  const submitAnswer = useCallback(async (answer: unknown, correct: boolean) => {
    if (!token || questionFinishedRef.current) return

    let token_ = sessionTokenRef.current
    if (!token_) {
      const node = currentNodeRef.current
      if (!node?.questionId) return
      token_ = await startQuestion(node.questionId)
      if (!token_) return
    }

    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.submitAnswer(token_, { answer, correct }, token)
      setSession(res.session)
      setAttempts(res.session.attempts)
      setFeedback(correct ? 'correct' : 'wrong')

      if (correct) {
        setQuestionFinished(true)
        questionFinishedRef.current = true
        setCorrectCount(prev => prev + 1)
        // Student clicks Next → in activeLessonView to advance
      } else {
        setTimeout(() => setFeedback(null), 1000)
      }
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setAttemptLoading(false)
    }
  }, [token, startQuestion])

  const useHint = useCallback(async (hintIndex: number) => {
    if (!token || !sessionTokenRef.current || questionFinishedRef.current) return
    setAttemptError(null)
    try {
      const res = await attemptApi.useHint(sessionTokenRef.current, hintIndex, token)
      setHintsUsed(res.hintsUsed)
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to record hint')
    }
  }, [token])

  const giveUp = useCallback(async () => {
    if (!token || !sessionTokenRef.current || questionFinishedRef.current) return
    setAttemptLoading(true)
    setAttemptError(null)
    try {
      const res = await attemptApi.finishSession(sessionTokenRef.current, token)
      setSession(res.session)
      setQuestionFinished(true)
      questionFinishedRef.current = true
      // Student clicks Next → in activeLessonView to advance (same as correct answer flow)
    } catch (err: unknown) {
      setAttemptError(err instanceof Error ? err.message : 'Failed to finish session')
    } finally {
      setAttemptLoading(false)
    }
  }, [token])

  return {
    currentNode, currentNodeId, goToNode,
    session, sessionToken, feedback, hintsUsed, attempts,
    attemptLoading, attemptError, questionFinished,
    submitAnswer, useHint, giveUp,
    correctCount, totalQuizNodes,
    lessonDone, reward, completing, completeError,
  }
}