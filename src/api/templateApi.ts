import { api } from './api'
import type { Template, LessonGraph } from '../types'

export const templateApi = {
  getPublic: (token: string) =>
    api.get<Template[]>('/templates', token),

  getMine: (token: string) =>
    api.get<Template[]>('/templates/mine', token),

  getById: (id: number, token: string) =>
    api.get<Template>(`/templates/${id}`, token),

  create: (data: { title: string; contentJson: LessonGraph; isPublic: boolean }, token: string) =>
    api.post<{ template: Template }>('/templates', data, token),

  update: (id: number, data: { title?: string; contentJson?: LessonGraph; isPublic?: boolean }, token: string) =>
    api.put<{ template: Template }>(`/templates/${id}`, data, token),

  publish: (id: number, isPublic: boolean, token: string) =>
    api.put<{ template: Template }>(`/templates/${id}/publish`, { isPublic }, token),

  delete: (id: number, token: string) =>
    api.delete(`/templates/${id}`, token),

  use: (id: number, data: { classRoomId: number; title: string }, token: string) =>
    api.post<{ lesson: { id: number; title: string } }>(`/templates/${id}/use`, data, token),
}