import { useEffect, useState } from 'react'
import { studentClassroomApi } from '../../../shared/api/studentClassroomApi'
import { api } from '../../../shared/api/api'
import type { ClassRoom, LessonSummary, Progress } from '../../../shared/types'

export function useStudentClassRoom(id: string | undefined, token: string | null) {
  const [data, setData] = useState<ClassRoom | null>(null)
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !id) return
    setLoading(true)
    try {
      const [classRoomRes, lessonsRes, progressRes] = await Promise.all([
        studentClassroomApi.getById(id, token),
        studentClassroomApi.getLessons(id, token),
        api.get<Progress[]>('/progress', token)
      ])
      setData(classRoomRes)
      setLessons(lessonsRes)
      setCompletedLessonIds(new Set(progressRes.filter(p => p.completed).map(p => p.lessonId)))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load classroom')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [id, token])
  return { data, lessons, completedLessonIds, loading, error, refetch: fetch }
}