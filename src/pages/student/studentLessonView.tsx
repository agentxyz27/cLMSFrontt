/**
 * studentLessonView.tsx
 *
 * Shows the content of a specific lesson as a canvas.
 * Student can mark the lesson as complete which awards XP and checks for badges.
 *
 * The lesson content is rendered from contentJson (canvas JSON) using
 * absolute positioned HTML elements that mirror the teacher's canvas layout.
 * The canvas is scaled to fit the student's screen width.
 *
 * Endpoints:
 *   GET  /api/lessons/lesson/:id    → load full lesson with contentJson
 *   GET  /api/progress              → check if lesson already completed
 *   POST /api/gamification/complete → mark complete, earn XP, check badges
 */

import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Lesson, CanvasElement, TextElementProps, ImageElementProps, ShapeElementProps, Progress } from '../../types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

// ── Canvas element renderers ───────────────────────────────────────────────

function TextRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as TextElementProps
  return (
    <div style={{
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      fontSize: p.fontSize,
      color: p.color,
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      textAlign: p.align || 'left',
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {p.text}
    </div>
  )
}

function ImageRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ImageElementProps
  return (
    <img
      src={p.url}
      alt={p.alt}
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        objectFit: 'contain'
      }}
    />
  )
}

function ShapeRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ShapeElementProps
  const isEllipse = p.shape === 'ellipse'
  return (
    <div style={{
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      background: p.fill,
      border: `${p.strokeWidth}px solid ${p.stroke}`,
      borderRadius: isEllipse ? '50%' : '0'
    }} />
  )
}

function CanvasElementRenderer({ element }: { element: CanvasElement }) {
  if (element.type === 'text')  return <TextRenderer element={element} />
  if (element.type === 'image') return <ImageRenderer element={element} />
  if (element.type === 'shape') return <ShapeRenderer element={element} />
  return null
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StudentLessonView() {
  const { token, loading: authLoading } = useAuth()
  const { id, lessonId } = useParams()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [completed, setCompleted] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Used to scale the canvas to fit the student's screen
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (authLoading || !token) return

    async function fetchData() {
      try {
        const [lessonRes, progressRes] = await Promise.all([
          api.get<Lesson>(`/lessons/lesson/${lessonId}`, token),
          api.get<Progress[]>('/progress', token)
        ])

        const isCompleted = progressRes.some(
          p => p.lessonId === Number(lessonId) && p.completed
        )

        setLesson(lessonRes)
        setCompleted(isCompleted)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, authLoading, lessonId])

  // Scale canvas to fit container width
  useEffect(() => {
    if (!lesson?.contentJson || !containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    const canvasWidth = lesson.contentJson.canvas.width
    setScale(Math.min(1, containerWidth / canvasWidth))
  }, [lesson])

  async function handleComplete() {
    setCompleting(true)
    try {
      const res = await api.post<CompleteResponse>(
        '/gamification/complete',
        { lessonId: Number(lessonId), score: 100 },
        token
      )
      setCompleted(true)
      setReward(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  if (authLoading || loading) return <div>Loading...</div>
  if (error)  return <div>Error: {error}</div>
  if (!lesson) return <div>Lesson not found</div>

  const canvasData = lesson.contentJson

  return (
    <div>
      <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back</button>
      <h1>{lesson.title}</h1>

      {/* Canvas viewer */}
      <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }}>
        {canvasData ? (
          <div style={{
            position: 'relative',
            width: canvasData.canvas.width,
            height: canvasData.canvas.height,
            background: canvasData.canvas.background,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            // Collapse the scaled-down space so page doesn't scroll into blank area
            marginBottom: canvasData.canvas.height * (scale - 1)
          }}>
            {canvasData.elements.map(el => (
              <CanvasElementRenderer key={el.id} element={el} />
            ))}
          </div>
        ) : (
          <p>No content yet.</p>
        )}
      </div>

      {/* Reward feedback */}
      {reward && (
        <div>
          <p>+{reward.xpEarned} XP earned!</p>
          <p>Total XP: {reward.totalXP}</p>
          <p>Level: {reward.level}</p>
          {reward.newBadges.length > 0 && (
            <div>
              <p>🎉 New badges earned:</p>
              {reward.newBadges.map(badge => (
                <div key={badge.id}>
                  <strong>{badge.name}</strong> — {badge.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete button */}
      {completed ? (
        <p>✅ You have completed this lesson</p>
      ) : (
        <button onClick={handleComplete} disabled={completing}>
          {completing ? 'Marking complete...' : 'Mark as Complete'}
        </button>
      )}
    </div>
  )
}