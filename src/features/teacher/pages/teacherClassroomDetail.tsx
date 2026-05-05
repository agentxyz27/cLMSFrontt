import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { useClassRoom } from '../hooks/useClassRoom'
import { useLessonActions } from '../hooks/useLessonActions'
import LessonCard from '../components/lessonCard'
import { extractIdFromSlug, classRoomSlug } from '@/shared/utils/slugify'
import { Button } from '@/components/ui/button'

export default function TeacherClassroomDetail() {
  const { token } = useAuth()
  const { id: rawId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const { data: classRoom, loading, error, refetch } = useClassRoom(id, token)
  const { deleteLesson, renameLesson, publishLesson, publishingId, actionError } = useLessonActions(token, refetch)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!classRoom) return <div>Classroom not found</div>

  const slug = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)
  const lessons = classRoom.lessons ?? []

  return (
    <div className=''>
      <Button onClick={() => navigate('/teacher/dashboard')}>← Back</Button>
      <h1 className='text-center text-4xl'>{classRoom.subject.name}</h1>
      <p className='text-center text-2xl font-semibold'>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>

      {actionError && <p style={{ color: 'red' }}>{actionError}</p>}

      <div style={{ marginBottom: 24 }}>
        <Button onClick={() => navigate(`/teacher/classrooms/${slug}/lessons/new`)}>+ New Lesson</Button>
      </div>

      <h2>Lessons ({lessons.length})</h2>

      {lessons.length === 0 ? (
        <p>No lessons yet. Create your first lesson!</p>
      ) : (
        <div className=' justify-center' style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              classroomSlug={slug}
              publishingId={publishingId}
              onRename={renameLesson}
              onPublish={publishLesson}
              onDelete={deleteLesson}
            />
          ))}
        </div>
      )}
    </div>
  )
}