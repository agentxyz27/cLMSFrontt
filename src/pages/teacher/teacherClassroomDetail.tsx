import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useClassRoom } from '../../hooks/useClassRoom'
import { lessonApi } from '../../api/lessonApi'
import { templateApi } from '../../api/templateApi'
import CanvasPreview from '../../components/editor/canvasPreview'
import type { LessonSummary } from '../../types'
import { extractIdFromSlug, classRoomSlug } from '../../utils/slugify'

export default function TeacherClassroomDetail() {
  const { token } = useAuth()
  const { id: rawId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const { data: classRoom, loading, error, refetch } = useClassRoom(id, token)

  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [publishingId, setPublishingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const slug = classRoom
    ? classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)
    : id

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson? This cannot be undone.')) return
    if (!token) return
    try {
      await lessonApi.delete(lessonId, token)
      await refetch()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete lesson')
    }
  }

  const startRename = (lesson: LessonSummary) => {
    setRenamingId(lesson.id)
    setRenameValue(lesson.title)
  }

  const handleRename = async (lessonId: number) => {
    if (!renameValue.trim() || !token) return
    try {
      await lessonApi.update(lessonId, { title: renameValue }, token)
      await refetch()
      setRenamingId(null)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to rename lesson')
    }
  }

  const handlePublish = async (lesson: LessonSummary) => {
  if (!lesson.contentJson?.nodes?.length) {
    alert('This lesson has no content to publish.')
    return
  }

  if (!confirm(`Publish "${lesson.title}" to the template library?`)) return
  if (!token) return

  setPublishingId(lesson.id)

  try {
    // 🔥 IMPORTANT FIX: publish FULL lesson graph, not first node
    await templateApi.create(
      {
        title: lesson.title,
        contentJson: lesson.contentJson, // <-- FULL GRAPH
        isPublic: true
      },
      token
    )

    alert(`"${lesson.title}" has been published to the template library.`)
  } catch (err: unknown) {
    setActionError(
      err instanceof Error ? err.message : 'Failed to publish lesson'
    )
  } finally {
    setPublishingId(null)
  }
}

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!classRoom) return <div>Classroom not found</div>

  const lessons = classRoom.lessons ?? []

  return (
    <div>
      <button onClick={() => navigate('/teacher/dashboard')}>← Back</button>

      <h1>{classRoom.subject.name}</h1>
      <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>

      {actionError && <p style={{ color: 'red' }}>{actionError}</p>}

      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate(`/teacher/classrooms/${slug}/lessons/new`)}>
          + New Lesson
        </button>
      </div>

      <h2>Lessons ({lessons.length})</h2>

      {lessons.length === 0 ? (
        <p>No lessons yet. Create your first lesson!</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {lessons.map(lesson => {
            const firstNodeCanvas = lesson.contentJson?.nodes?.[0]?.contentJson
            return (
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
                <div style={{ pointerEvents: 'none' }}>
                  {firstNodeCanvas ? (
                    <CanvasPreview contentJson={firstNodeCanvas} previewWidth={300} />
                  ) : (
                    <div style={{
                      width: 300, height: 169, background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <p style={{ color: '#999' }}>No content yet</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: '8px 12px' }}>
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
                    <button onClick={() => navigate(`/teacher/classrooms/${slug}/lessons/${lesson.id}/edit`)}>
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
            )
          })}
        </div>
      )}
    </div>
  )
}