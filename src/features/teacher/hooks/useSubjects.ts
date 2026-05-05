import { useEffect, useState } from 'react'
import { subjectApi } from '@/shared/api/subjectApi'
import type { Subject } from '@/shared/types'

export function useSubjects(token: string | null) {
  const [data, setData] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setLoading(true)

    subjectApi.getAll(token)
      .then(setData)
      .finally(() => setLoading(false))
  }, [token])

  return { data, loading }
}