import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PreviewStage } from '@/shared/components/editor/stages'
import type { LessonSummary } from '@/shared/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  lesson: LessonSummary
  classroomSlug: string
  publishingId: number | null
  onRename: (id: number, title: string) => void
  onPublish: (lesson: LessonSummary) => void
  onDelete: (id: number) => void
}

export default function LessonCard({
  lesson,
  classroomSlug,
  publishingId,
  onRename,
  onPublish,
  onDelete
}: Props) {
  const navigate = useNavigate()
  const [renaming, setRenaming]     = useState(false)
  const [renameValue, setRenameValue] = useState(lesson.title)

  const firstNodeCanvas = lesson.contentJson?.nodes?.[0]?.contentJson

  const submitRename = () => {
    onRename(lesson.id, renameValue)
    setRenaming(false)
  }

  return (
    <div className="w-full rounded-lg border border-border overflow-hidden shadow-sm bg-card">

      {/* Canvas preview */}
      <div className="pointer-events-none w-full aspect-video bg-muted flex items-center justify-center overflow-hidden">
        {firstNodeCanvas ? (
          <PreviewStage contentJson={firstNodeCanvas} previewWidth={300} />
        ) : (
          <p className="text-sm text-muted-foreground">No content yet</p>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">

        {/* Title / rename */}
        {renaming ? (
          <div className="flex items-center gap-1">
            <Input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter')  submitRename()
                if (e.key === 'Escape') setRenaming(false)
              }}
              autoFocus
              className="h-7 text-sm"
            />
            <Button size="sm" variant="ghost" onClick={submitRename}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setRenaming(false)}>✕</Button>
          </div>
        ) : (
          <h3
            className="font-medium text-sm cursor-pointer hover:text-primary truncate"
            onClick={() => setRenaming(true)}
            title="Click to rename"
          >
            {lesson.title} ✏️
          </h3>
        )}

        {/* Last updated */}
        <p className="text-xs text-muted-foreground">
          {new Date(lesson.updatedAt).toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/teacher/classrooms/${classroomSlug}/lessons/${lesson.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onPublish(lesson)}
            disabled={publishingId === lesson.id}
          >
            {publishingId === lesson.id ? 'Publishing...' : 'Publish'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => onDelete(lesson.id)}
          >
            Delete
          </Button>
        </div>

      </div>
    </div>
  )
}