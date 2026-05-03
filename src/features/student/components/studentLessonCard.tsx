import { useNavigate } from 'react-router-dom'
import CanvasPreview from '@/shared/components/editor/main/canvasPreview'
import type { LessonSummary } from '@/shared/types'

interface Props {
  lesson: LessonSummary
  classroomId: string
  isCompleted: boolean
}

export default function StudentLessonCard({ lesson, classroomId, isCompleted }: Props) {
  const navigate = useNavigate()
  const firstNodeCanvas = lesson.contentJson?.nodes?.[0]?.contentJson

  return (
    <div style={{ border: `1px solid ${isCompleted ? '#86efac' : '#eee'}`, borderRadius: 8, overflow: 'hidden', width: 300, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ pointerEvents: 'none', position: 'relative' }}>
        {firstNodeCanvas ? (
          <CanvasPreview contentJson={firstNodeCanvas} previewWidth={300} />
        ) : (
          <div style={{ width: 300, height: 169, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999' }}>No content yet</p>
          </div>
        )}
        {isCompleted && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: '#22c55e', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 'bold' }}>
            ✅ Done
          </div>
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <h3 style={{ margin: 0 }}>{lesson.title}</h3>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => navigate(`/student/classrooms/${classroomId}/lessons/${lesson.id}`)} style={{ width: '100%' }}>
            {isCompleted ? 'Review' : 'Start'}
          </button>
        </div>
      </div>
    </div>
  )
}