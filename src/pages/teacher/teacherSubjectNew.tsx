/**
 * teacherSubjectNew.tsx
 *
 * Form to create a new subject.
 * On success, redirects to /teacher/subjects.
 *
 * Endpoints:
 *   POST /api/subjects → create a new subject
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

export default function TeacherSubjectNew() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/subjects', { title }, token)
      navigate('/teacher/subjects')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={() => navigate('/teacher/subjects')}>← Back</button>

      <h1>New Subject</h1>

      <div>
        <input
          type="text"
          placeholder="Subject title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Subject'}
        </button>
      </div>

      {error && <p>{error}</p>}
    </div>
  )
}