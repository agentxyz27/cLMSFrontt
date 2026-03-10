/**
 * teacherSubjectDetail.tsx
 *
 * Shows a specific subject with all its lessons.
 * Teacher can edit the subject title, delete lessons,
 * and navigate to create a new lesson or manage students.
 *
 * Endpoints:
 *   GET    /api/subjects          → get all subjects, filter by id
 *   PUT    /api/subjects/:id      → update subject title
 *   GET    /api/lessons/:subjectId → get all lessons under subject
 *   DELETE /api/lessons/:id       → delete a lesson
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Lesson } from '../../types'

export default function TeacherSubjectDetail() {
  const { token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [editing, setEditing] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjectsRes, lessonsRes] = await Promise.all([
          api.get<Subject[]>('/subjects', token),
          api.get<Lesson[]>(`/lessons/${id}`, token)
        ])

        const found = subjectsRes.find(s => s.id === Number(id))
        if (!found) {
          setError('Subject not found')
          return
        }

        setSubject(found)
        setNewTitle(found.title)
        setLessons(lessonsRes)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load subject')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id])

  async function handleUpdateTitle() {
    if (!newTitle.trim()) return

    try {
      await api.put(`/subjects/${id}`, { title: newTitle }, token)
      setSubject(prev => prev ? { ...prev, title: newTitle } : prev)
      setEditing(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update subject')
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!confirm('Delete this lesson?')) return

    try {
      await api.delete(`/lessons/${lessonId}`, token)
      setLessons(prev => prev.filter(l => l.id !== lessonId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!subject) return <div>Subject not found</div>

  return (
    <div>
      <button onClick={() => navigate('/teacher/subjects')}>← Back</button>

      {/* Subject title + edit */}
      {editing ? (
        <div>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button onClick={handleUpdateTitle}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h1>{subject.title}</h1>
          <button onClick={() => setEditing(true)}>Edit Title</button>
        </div>
      )}

      {/* Actions */}
      <div>
        <button onClick={() => navigate(`/teacher/subjects/${id}/lessons/new`)}>
          + New Lesson
        </button>
        <button onClick={() => navigate(`/teacher/subjects/${id}/students`)}>
          View Students
        </button>
      </div>

      {/* Lessons list */}
      <h2>Lessons</h2>
      {lessons.length === 0 ? (
        <p>No lessons yet. Create your first lesson!</p>
      ) : (
        <div>
          {lessons.map(lesson => (
            <div key={lesson.id}>
              <h3>{lesson.title}</h3>
              <p>{lesson.content}</p>
              <button onClick={() => handleDeleteLesson(lesson.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}