/**
 * teacherLessonNew.tsx
 *
 * Form to create a new lesson under a specific subject.
 * On success, redirects back to the subject detail page.
 *
 * Endpoints:
 *   POST /api/lessons → create a new lesson
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

export default function TeacherLessonNew() {
  const { token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/lessons', { title, content, subjectId: Number(id) }, token)
      navigate(`/teacher/subjects/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={() => navigate(`/teacher/subjects/${id}`)}>← Back</button>

      <h1>New Lesson</h1>

      <div>
        <input
          type="text"
          placeholder="Lesson title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Lesson content"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={8}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Lesson'}
        </button>
      </div>

      {error && <p>{error}</p>}
    </div>
  )
}