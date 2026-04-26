/**
 * teacherLessonEdit.tsx
 *
 * Loads an existing lesson by ID, then opens the node-based canvas editor
 * pre-populated with the lesson's contentJson (LessonContent).
 *
 * If contentJson is null (lesson was created but never saved),
 * the editor opens with a blank lesson (one explanation node).
 *
 * Endpoints:
 *   GET /api/lessons/lesson/:id  → load full lesson with contentJson
 *   PUT /api/lessons/:id         → save LessonContent (handled inside CanvasEditor)
 */
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useLesson } from '../../hooks/useLesson'
import CanvasEditor from '../../components/editor/canvasEditor'
import { extractIdFromSlug } from '../../utils/slugify'

export default function TeacherLessonEdit() {
  const { token } = useAuth()
  const { id: rawId, lessonId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const { data: lesson, loading, error } = useLesson(lessonId, token)

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