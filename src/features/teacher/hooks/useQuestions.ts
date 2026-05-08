import { useEffect, useState, useCallback } from 'react'
import { questionApi } from '@/shared/api/questionApi'
import type { Question, ReorderPayload } from '@/shared/types'

export function useQuestions(lessonId: number | undefined, token: string | null) {
  const [data, setData]       = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !lessonId) return
    setLoading(true)
    try {
      const res = await questionApi.getByLesson(lessonId, token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [lessonId, token])

  const create = useCallback(async (payload: {
    lessonId: number
    topicId: number
    templateType: string
    contentJson: Record<string, unknown>
    order?: number
  }) => {
    if (!token) return
    const res = await questionApi.create(payload, token)
    setData(prev => [...prev, res.question])
    return res.question
  }, [token])

  const update = useCallback(async (id: number, payload: {
    templateType?: string
    topicId?: number
    contentJson?: Record<string, unknown>
    order?: number
  }) => {
    if (!token) return
    const res = await questionApi.update(id, payload, token)
    setData(prev => prev.map(q => q.id === id ? res.question : q))
    return res.question
  }, [token])

  const remove = useCallback(async (id: number) => {
    if (!token) return
    await questionApi.delete(id, token)
    setData(prev => prev.filter(q => q.id !== id))
  }, [token])

  const reorder = useCallback(async (payload: ReorderPayload) => {
    if (!token || !lessonId) return
    await questionApi.reorder(lessonId, payload, token)
    await fetch()
  }, [token, lessonId])

  return { data, loading, error, refetch: fetch, create, update, remove, reorder }
}