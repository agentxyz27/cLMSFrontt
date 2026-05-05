import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CanvasPreview from '@/shared/components/editor/main/canvasPreview'
import type { LessonSummary } from '@/shared/types'

import { Button } from '@/components/ui/button'

interface Props {
  lesson: LessonSummary
  classroomSlug: string
  publishingId: number | null
  onRename: (id: number, title: string) => void
  onPublish: (lesson: LessonSummary) => void
  onDelete: (id: number) => void
}

export default function LessonCard({ lesson, classroomSlug, publishingId, onRename, onPublish, onDelete }: Props) {
  const navigate = useNavigate()
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(lesson.title)

  const firstNodeCanvas = lesson.contentJson?.nodes?.[0]?.contentJson

  const submitRename = () => {
    onRename(lesson.id, renameValue)
    setRenaming(false)
  }

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden', width: 300, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ pointerEvents: 'none' }}>
        {firstNodeCanvas ? (
          <CanvasPreview contentJson={firstNodeCanvas} previewWidth={300} />
        ) : (
          <div style={{ width: 300, height: 169, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999' }}>No content yet</p>
          </div>
        )}
      </div>

      <div style={{ padding: '8px 12px' }}>
        {renaming ? (
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            <input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitRename()
                if (e.key === 'Escape') setRenaming(false)
              }}
              autoFocus
              style={{ flex: 1, fontSize: 14 }}
            />
            <button onClick={submitRename}>Save</button>
            <button onClick={() => setRenaming(false)}>✕</button>
          </div>
        ) : (
          <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setRenaming(true)} title="Click to rename">
            {lesson.title} ✏️
          </h3>
        )}

        <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
          Last updated: {new Date(lesson.updatedAt).toLocaleString()}
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <Button onClick={() => navigate(`/teacher/classrooms/${classroomSlug}/lessons/${lesson.id}/edit`)}>Edit</Button>
          <Button onClick={() => onPublish(lesson)} disabled={publishingId === lesson.id}>
            {publishingId === lesson.id ? 'Publishing...' : 'Publish'}
          </Button>
          <Button variant="destructive" onClick={() => onDelete(lesson.id)}>Delete</Button>
        </div>
      </div>
    </div>
  )
}