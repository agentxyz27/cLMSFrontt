import { api } from './api'
import type { ClassRoom, LessonSummary } from '../types'

export const studentClassroomApi = {
  getAll: (token: string) =>
    api.get<ClassRoom[]>('/student/classrooms', token),

  getById: (id: string, token: string) =>
    api.get<ClassRoom>(`/student/classrooms/${id}`, token),

  getLessons: (id: string, token: string) =>
    api.get<LessonSummary[]>(`/student/classrooms/${id}/lessons`, token),
}