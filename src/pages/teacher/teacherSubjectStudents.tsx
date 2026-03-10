/**
 * teacherSubjectStudents.tsx
 *
 * Shows all students enrolled in a specific subject.
 * Teacher can enroll a new student by entering their student ID.
 *
 * Endpoints:
 *   GET  /api/enrollment/my-subjects  → not used here
 *   POST /api/enrollment              → enroll a student
 *
 * Note: no endpoint exists yet to get students by subject.
 * We will add GET /api/enrollment/subject/:id to the backend.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

interface EnrolledStudent {
  id: number
  studentId: number
  enrolledAt: string
  student: {
    id: number
    name: string
    email: string
    lrn: string
    xp: number
    level: number
  }
}

export default function TeacherSubjectStudents() {
  const { token } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const [enrollments, setEnrollments] = useState<EnrolledStudent[]>([])
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<EnrolledStudent[]>(`/enrollment/subject/${id}`, token)
        setEnrollments(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id])

  async function handleEnroll() {
    if (!studentId.trim()) {
      setError('Student ID is required')
      return
    }

    setEnrolling(true)
    setError(null)

    try {
      await api.post('/enrollment', { studentId: Number(studentId), subjectId: Number(id) }, token)
      // Refetch enrollments to show the new student
      const res = await api.get<EnrolledStudent[]>(`/enrollment/subject/${id}`, token)
      setEnrollments(res)
      setStudentId('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to enroll student')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <button onClick={() => navigate(`/teacher/subjects/${id}`)}>← Back</button>

      <h1>Enrolled Students</h1>

      {/* Enroll new student */}
      <div>
        <h2>Enroll a Student</h2>
        <input
          type="number"
          placeholder="Student ID"
          value={studentId}
          onChange={e => setStudentId(e.target.value)}
        />
        <button onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? 'Enrolling...' : 'Enroll'}
        </button>
      </div>

      {error && <p>{error}</p>}

      {/* Students list */}
      <h2>Students ({enrollments.length})</h2>
      {enrollments.length === 0 ? (
        <p>No students enrolled yet.</p>
      ) : (
        <div>
          {enrollments.map(e => (
            <div key={e.id}>
              <h3>{e.student.name}</h3>
              <p>LRN: {e.student.lrn}</p>
              <p>Email: {e.student.email}</p>
              <p>XP: {e.student.xp} | Level: {e.student.level}</p>
              <p>Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}