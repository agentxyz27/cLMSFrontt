import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '@/shared/utils/slugify'
import type { ClassRoom } from '@/shared/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Props {
  classRoom: ClassRoom
}

export default function ClassRoomCard({ classRoom }: Props) {
  const navigate = useNavigate()
  const slug = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)

  return (
    <Card className='p-4'>
      <h3 className='text-center text-2xl'>Grade {classRoom.section.grade.level}: {classRoom.section.name}</h3>
      <h4>{classRoom.subject.name}</h4>
      <p>Lessons: {classRoom._count?.lessons ?? 0}</p>
      <Button onClick={() => navigate(`/teacher/classrooms/${slug}`)}>Manage</Button>
    </Card>
  )
}