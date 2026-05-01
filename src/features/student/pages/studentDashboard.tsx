import { useAuth } from '../../../context/authContext'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import StudentClassRoomCard from '../components/studentClassroomCard'
import type { ClassRoom } from '../../../shared/types'

export default function StudentDashboard() {
  const { token, user, loading: authLoading } = useAuth()
  const { classRooms, completedCount, totalXP, loading, error } = useStudentDashboard(token, authLoading)

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

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
          {classRooms.map((classRoom: ClassRoom) => (
            <StudentClassRoomCard key={classRoom.id} classRoom={classRoom} />
          ))}
        </div>
      )}
    </div>
  )
}