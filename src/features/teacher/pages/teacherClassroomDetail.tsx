import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { useClassRoom } from '../hooks/useClassRoom'
import { useLessonActions } from '../hooks/useLessonActions'
import LessonCard from '../components/lessonCard'
import AnalysisPanel from '../components/analysisPanel'
import { extractIdFromSlug, classRoomSlug } from '@/shared/utils/slugify'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { LessonSummary } from '@/shared/types'

export default function TeacherClassroomDetail() {
  const { token } = useAuth()
  const { id: rawId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const { data: classRoom, loading, error, refetch } = useClassRoom(id, token)
  const { deleteLesson, renameLesson, publishLesson, publishingId, actionError } =
    useLessonActions(token, refetch)

  const [selectedLesson, setSelectedLesson] = useState<LessonSummary | null>(null)

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )

  if (error)      return <p className="text-destructive">Error: {error}</p>
  if (!classRoom) return <p className="text-muted-foreground">Classroom not found</p>

  const slug    = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)
  const lessons = classRoom.lessons ?? []

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2"
            onClick={() => navigate('/teacher/classrooms')}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{classRoom.subject.name}</h1>
          <p className="text-muted-foreground text-sm">
            Grade {classRoom.section.grade.level} — {classRoom.section.name}
          </p>
        </div>
        <Button onClick={() => navigate(`/teacher/classrooms/${slug}/lessons/new`)}>
          + New Lesson
        </Button>
      </div>

      {actionError && (
        <p className="text-sm text-destructive">{actionError}</p>
      )}

      {/* Lessons grid */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Lessons ({lessons.length})
        </h2>

        {lessons.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No lessons yet. Create your first lesson!</p>
            <Button
              className="mt-4"
              onClick={() => navigate(`/teacher/classrooms/${slug}/lessons/new`)}
            >
              + New Lesson
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lessons.map(lesson => (
              <div key={lesson.id} className="space-y-2">
                <LessonCard
                  lesson={lesson}
                  classroomSlug={slug}
                  publishingId={publishingId}
                  onRename={renameLesson}
                  onPublish={publishLesson}
                  onDelete={deleteLesson}
                />
                <Button
                  variant={selectedLesson?.id === lesson.id ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)
                  }
                >
                  {selectedLesson?.id === lesson.id ? 'Close Analysis' : 'Analyze'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis panel */}
      {selectedLesson && token && (
        <AnalysisPanel
          lesson={selectedLesson}
          classRoomId={classRoom.id}
          token={token}
          onClose={() => setSelectedLesson(null)}
        />
      )}

    </div>
  )
}