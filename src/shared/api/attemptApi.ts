import { api } from './api'
import type {
  StartSessionResponse,
  SubmitAnswerResponse,
  UseHintResponse,
  FinishSessionResponse,
  QuestionAttemptSession,
} from '../types'

export const attemptApi = {
  // Student opens a question — creates or resumes a session
  startQuestion: (questionId: number, token: string) =>
    api.post<StartSessionResponse>(`/attempts/start/${questionId}`, {}, token),

  // Student submits an answer
  // Frontend validates correct — backend trusts the flag and records it
  submitAnswer: (
    sessionToken: string,
    data: { answer: unknown; correct: boolean },
    token: string
  ) => api.post<SubmitAnswerResponse>(`/attempts/submit/${sessionToken}`, data, token),

  // Student opens a hint
  useHint: (sessionToken: string, hintIndex: number, token: string) =>
    api.post<UseHintResponse>(`/attempts/hint/${sessionToken}`, { hintIndex }, token),

  // Student gives up — finalizes session with correct = false
  finishSession: (sessionToken: string, token: string) =>
    api.post<FinishSessionResponse>(`/attempts/finish/${sessionToken}`, {}, token),

  // Get current session state — used to resume interrupted sessions
  getSession: (sessionToken: string, token: string) =>
    api.get<QuestionAttemptSession>(`/attempts/session/${sessionToken}`, token),
}