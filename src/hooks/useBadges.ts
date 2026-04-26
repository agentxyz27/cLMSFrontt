import { useEffect, useState } from 'react'
import { progressApi } from '../api/progressApi'
import type { StudentBadge } from '../types'

export function useBadges(token: string | null) {
  const [data, setData] = useState<StudentBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await progressApi.getMyBadges(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load badges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}