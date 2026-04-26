import { useEffect, useState } from 'react'
import { progressApi } from '../api/progressApi'
import type { Progress } from '../types'

export function useProgress(token: string | null) {
  const [data, setData] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await progressApi.getMyProgress(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}