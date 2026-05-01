import { useEffect, useState } from 'react'
import { sectionApi } from '../../../shared/api/sectionApi'
import type { GradeWithSections } from '../../../shared/types'


export function useSections(token?: string | null) {
  const [data, setData] = useState<GradeWithSections[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await sectionApi.getAll(token)
      setData(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [token])

  return { data, loading, error, refetch: fetch }
}