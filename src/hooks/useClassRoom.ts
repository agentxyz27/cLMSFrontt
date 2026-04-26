import { useEffect, useState } from 'react'
import { teacherClassroomApi } from '../api/teacherClassroomApi'
import type { ClassRoom } from '../types'

export function useClassRoom(id: string | undefined, token: string | null) {
  const [data, setData] = useState<ClassRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !id) return
    setLoading(true)
    try {
      const res = await teacherClassroomApi.getById(id, token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load classroom')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [id, token])

  return { data, loading, error, refetch: fetch }
}