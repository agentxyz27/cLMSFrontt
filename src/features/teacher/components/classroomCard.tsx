import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '@/shared/utils/slugify'
import type { ClassRoom } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Props {
  classRoom: ClassRoom
}

export default function ClassRoomCard({ classRoom }: Props) {
  const navigate = useNavigate()
  const slug = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)
  const lessonCount = classRoom._count?.lessons ?? 0

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold leading-tight">
              {classRoom.subject.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Grade {classRoom.section.grade.level} — {classRoom.section.name}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          size="sm"
          className="w-full"
          onClick={() => navigate(`/teacher/classrooms/${slug}`)}
        >
          Manage
        </Button>
      </CardContent>
    </Card>
  )
}