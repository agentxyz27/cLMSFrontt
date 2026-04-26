import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { studentClassroomApi } from '../../api/studentClassroomApi'
import { api } from '../../api/api'
import CanvasPreview from '../../components/editor/canvasPreview'
import type { ClassRoom, Progress, LessonSummary } from '../../types'

export default function StudentClassroomDetail() {
  const { token, loading: authLoading } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [classRoom, setClassRoom] = useState<ClassRoom | null>(null)
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // hard guards — no undefined allowed into reality
    if (authLoading || !token || !id) return

    const safeId = id
    const safeToken = token

    async function fetchData(classroomId: string, authToken: string) {
      try {
        const [classRoomRes, lessonsRes, progressRes] = await Promise.all([
          studentClassroomApi.getById(classroomId, authToken),
          studentClassroomApi.getLessons(classroomId, authToken),
          api.get<Progress[]>('/progress', authToken)
        ])

        setClassRoom(classRoomRes)
        setLessons(lessonsRes)
        setProgress(progressRes)
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to load classroom'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData(safeId, safeToken)
  }, [id, token, authLoading])

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!classRoom) return <div>Classroom not found</div>

  const completedLessonIds = new Set(
    progress.filter(p => p.completed).map(p => p.lessonId)
  )

  return (
    <div>
      <button onClick={() => navigate('/student/dashboard')}>
        ← Back
      </button>

      <h1>{classRoom.subject.name}</h1>
      <p>
        Grade {classRoom.section.grade.level} — {classRoom.section.name}
      </p>
      <p>Teacher: {classRoom.teacher?.name ?? 'Unknown'}</p>
      <p>Lessons: {lessons.length}</p>

      {lessons.length === 0 ? (
        <p>No lessons yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {lessons.map(lesson => {
            const isCompleted = completedLessonIds.has(lesson.id)
            const firstNodeCanvas =
              lesson.contentJson?.nodes?.[0]?.contentJson

            return (
              <div
                key={lesson.id}
                style={{
                  border: `1px solid ${isCompleted ? '#86efac' : '#eee'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  width: 300,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ pointerEvents: 'none', position: 'relative' }}>
                  {firstNodeCanvas ? (
                    <CanvasPreview
                      contentJson={firstNodeCanvas}
                      previewWidth={300}
                    />
                  ) : (
                    <div
                      style={{
                        width: 300,
                        height: 169,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <p style={{ color: '#999' }}>No content yet</p>
                    </div>
                  )}

                  {isCompleted && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: '#22c55e',
                        color: '#fff',
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Done
                    </div>
                  )}
                </div>

                <div style={{ padding: '8px 12px' }}>
                  <h3 style={{ margin: 0 }}>{lesson.title}</h3>

                  <div style={{ marginTop: 8 }}>
                    <button
                      onClick={() =>
                        navigate(
                          `/student/classrooms/${id}/lessons/${lesson.id}`
                        )
                      }
                      style={{ width: '100%' }}
                    >
                      {isCompleted ? 'Review' : 'Start'}
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