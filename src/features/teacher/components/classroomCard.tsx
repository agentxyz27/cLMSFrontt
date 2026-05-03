import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '@/shared/utils/slugify'
import type { ClassRoom } from '@/shared/types'

interface Props {
  classRoom: ClassRoom
}

export default function ClassRoomCard({ classRoom }: Props) {
  const navigate = useNavigate()
  const slug = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)

  return (
    <div>
      <h3>{classRoom.subject.name}</h3>
      <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>
      <p>Lessons: {classRoom._count?.lessons ?? 0}</p>
      <button onClick={() => navigate(`/teacher/classrooms/${slug}`)}>Manage</button>
    </div>
  )
}