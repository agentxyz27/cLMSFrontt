/**
 * teacherSubjects.tsx
 *
 * Shows all subjects owned by the logged-in teacher.
 * Teacher can navigate to create a new subject or manage an existing one.
 * Teacher can also delete a subject from this page.
 *
 * Endpoints:
 *   GET    /api/subjects     → all subjects owned by the logged-in teacher
 *   DELETE /api/subjects/:id → delete a subject by ID
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject } from '../../types'

export default function TeacherSubjects() {
  const { token } = useAuth()
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

  async function handleDelete(id: number) {
    if (!confirm('Delete this subject? This will also delete all its lessons.')) return

    try {
      await api.delete(`/subjects/${id}`, token)
      // Remove from local state without refetching
      setSubjects(prev => prev.filter(s => s.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>My Subjects</h1>

      <button onClick={() => navigate('/teacher/subjects/new')}>
        + New Subject
      </button>

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
              <button onClick={() => handleDelete(subject.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}