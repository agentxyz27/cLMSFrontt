import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Progress } from '../../types'

export default function StudentProgress() {
  const { token, loading: authLoading } = useAuth()

  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !token) return

    async function fetchData() {
      try {
        const res = await api.get<Progress[]>('/progress', token)
        setProgress(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load progress')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, authLoading])

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0)
  const completedCount = progress.filter(p => p.completed).length

  return (
    <div>
      <h1>My Progress</h1>
      <div>
        <p>Total XP: {totalXP}</p>
        <p>Lessons Completed: {completedCount}</p>
      </div>
      {progress.length === 0 ? (
        <p>No progress yet. Start a lesson!</p>
      ) : (
        <div>
          {progress.map(p => (
            <div key={p.id}>
              <h3>{p.lesson.title}</h3>
              <p>Subject: {p.lesson.classRoom.subject.name}</p>
              <p>Status: {p.completed ? '✅ Completed' : '☐ Not completed'}</p>
              <p>XP Earned: {p.xpEarned}</p>
              {p.score !== null && <p>Score: {p.score}%</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}