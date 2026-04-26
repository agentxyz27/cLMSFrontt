import { useEffect, useState } from 'react'
import { lessonApi } from '../api/lessonApi'
import type { Lesson } from '../types'

export function useLesson(id: string | undefined, token: string | null) {
  const [data, setData] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !id) return
    setLoading(true)
    try {
      const res = await lessonApi.getById(id, token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [id, token])

  return { data, loading, error, refetch: fetch }
}