import { api } from './api'
import type { Question, QuestionContent, ReorderPayload } from '../types'

export const questionApi = {
  // Get all questions for a lesson — ordered by sequence
  getByLesson: (lessonId: number, token: string) =>
    api.get<Question[]>(`/questions/lesson/${lessonId}`, token),

  // Get a single question
  getById: (id: number, token: string) =>
    api.get<Question>(`/questions/${id}`, token),

  // Create a new question
  create: (
    data: {
      lessonId: number
      topicId: number
      templateType: string
      contentJson: QuestionContent
    },
    token: string
  ) => api.post<{ message: string; question: Question }>('/questions', data, token),

  // Partially update a question
  update: (
    id: number,
    data: {
      templateType?: string
      topicId?: number
      contentJson?: QuestionContent
    },
    token: string
  ) => api.patch<{ message: string; question: Question }>(`/questions/${id}`, data, token),

  // Delete a question
  delete: (id: number, token: string) =>
    api.delete<{ message: string }>(`/questions/${id}`, token),

  // Reorder questions within a lesson
  reorder: (lessonId: number, payload: ReorderPayload, token: string) =>
    api.patch<{ message: string }>(`/questions/lesson/${lessonId}/reorder`, payload, token),
}