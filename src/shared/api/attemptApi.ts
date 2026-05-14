import { api } from './api'
import type {
  StartSessionResponse,
  SubmitAnswerResponse,
  UseHintResponse,
  FinishSessionResponse,
  QuestionAttemptSession,
} from '../types'

export const attemptApi = {
  startQuestion: (questionId: number, token: string) =>
    api.post<StartSessionResponse>(`/attempts/start/${questionId}`, {}, token),

  // Answer validated server-side — never send correct flag from client
  submitAnswer: (
    sessionToken: string,
    data: { answer: unknown },
    token: string
  ) => api.post<SubmitAnswerResponse>(`/attempts/submit/${sessionToken}`, data, token),

  useHint: (sessionToken: string, hintIndex: number, token: string) =>
    api.post<UseHintResponse>(`/attempts/hint/${sessionToken}`, { hintIndex }, token),

  finishSession: (sessionToken: string, token: string) =>
    api.post<FinishSessionResponse>(`/attempts/finish/${sessionToken}`, {}, token),

  getSession: (sessionToken: string, token: string) =>
    api.get<QuestionAttemptSession>(`/attempts/session/${sessionToken}`, token),
}