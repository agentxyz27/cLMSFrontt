/**
 * studentDashboard.tsx
 *
 * Main dashboard for logged-in students.
 * Shows enrolled subjects, XP, level, and progress summary.
 *
 * Endpoints:
 *   GET /api/enrollment/my-subjects → enrolled subjects
 *   GET /api/progress               → completed lessons
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Progress } from '../../types'

export default function StudentDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, progressRes] = await Promise.all([
          api.get<Subject[]>('/enrollment/my-subjects', token),
          api.get<Progress[]>('/progress', token)
        ])
        setSubjects(subjectsRes)
        setProgress(progressRes)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const completedCount = progress.filter(p => p.completed).length
  const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0)

  return (
    <div>
      <h1>Welcome, {user?.name || 'Student'}</h1>

      {/* XP Summary */}
      <div>
        <p>Total XP: {totalXP}</p>
        <p>Lessons Completed: {completedCount}</p>
      </div>

      {/* Enrolled Subjects */}
      <h2>My Subjects</h2>
      {subjects.length === 0 ? (
        <p>You are not enrolled in any subjects yet.</p>
      ) : (
        <div>
          {subjects.map(subject => (
            <div key={subject.id}>
              <h3>{subject.title}</h3>
              <p>Teacher: {subject.teacher.name}</p>
              <p>Lessons: {subject.lessons.length}</p>
              <button onClick={() => navigate(`/student/courses/${subject.id}`)}>
                View Subject
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}