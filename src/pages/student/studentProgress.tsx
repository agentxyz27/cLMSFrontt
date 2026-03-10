/**
 * studentProgress.tsx
 *
 * Shows the student's full progress across all lessons and subjects.
 * Displays completed lessons, scores, and XP earned per lesson.
 *
 * Endpoints:
 *   GET /api/progress → all progress records with lesson and subject info
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Progress } from '../../types'

export default function StudentProgress() {
  const { token } = useAuth()

  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0)
  const completedCount = progress.filter(p => p.completed).length

  return (
    <div>
      <h1>My Progress</h1>

      {/* Summary */}
      <div>
        <p>Total XP: {totalXP}</p>
        <p>Lessons Completed: {completedCount}</p>
      </div>

      {/* Progress list */}
      {progress.length === 0 ? (
        <p>No progress yet. Start a lesson!</p>
      ) : (
        <div>
          {progress.map(p => (
            <div key={p.id}>
              <h3>{p.lesson.title}</h3>
              <p>Subject: {p.lesson.subject.title}</p>
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