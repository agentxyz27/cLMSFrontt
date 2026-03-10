/**
 * studentCourseDetail.tsx
 *
 * Shows all lessons inside a specific subject.
 * Marks lessons as completed or not based on student progress.
 *
 * Endpoints:
 *   GET /api/enrollment/all-subjects → find subject by id from URL
 *   GET /api/progress                → check which lessons are completed
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Progress } from '../../types'

export default function StudentCourseDetail() {
  const { token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjects, progressRes] = await Promise.all([
          api.get<Subject[]>('/enrollment/all-subjects', token),
          api.get<Progress[]>('/progress', token)
        ])

        // Find the subject matching the ID from the URL
        const found = subjects.find(s => s.id === Number(id))
        if (!found) {
          setError('Subject not found')
          return
        }

        setSubject(found)
        setProgress(progressRes)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load subject')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!subject) return <div>Subject not found</div>

  // Build a set of completed lesson IDs for quick lookup
  const completedLessonIds = new Set(
    progress.filter(p => p.completed).map(p => p.lessonId)
  )

  return (
    <div>
      <button onClick={() => navigate('/student/courses')}>← Back</button>

      <h1>{subject.title}</h1>
      <p>Teacher: {subject.teacher.name}</p>
      <p>Lessons: {subject.lessons.length}</p>

      {subject.lessons.length === 0 ? (
        <p>No lessons yet.</p>
      ) : (
        <div>
          {subject.lessons.map(lesson => (
            <div key={lesson.id}>
              <h3>{lesson.title}</h3>
              <span>
                {completedLessonIds.has(lesson.id) ? '✅ Completed' : '☐ Not completed'}
              </span>
              <button onClick={() => navigate(`/student/courses/${subject.id}/lessons/${lesson.id}`)}>
                {completedLessonIds.has(lesson.id) ? 'Review' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}