/**
 * teacherDashboard.tsx
 *
 * Main dashboard for logged-in teachers.
 * Shows all subjects they own with lesson counts.
 *
 * Endpoints:
 *   GET /api/subjects → all subjects owned by the logged-in teacher
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject } from '../../types'

export default function TeacherDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<Subject[]>('/subjects', token)
        setSubjects(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Welcome, {user?.name || 'Teacher'}</h1>

      {/* Summary */}
      <p>Total Subjects: {subjects.length}</p>
      <p>Total Lessons: {subjects.reduce((sum, s) => sum + s.lessons.length, 0)}</p>

      {/* Quick actions */}
      <button onClick={() => navigate('/teacher/subjects/new')}>
        + New Subject
      </button>

      {/* Subjects list */}
      <h2>My Subjects</h2>
      {subjects.length === 0 ? (
        <p>No subjects yet. Create your first subject!</p>
      ) : (
        <div>
          {subjects.map(subject => (
            <div key={subject.id}>
              <h3>{subject.title}</h3>
              <p>Lessons: {subject.lessons.length}</p>
              <button onClick={() => navigate(`/teacher/subjects/${subject.id}`)}>
                Manage
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}