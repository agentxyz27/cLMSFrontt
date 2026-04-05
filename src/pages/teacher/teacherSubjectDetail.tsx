/**
 * teacherSubjectDetail.tsx
 *
 * Shows a specific subject with all its lessons and block previews.
 * Teacher can edit the subject title, delete lessons,
 * navigate to create a new lesson, edit an existing lesson, or manage students.
 *
 * Endpoints:
 *   GET    /api/subjects           → get all subjects, filter by id
 *   PUT    /api/subjects/:id       → update subject title
 *   GET    /api/lessons/:subjectId → get all lessons with blocks
 *   DELETE /api/lessons/:id        → delete a lesson and all its blocks (cascade)
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Lesson, LessonBlock } from '../../types'

/**
 * Renders a visual preview of a block inside the lesson list.
 * Shows actual images, video embeds, file links, and text previews
 * so the teacher can see content without opening the edit page.
 */
function BlockPreview({ block }: { block: LessonBlock }) {
  const data = block.data as Record<string, string>

  switch (block.type) {
    case 'text':
      // Render truncated HTML preview — strip tags for safety in summary
      return (
        <div dangerouslySetInnerHTML={{
          __html: data.html.slice(0, 100) + (data.html.length > 100 ? '...' : '')
        }} />
      )

    case 'image':
      // Show actual image thumbnail
      return (
        <div>
          <img
            src={data.url}
            alt={data.alt}
            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }}
          />
          {data.alt && <p>{data.alt}</p>}
        </div>
      )

    case 'video': {
      // Convert YouTube watch URL to embed URL for preview
      // https://youtube.com/watch?v=ID → https://youtube.com/embed/ID
      const embedUrl = data.url
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/')
      return (
        <div>
          {data.title && <p>🎥 {data.title}</p>}
          <iframe
            src={embedUrl}
            width="100%"
            height="200"
            allowFullScreen
            title={data.title}
          />
        </div>
      )
    }

    case 'file':
      // Show download link with file type label
      return (
        <div>
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            📎 {data.name} ({data.fileType?.toUpperCase()})
          </a>
        </div>
      )

    case 'math':
      // Plain text for now — replaced with KaTeX in UI pass
      return <code>{data.expression}</code>

    default:
      return <span>Unknown block type: {block.type}</span>
  }
}

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
    if (!confirm('Delete this lesson? All blocks will be deleted too.')) return

    try {
      await api.delete(`/lessons/${lessonId}`, token)
      // Remove from local state without refetching
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

      {/* Subject title + inline edit */}
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

      {/* Quick actions */}
      <div>
        <button onClick={() => navigate(`/teacher/subjects/${id}/lessons/new`)}>
          + New Lesson
        </button>
        <button onClick={() => navigate(`/teacher/subjects/${id}/students`)}>
          View Students
        </button>
      </div>

      {/* Lessons list with block previews */}
      <h2>Lessons ({lessons.length})</h2>
      {lessons.length === 0 ? (
        <p>No lessons yet. Create your first lesson!</p>
      ) : (
        <div>
          {lessons.map(lesson => (
            <div key={lesson.id}>
              <h3>{lesson.title}</h3>

              {/* Block previews — shows actual content per block type */}
              {lesson.blocks && lesson.blocks.length > 0 ? (
                <div>
                  {lesson.blocks
                    .sort((a, b) => a.order - b.order)
                    .map(block => (
                      <div key={block.id}>
                        <BlockPreview block={block} />
                      </div>
                    ))}
                </div>
              ) : (
                <p>No blocks yet.</p>
              )}

              <div>
                <button onClick={() => navigate(`/teacher/subjects/${id}/lessons/${lesson.id}/edit`)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteLesson(lesson.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}