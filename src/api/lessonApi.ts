import { api } from './api'
import type { Lesson, LessonSummary, LessonGraph } from '../types'

export const lessonApi = {
  getByClassRoom: (classRoomId: string, token: string) =>
    api.get<LessonSummary[]>(`/lessons/${classRoomId}`, token),

  getById: (id: string, token: string) =>
    api.get<Lesson>(`/lessons/lesson/${id}`, token),

  create: (data: { title: string; classRoomId: number }, token: string) =>
    api.post<{ lesson: Lesson }>('/lessons', data, token),

  update: (id: number, data: { title?: string; contentJson?: LessonGraph }, token: string) =>
    api.put<{ lesson: Lesson }>(`/lessons/${id}`, data, token),

  delete: (id: number, token: string) =>
    api.delete(`/lessons/${id}`, token),
}