import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '../../../shared/utils/slugify'
import type { ClassRoom } from '../../../shared/types'

import { Button } from 'pixel-retroui'

interface Props {
  classRoom: ClassRoom
}

export default function ClassRoomCard({ classRoom }: Props) {
  const navigate = useNavigate()
  const slug = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)

  return (
    <div>
      <div className='mb-4 text-center text-2xl'>{classRoom.subject.name}</div>
      <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>
      <p>Lessons: {classRoom._count?.lessons ?? 0}</p>
      <div className="flex flex-col p-4">
        <Button onClick={() => navigate(`/teacher/classrooms/${slug}`)}>Manage</Button>
      </div>
    </div>
  )
}