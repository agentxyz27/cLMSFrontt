/**
 * studentLessonView.tsx
 *
 * Shows the content of a specific lesson as ordered blocks.
 * Student can mark the lesson as complete which awards XP and checks for badges.
 *
 * Endpoints:
 *   GET  /api/enrollment/all-subjects → get lesson with blocks from subject
 *   GET  /api/progress                → check if lesson already completed
 *   POST /api/gamification/complete   → mark complete, earn XP, check badges
 *
 * Block types rendered:
 *   text  → dangerouslySetInnerHTML (rich text HTML)
 *   image → <img> tag
 *   video → YouTube embed via iframe
 *   file  → download link with file type label
 *   math  → plain text expression (MathJax/KaTeX in UI pass)
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Progress, Lesson, LessonBlock } from '../../types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

/**
 * Renders a single block based on its type.
 * Each type has its own rendering logic.
 */
function BlockRenderer({ block }: { block: LessonBlock }) {
  const data = block.data as Record<string, string>

  switch (block.type) {
    case 'text':
      // dangerouslySetInnerHTML renders rich text HTML from the editor
      return <div dangerouslySetInnerHTML={{ __html: data.html }} />

    case 'image':
      return (
        <div>
          <img src={data.url} alt={data.alt} style={{ maxWidth: '100%' }} />
          {data.alt && <p>{data.alt}</p>}
        </div>
      )

    case 'video': {
      // Convert YouTube watch URL to embed URL
      // https://youtube.com/watch?v=ID → https://youtube.com/embed/ID
      const embedUrl = data.url
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/')
      return (
        <div>
          {data.title && <p>{data.title}</p>}
          <iframe
            src={embedUrl}
            width="100%"
            height="400"
            allowFullScreen
            title={data.title}
          />
        </div>
      )
    }

    case 'file':
      return (
        <div>
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            📎 {data.name} ({data.fileType.toUpperCase()})
          </a>
        </div>
      )

    case 'math':
      // Plain text for now — will be replaced with KaTeX in UI pass
      return (
        <div>
          <code>{data.expression}</code>
        </div>
      )

    default:
      return <div>Unknown block type: {block.type}</div>
  }
}

export default function StudentLessonView() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [completed, setCompleted] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subjects, progressRes] = await Promise.all([
          api.get<Subject[]>('/enrollment/all-subjects', token),
          api.get<Progress[]>('/progress', token)
        ])

        // Find the subject
        const subject = subjects.find(s => s.id === Number(id))
        if (!subject) {
          setError('Subject not found')
          return
        }

        // Find the lesson
        const found = subject.lessons.find(l => l.id === Number(lessonId))
        if (!found) {
          setError('Lesson not found')
          return
        }

        // Check if already completed
        const isCompleted = progressRes.some(
          p => p.lessonId === Number(lessonId) && p.completed
        )

        setLesson(found)
        setCompleted(isCompleted)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id, lessonId])

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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!lesson) return <div>Lesson not found</div>

  return (
    <div>
      <button onClick={() => navigate(`/student/courses/${id}`)}>← Back</button>

      <h1>{lesson.title}</h1>

      {/* Render blocks in order */}
      <div>
        {lesson.blocks && lesson.blocks.length > 0 ? (
          lesson.blocks
            .sort((a, b) => a.order - b.order)
            .map(block => (
              <div key={block.id}>
                <BlockRenderer block={block} />
              </div>
            ))
        ) : (
          <p>No content yet.</p>
        )}
      </div>

      {/* Reward feedback after completing */}
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