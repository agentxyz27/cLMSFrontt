import { useEffect, useState } from 'react'
import { teacherClassroomApi } from '../api/teacherClassroomApi'
import type { ClassRoom } from '../types'

export function useClassRooms(token: string | null) {
  const [data, setData] = useState<ClassRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await teacherClassroomApi.getAll(token)
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