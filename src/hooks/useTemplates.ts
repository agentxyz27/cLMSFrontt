import { useEffect, useState } from 'react'
import { templateApi } from '../api/templateApi'
import type { Template } from '../types'

export function useTemplates(token: string | null) {
  const [data, setData] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await templateApi.getPublic(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}