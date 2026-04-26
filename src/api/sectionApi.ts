import { api } from './api'

interface GradeWithSections {
  id: number
  level: number
  sections: { id: number; name: string }[]
}

export const sectionApi = {
  getAll: (token?: string | null) =>
    api.get<GradeWithSections[]>('/sections', token),
}