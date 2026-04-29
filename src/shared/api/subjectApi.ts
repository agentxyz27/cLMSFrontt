import { api } from './api'
import type { Subject } from '../types'

export const subjectApi = {
  getAll: (token: string) =>
    api.get<Subject[]>('/subjects', token),

  getUnlocked: async (token: string) => {
    const subjects = await api.get<Subject[]>('/subjects', token)
    return subjects.filter(s => !s.isLocked)
  }
}