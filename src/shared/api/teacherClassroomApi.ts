import { api } from './api'
import type { ClassRoom } from '../types'

export const teacherClassroomApi = {
  getAll: (token: string) =>
    api.get<ClassRoom[]>('/teacher/classrooms', token),

  getById: (id: string, token: string) =>
    api.get<ClassRoom>(`/teacher/classrooms/${id}`, token),

  create: (data: { subjectId: string; sectionId: string }, token: string) =>
    api.post<{ classRoom: ClassRoom }>('/teacher/classrooms', data, token),
}