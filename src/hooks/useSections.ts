import { useEffect, useState } from 'react'
import { sectionApi } from '../api/sectionApi'

interface GradeWithSections {
  id: number
  level: number
  sections: { id: number; name: string }[]
}

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