import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import CanvasPreview from '../../components/editor/canvasPreview'
import type { Section, LessonSummary, Subject } from '../../types'

interface ClassRoom {
  id: number
  teacherId: number
  subjectId: number
  sectionId: number
  createdAt: string
  subject: Subject
  section: Section
  lessons: LessonSummary[]
}

export default function TeacherClassroomDetail() {
  const { token, loading: authLoading } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Rename state — tracks which lesson is being renamed
  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Publish state — tracks which lesson is being published
  const [publishingId, setPublishingId] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading || !token) return
    fetchClassRoom()
  }, [token, authLoading, id])

  const fetchClassRoom = async () => {
    try {
      const res = await api.get<ClassRoom>(`/classrooms/${id}`, token)
      setClassRoom(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load classroom')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return
    try {
      await api.delete(`/lessons/${lessonId}`, token)
      setClassRoom(prev =>
        prev ? { ...prev, lessons: prev.lessons.filter(l => l.id !== lessonId) } : prev
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson')
    }
  }

  const startRename = (lesson: LessonSummary) => {
    setRenamingId(lesson.id)
    setRenameValue(lesson.title)
  }

  const handleRename = async (lessonId: number) => {
    if (!renameValue.trim()) return
    try {
      await api.put(`/lessons/${lessonId}`, { title: renameValue }, token)
      setClassRoom(prev =>
        prev
          ? {
              ...prev,
              lessons: prev.lessons.map(l =>
                l.id === lessonId ? { ...l, title: renameValue } : l
              )
            }
          : prev
      )
      setRenamingId(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to rename lesson')
    }
  }

  const handlePublish = async (lesson: LessonSummary) => {
    if (!lesson.contentJson) {
      alert('This lesson has no content to publish.')
      return
    }
    if (!confirm(`Publish "${lesson.title}" to the template library?`)) return
    setPublishingId(lesson.id)
    try {
      await api.post('/templates', {
        title: lesson.title,
        contentJson: lesson.contentJson,
        isPublic: true
      }, token)
      alert(`"${lesson.title}" has been published to the template library.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish lesson')
    } finally {
      setPublishingId(null)
    }
  }

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!classRoom) return <div>Classroom not found</div>

  return (
    <div>
      <button onClick={() => navigate('/teacher/dashboard')}>← Back</button>

      <h1>{classRoom.subject.name}</h1>
      <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(`/teacher/classrooms/${id}/lessons/new`)}>
          + New Lesson
        </button>
      </div>

      <h2>Lessons ({classRoom.lessons.length})</h2>

      {classRoom.lessons.length === 0 ? (
        <p>No lessons yet. Create your first lesson!</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {classRoom.lessons.map(lesson => (
            <div
              key={lesson.id}
              style={{
                border: '1px solid #eee',
                borderRadius: 8,
                overflow: 'hidden',
                width: 300,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
              }}
            >
              {/* Thumbnail */}
              <div style={{ pointerEvents: 'none' }}>
                {lesson.contentJson ? (
                  <CanvasPreview contentJson={lesson.contentJson} previewWidth={300} />
                ) : (
                  <div style={{
                    width: 300,
                    height: 169,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <p style={{ color: '#999' }}>No content yet</p>
                  </div>
                )}
              </div>

              {/* Card info */}
              <div style={{ padding: '8px 12px' }}>

                {/* Inline rename */}
                {renamingId === lesson.id ? (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(lesson.id)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      autoFocus
                      style={{ flex: 1, fontSize: 14 }}
                    />
                    <button onClick={() => handleRename(lesson.id)}>Save</button>
                    <button onClick={() => setRenamingId(null)}>✕</button>
                  </div>
                ) : (
                  <h3
                    style={{ margin: 0, cursor: 'pointer' }}
                    onClick={() => startRename(lesson)}
                    title="Click to rename"
                  >
                    {lesson.title} ✏️
                  </h3>
                )}

                <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
                  Last updated: {new Date(lesson.updatedAt).toLocaleString()}
                </p>

                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/teacher/classrooms/${id}/lessons/${lesson.id}/edit`)}>
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(lesson)}
                    disabled={publishingId === lesson.id}
                  >
                    {publishingId === lesson.id ? 'Publishing...' : 'Publish'}
                  </button>
                  <button onClick={() => handleDeleteLesson(lesson.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}