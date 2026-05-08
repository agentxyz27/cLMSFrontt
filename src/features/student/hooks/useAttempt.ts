import { useState, useCallback } from 'react'
import { attemptApi } from '@/shared/api/attemptApi'
import type { QuestionAttemptSession } from '@/shared/types'

/**
 * useAttempt
 *
 * Manages the attempt pipeline for a single question.
 * Plugs into useLessonRunner alongside graph navigation.
 *
 * Lifecycle per question:
 *   1. startQuestion()   → creates or resumes session
 *   2. useHint()         → fires HINT_OPENED event (optional)
 *   3. submitAnswer()    → fires ATTEMPT_SUBMITTED
 *                        → if correct → fires SESSION_FINISHED automatically
 *   4. giveUp()          → fires SESSION_FINISHED with correct = false
 *
 * Reset between questions:
 *   Call reset() when moving to the next question.
 */

interface UseAttemptOptions {
  token: string | null
  onCorrect?: () => void    // called when student gets it right
  onFinished?: () => void   // called when session is finalized (correct or give up)
}

export function useAttempt({ token, onCorrect, onFinished }: UseAttemptOptions) {
  const [session, setSession]         = useState<QuestionAttemptSession | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null)
  const [hintsUsed, setHintsUsed]     = useState(0)
  const [attempts, setAttempts]       = useState(0)
  const [finished, setFinished]       = useState(false)

  // ── Start or resume a session for a question ─────────────────────────────
  const startQuestion = useCallback(async (questionId: number) => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await attemptApi.startQuestion(questionId, token)
      setSession(res.session)
      setSessionToken(res.session.sessionToken)
      setHintsUsed(res.session.hintsUsed)
      setAttempts(res.session.attempts)
      // If resuming a finished session, mark as finished
      if (res.session.isSubmitted) setFinished(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start question')
    } finally {
      setLoading(false)
    }
  }, [token])

  // ── Submit an answer ──────────────────────────────────────────────────────
  // correct is determined by the frontend interaction component
  // Backend trusts this flag and records it
  const submitAnswer = useCallback(async (answer: unknown, correct: boolean) => {
    if (!token || !sessionToken || finished) return
    setLoading(true)
    setError(null)
    try {
      const res = await attemptApi.submitAnswer(sessionToken, { answer, correct }, token)
      setSession(res.session)
      setAttempts(res.session.attempts)
      setFeedback(correct ? 'correct' : 'wrong')

      if (correct) {
        setFinished(true)
        onCorrect?.()
        setTimeout(() => {
          setFeedback(null)
          onFinished?.()
        }, 1000)
      } else {
        setTimeout(() => setFeedback(null), 1000)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }, [token, sessionToken, finished, onCorrect, onFinished])

  // ── Open a hint ───────────────────────────────────────────────────────────
  const useHint = useCallback(async (hintIndex: number) => {
    if (!token || !sessionToken || finished) return
    setError(null)
    try {
      const res = await attemptApi.useHint(sessionToken, hintIndex, token)
      setHintsUsed(res.hintsUsed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record hint')
    }
  }, [token, sessionToken, finished])

  // ── Give up — finalize session with correct = false ───────────────────────
  const giveUp = useCallback(async () => {
    if (!token || !sessionToken || finished) return
    setLoading(true)
    setError(null)
    try {
      const res = await attemptApi.finishSession(sessionToken, token)
      setSession(res.session)
      setFinished(true)
      onFinished?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to finish session')
    } finally {
      setLoading(false)
    }
  }, [token, sessionToken, finished, onFinished])

  // ── Reset between questions ───────────────────────────────────────────────
  const reset = useCallback(() => {
    setSession(null)
    setSessionToken(null)
    setLoading(false)
    setError(null)
    setFeedback(null)
    setHintsUsed(0)
    setAttempts(0)
    setFinished(false)
  }, [])

  return {
    // State
    session,
    sessionToken,
    loading,
    error,
    feedback,
    hintsUsed,
    attempts,
    finished,
    // Actions
    startQuestion,
    submitAnswer,
    useHint,
    giveUp,
    reset
  }
}