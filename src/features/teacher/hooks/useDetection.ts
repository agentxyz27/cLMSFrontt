import { useEffect, useState } from 'react'
import { detectionApi } from '@/shared/api/detectionApi'
import type { DetectionSummary } from '@/shared/types'

export function useDetection(
  classRoomId: number | undefined,
  lessonId: number | undefined,
  token: string | null
) {
  const [data, setData]       = useState<DetectionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !classRoomId || !lessonId) return
    setLoading(true)
    try {
      const res = await detectionApi.getClassSummary(classRoomId, lessonId, token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load detection data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [classRoomId, lessonId, token])

  return { data, loading, error, refetch: fetch }
}