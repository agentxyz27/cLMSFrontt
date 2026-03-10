/**
 * studentLessonView.tsx
 *
 * Shows the content of a specific lesson.
 * Student can mark the lesson as complete which awards XP and checks for badges.
 *
 * Endpoints:
 *   GET  /api/enrollment/all-subjects     → get lesson content from subject
 *   GET  /api/progress                    → check if lesson already completed
 *   POST /api/gamification/complete       → mark complete, earn XP, check badges
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject, Progress, Lesson } from '../../types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
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

      {/* Lesson content */}
      <div>
        <p>{lesson.content}</p>
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