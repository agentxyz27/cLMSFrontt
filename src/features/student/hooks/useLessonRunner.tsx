import { useState, useEffect, useCallback, useRef } from 'react'
import { progressApi } from '@/shared/api/progressApi'
import { attemptApi } from '@/shared/api/attemptApi'
import { questionApi } from '@/shared/api/questionApi'
import type {
  LessonNode, LessonGraph, QuestionAttemptSession, TransitionCondition, Question
} from '@/shared/types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

interface NodeAttemptState {
  questionIndex: number
  nodeCorrectCount: number
  nodeRetries: number
  sessions: Record<number, QuestionAttemptSession>
  currentSession: QuestionAttemptSession | null
  sessionToken: string | null
  feedback: 'correct' | 'wrong' | null
  hintsUsed: number
  attempts: number
  questionFinished: boolean
  loading: boolean
  error: string | null
}

const BLANK_NODE_ATTEMPT: NodeAttemptState = {
  questionIndex: 0,
  nodeCorrectCount: 0,
  nodeRetries: 0,
  sessions: {},
  currentSession: null,
  sessionToken: null,
  feedback: null,
  hintsUsed: 0,
  attempts: 0,
  questionFinished: false,
  loading: false,
  error: null,
}

export function useLessonRunner(
  graph: LessonGraph | null,
  lessonId: string | undefined,
  token: string | null
) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [nodeAttempt, setNodeAttempt] = useState<NodeAttemptState>(BLANK_NODE_ATTEMPT)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [lessonDone, setLessonDone] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [lessonCorrectCount, setLessonCorrectCount] = useState(0)
  const [lessonTotalQuestions, setLessonTotalQuestions] = useState(0)

  const nodeAttemptRef = useRef<NodeAttemptState>(BLANK_NODE_ATTEMPT)
  const sessionTokenRef = useRef<string | null>(null)

  // ── Init ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!graph?.nodes?.length) return
    const startNode = graph.nodes.find(n => n.id === graph.startNodeId) ?? graph.nodes[0]
    setCurrentNodeId(startNode.id)
    const total = graph.nodes
      .filter(n => n.type === 'practice' || n.type === 'mastery')
      .reduce((sum, n) => sum + (n.questionIds?.length ?? 0), 0)
    setLessonTotalQuestions(total)
  }, [graph])

  // ── Derived ─────────────────────────────────────────────────────────────

  const nodeMap = graph
    ? Object.fromEntries(graph.nodes.map(n => [n.id, n]))
    : {}

  const currentNode: LessonNode | null = currentNodeId ? nodeMap[currentNodeId] ?? null : null
  const isInteractiveNode = currentNode?.type === 'practice' || currentNode?.type === 'mastery'
  const currentQuestionId: number | null = isInteractiveNode
    ? (currentNode?.questionIds?.[nodeAttempt.questionIndex] ?? null)
    : null
  const nodeQuestionCount = currentNode?.questionIds?.length ?? 0

  // ── Fetch current question ───────────────────────────────────────────────

  useEffect(() => {
    if (!currentQuestionId || !token) { setCurrentQuestion(null); return }
    questionApi.getById(currentQuestionId, token)
      .then(q => setCurrentQuestion(q))
      .catch(() => setCurrentQuestion(null))
  }, [currentQuestionId, token])

  // ── Auto-start question session ──────────────────────────────────────────

  useEffect(() => {
    if (!currentNode || !isInteractiveNode || !token) return
    if (!currentQuestionId) return
    startQuestionSession(currentQuestionId)
  }, [currentNodeId, nodeAttempt.questionIndex])

  // ── Transition resolver ─────────────────────────────────────────────────

  function resolveTransition(condition: TransitionCondition): string | null {
    if (!currentNode) return null
    return currentNode.transitions.find(t => t.condition === condition)?.targetNodeId
      ?? currentNode.transitions.find(t => t.condition === 'always')?.targetNodeId
      ?? null
  }

  // ── Lesson complete ─────────────────────────────────────────────────────

  async function handleLessonComplete() {
    if (lessonDone || !token) return
    setLessonDone(true)
    setCompleting(true)
    try {
      const score = lessonTotalQuestions > 0
        ? Math.round((lessonCorrectCount / lessonTotalQuestions) * 100)
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

  // ── Node transition ─────────────────────────────────────────────────────

  function transitionTo(condition: TransitionCondition) {
    const targetId = resolveTransition(condition)
    resetNodeAttempt()
    if (!targetId) { handleLessonComplete(); return }
    const target = nodeMap[targetId]
    if (!target) { handleLessonComplete(); return }
    if (target.type === 'reward') {
      setCurrentNodeId(targetId)
      setTimeout(() => handleLessonComplete(), 1500)
      return
    }
    setCurrentNodeId(targetId)
  }

  function advanceAlways() { transitionTo('always') }

  // ── Evaluate node after all questions done ───────────────────────────────

  function evaluateNode(finalCorrectCount: number) {
    if (!currentNode || !graph) return
    const total = currentNode.questionIds?.length ?? 0
    const score = total > 0 ? (finalCorrectCount / total) * 100 : 0
    const passing = currentNode.passingScore ?? graph.settings.passingScore
    const retryLimit = currentNode.retryLimit ?? graph.settings.retryLimit ?? 0

    if (score >= passing) {
      transitionTo('passed')
    } else if (nodeAttemptRef.current.nodeRetries < retryLimit) {
      setNodeAttempt(prev => {
        const next = { ...BLANK_NODE_ATTEMPT, nodeRetries: prev.nodeRetries + 1 }
        nodeAttemptRef.current = next
        return next
      })
    } else {
      transitionTo('failed')
    }
  }

  // ── Session management ──────────────────────────────────────────────────

  const startQuestionSession = useCallback(async (questionId: number) => {
    if (!token) return
    setNodeAttempt(prev => ({ ...prev, loading: true, error: null }))
    try {
      const res = await attemptApi.startQuestion(questionId, token)
      const session = res.session
      sessionTokenRef.current = session.sessionToken
      setNodeAttempt(prev => {
        const next = {
          ...prev,
          currentSession: session,
          sessionToken: session.sessionToken,
          hintsUsed: session.hintsUsed,
          attempts: session.attempts,
          questionFinished: session.isSubmitted,
          loading: false,
          sessions: { ...prev.sessions, [questionId]: session },
        }
        nodeAttemptRef.current = next
        return next
      })
    } catch (err: unknown) {
      setNodeAttempt(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : 'Failed to start question',
      }))
    }
  }, [token])

  const submitAnswer = useCallback(async (answer: unknown) => {
    if (!token || nodeAttemptRef.current.questionFinished) return
    const sessionToken = sessionTokenRef.current
    if (!sessionToken) return
    setNodeAttempt(prev => ({ ...prev, loading: true, error: null }))
    try {
      const res = await attemptApi.submitAnswer(sessionToken, { answer }, token)
      const correct = res.correct
      if (correct) setLessonCorrectCount(prev => prev + 1)
      setNodeAttempt(prev => {
        const next = {
          ...prev,
          currentSession: res.session,
          attempts: res.session.attempts,
          feedback: correct ? 'correct' as const : 'wrong' as const,
          questionFinished: correct,
          nodeCorrectCount: prev.nodeCorrectCount + (correct ? 1 : 0),
          loading: false,
        }
        nodeAttemptRef.current = next
        return next
      })
      if (!correct) {
        setTimeout(() => setNodeAttempt(prev => ({ ...prev, feedback: null })), 1000)
      }
    } catch (err: unknown) {
      setNodeAttempt(prev => ({
        ...prev, loading: false,
        error: err instanceof Error ? err.message : 'Failed to submit answer',
      }))
    }
  }, [token])

  function advanceQuestion() {
    const { questionIndex, nodeCorrectCount } = nodeAttemptRef.current
    const nextIndex = questionIndex + 1
    if (nextIndex < nodeQuestionCount) {
      setNodeAttempt(prev => {
        const next = {
          ...prev,
          questionIndex: nextIndex,
          currentSession: null,
          sessionToken: null,
          feedback: null,
          hintsUsed: 0,
          attempts: 0,
          questionFinished: false,
        }
        nodeAttemptRef.current = next
        sessionTokenRef.current = null
        return next
      })
    } else {
      evaluateNode(nodeCorrectCount)
    }
  }

  const useHint = useCallback(async (hintIndex: number) => {
    if (!token || !sessionTokenRef.current || nodeAttemptRef.current.questionFinished) return
    try {
      const res = await attemptApi.useHint(sessionTokenRef.current, hintIndex, token)
      setNodeAttempt(prev => ({ ...prev, hintsUsed: res.hintsUsed }))
    } catch (err: unknown) {
      setNodeAttempt(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Failed to record hint' }))
    }
  }, [token])

  const giveUp = useCallback(async () => {
    if (!token || !sessionTokenRef.current || nodeAttemptRef.current.questionFinished) return
    setNodeAttempt(prev => ({ ...prev, loading: true }))
    try {
      const res = await attemptApi.finishSession(sessionTokenRef.current, token)
      setNodeAttempt(prev => {
        const next = { ...prev, currentSession: res.session, questionFinished: true, loading: false }
        nodeAttemptRef.current = next
        return next
      })
    } catch (err: unknown) {
      setNodeAttempt(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Failed to give up' }))
    }
  }, [token])

  function resetNodeAttempt() {
    sessionTokenRef.current = null
    nodeAttemptRef.current = BLANK_NODE_ATTEMPT
    setNodeAttempt(BLANK_NODE_ATTEMPT)
  }

  return {
    currentNode,
    currentNodeId,
    currentQuestion,
    isInteractiveNode,
    currentQuestionId,
    nodeQuestionCount,
    session:          nodeAttempt.currentSession,
    sessionToken:     nodeAttempt.sessionToken,
    feedback:         nodeAttempt.feedback,
    hintsUsed:        nodeAttempt.hintsUsed,
    attempts:         nodeAttempt.attempts,
    attemptLoading:   nodeAttempt.loading,
    attemptError:     nodeAttempt.error,
    questionFinished: nodeAttempt.questionFinished,
    questionIndex:    nodeAttempt.questionIndex,
    nodeCorrectCount: nodeAttempt.nodeCorrectCount,
    nodeRetries:      nodeAttempt.nodeRetries,
    submitAnswer,
    useHint,
    giveUp,
    advanceQuestion,
    advanceAlways,
    lessonCorrectCount,
    lessonTotalQuestions,
    lessonDone,
    reward,
    completing,
    completeError,
  }
}