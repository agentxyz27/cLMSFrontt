/**
 * teacherLessonEdit.tsx
 *
 * Loads an existing lesson by ID, then opens the canvas editor
 * pre-populated with the lesson's contentJson.
 *
 * If contentJson is null (lesson was created but never saved),
 * the editor opens with a blank canvas.
 *
 * Endpoints:
 *   GET /api/lessons/lesson/:id  → load full lesson with contentJson
 *   PUT /api/lessons/:id         → save canvas JSON (handled inside CanvasEditor)
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import CanvasEditor from '../../components/editor/canvasEditor'
import type { Lesson } from '../../types'

export default function TeacherLessonEdit() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()  // id = classRoomId, lessonId = lesson id
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLesson() {
      try {
        const data = await api.get<Lesson>(`/lessons/lesson/${lessonId}`, token)
        setLesson(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [token, lessonId])

  if (loading) return <div>Loading lesson...</div>
  if (error) return <div>Error: {error}</div>
  if (!lesson) return <div>Lesson not found</div>

  return (
    <CanvasEditor
      lessonId={lesson.id}
      initial={lesson.contentJson}
      token={token}
      onDone={() => navigate(`/teacher/classrooms/${id}`)}
    />
  )
}