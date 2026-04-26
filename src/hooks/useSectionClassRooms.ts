import { useEffect, useState } from 'react'
import { classroomApi } from '../api/classroomApi'
import type { ClassRoom } from '../types'

export function useSectionClassRooms(token: string | null) {
  const [data, setData] = useState<ClassRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await classroomApi.getMySection(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}