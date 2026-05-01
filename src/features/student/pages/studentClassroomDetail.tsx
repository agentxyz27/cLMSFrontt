import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/authContext'
import { useStudentClassRoom } from '../hooks/useStudentClassroom'
import StudentLessonCard from '../components/studentLessonCard'

export default function StudentClassroomDetail() {
  const { token, loading: authLoading } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: classRoom, lessons, completedLessonIds, loading, error } = useStudentClassRoom(
    authLoading ? undefined : id,
    token
  )

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!classRoom) return <div>Classroom not found</div>

  return (
    <div>
      <button onClick={() => navigate('/student/dashboard')}>← Back</button>
      <h1>{classRoom.subject.name}</h1>
      <p>Grade {classRoom.section.grade?.level} — {classRoom.section.name}</p>
      <p>Teacher: {classRoom.teacher?.name ?? 'Unknown'}</p>
      <p>Lessons: {lessons.length}</p>

      {lessons.length === 0 ? (
        <p>No lessons yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {lessons.map(lesson => (
            <StudentLessonCard
              key={lesson.id}
              lesson={lesson}
              classroomId={id!}
              isCompleted={completedLessonIds.has(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}