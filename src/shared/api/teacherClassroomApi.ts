import { api } from './api'
import type { ClassRoom } from '../types'

export const teacherClassroomApi = {
  getAll: (token: string) =>
    api.get<ClassRoom[]>('/teacher/classrooms', token),

  getById: (id: number, token: string) =>
    api.get<ClassRoom>(`/teacher/classrooms/${id}`, token),

  create: (data: { subjectId: number; sectionId: number }, token: string) =>
    api.post<{ classRoom: ClassRoom }>('/teacher/classrooms', data, token),
}