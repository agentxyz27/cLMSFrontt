import { useNavigate } from 'react-router-dom'
import type { ClassRoom } from '@/shared/types'

interface Props {
  classRoom: ClassRoom
}

export default function StudentClassRoomCard({ classRoom }: Props) {
  const navigate = useNavigate()

  return (
    <div>
      <h3>{classRoom.subject.name}</h3>
      <p>Teacher: {classRoom.teacher?.name ?? 'Unknown'}</p>
      <p>Lessons: {classRoom._count?.lessons ?? 0}</p>
      <button onClick={() => navigate(`/student/classrooms/${classRoom.id}`)}>
        View Classroom
      </button>
    </div>
  )
}