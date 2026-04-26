import { useEffect, useState } from 'react'
import { progressApi } from '../api/progressApi'

interface LeaderboardEntry {
  id: number
  name: string
  xp: number
  level: number
}

export function useLeaderboard(token: string | null) {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await progressApi.getLeaderboard(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}