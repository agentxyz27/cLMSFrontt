import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { studentClassroomApi } from '../../api/studentClassroomApi'
import { progressApi } from '../../api/progressApi'
import type { ClassRoom, Progress } from '../../types'

export default function StudentDashboard() {
  const { token, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [classRooms, setClassRooms] = useState<ClassRoom[]>([])
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  if (authLoading || !token) return

  const safeToken = token

  async function fetchData() {
    try {
      const [classRoomsRes, progressRes] = await Promise.all([
        studentClassroomApi.getAll(safeToken),
        progressApi.getMyProgress(safeToken)
      ])

      setClassRooms(classRoomsRes)
      setProgress(progressRes)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [token, authLoading])

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const completedCount = progress.filter(p => p.completed).length
  const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0)

  return (
    <div>
      <h1>Welcome, {user?.name || 'Student'}</h1>

      <div>
        <p>Total XP: {totalXP}</p>
        <p>Lessons Completed: {completedCount}</p>
      </div>

      <h2>My Classrooms</h2>

      {classRooms.length === 0 ? (
        <p>No classrooms available for your section yet.</p>
      ) : (
        <div>
          {classRooms.map(classRoom => (
            <div key={classRoom.id}>
              <h3>{classRoom.subject.name}</h3>
              <p>Teacher: {classRoom.teacher?.name ?? 'Unknown'}</p>
              <p>Lessons: {classRoom._count?.lessons ?? 0}</p>

              <button
                onClick={() =>
                  navigate(`/student/classrooms/${classRoom.id}`)
                }
              >
                View Classroom
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}