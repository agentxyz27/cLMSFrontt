/**
 * studentCourses.tsx
 *
 * Shows all available subjects for the logged-in student.
 * Student can see all subjects and enroll in ones they haven't joined yet.
 *
 * Endpoints:
 *   GET /api/enrollment/all-subjects  → all available subjects
 *   GET /api/enrollment/my-subjects   → subjects already enrolled in
 *   POST /api/enrollment              → enroll in a subject
 *
 * Note: enrollment is teacher-initiated in production.
 * This page is read-only for now — students can browse but not self-enroll.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Subject } from '../../types'

export default function StudentCourses() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [mySubjectIds, setMySubjectIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [all, mine] = await Promise.all([
          api.get<Subject[]>('/enrollment/all-subjects', token),
          api.get<Subject[]>('/enrollment/my-subjects', token)
        ])
        setAllSubjects(all)
        setMySubjectIds(mine.map(s => s.id))
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>All Subjects</h1>

      {allSubjects.length === 0 ? (
        <p>No subjects available yet.</p>
      ) : (
        <div>
          {allSubjects.map(subject => (
            <div key={subject.id}>
              <h3>{subject.title}</h3>
              <p>Teacher: {subject.teacher.name}</p>
              <p>Lessons: {subject.lessons.length}</p>
              {mySubjectIds.includes(subject.id) ? (
                <button onClick={() => navigate(`/student/courses/${subject.id}`)}>
                  Continue
                </button>
              ) : (
                <span>Not enrolled</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}