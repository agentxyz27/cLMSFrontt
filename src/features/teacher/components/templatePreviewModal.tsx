import GraphPreview from '../../../shared/components/graphPreview'
import type { Template, ClassRoom } from '../../../shared/types'

interface Props {
  selected: Template | null
  previewLoading: boolean
  previewError: string | null
  lessonTitle: string
  setLessonTitle: (v: string) => void
  selectedClassRoomId: string
  setSelectedClassRoomId: (v: string) => void
  classRooms: ClassRoom[]
  using: boolean
  useError: string | null
  useSuccess: boolean
  onUse: () => void
  onClose: () => void
}

export default function TemplatePreviewModal({
  selected, previewLoading, previewError,
  lessonTitle, setLessonTitle,
  selectedClassRoomId, setSelectedClassRoomId,
  classRooms, using, useError, useSuccess,
  onUse, onClose
}: Props) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 8, padding: 24, maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {previewLoading ? (
          <p>Loading preview...</p>
        ) : previewError ? (
          <p style={{ color: 'red' }}>{previewError}</p>
        ) : selected?.contentJson ? (
          <>
            <h2 style={{ marginTop: 0 }}>{selected.title}</h2>
            <p style={{ color: '#666', fontSize: 14 }}>By {selected.teacher?.name ?? 'Unknown'} · Used {selected.usageCount} times</p>

            <GraphPreview graph={selected.contentJson} previewWidth={640} />

            <div style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 16 }}>
              <h3 style={{ marginTop: 0 }}>Use this template</h3>
              {useSuccess ? (
                <p style={{ color: '#22c55e' }}>✅ Lesson created successfully! Check your classroom.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Lesson title"
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ddd' }}
                  />
                  <select
                    value={selectedClassRoomId}
                    onChange={e => setSelectedClassRoomId(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #ddd' }}
                  >
                    <option value="">Select a classroom</option>
                    {classRooms.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.subject.name} — Grade {c.section.grade.level} {c.section.name}
                      </option>
                    ))}
                  </select>
                  {useError && <p style={{ color: 'red', margin: 0 }}>{useError}</p>}
                  <button onClick={onUse} disabled={using}>{using ? 'Creating lesson...' : 'Use Template'}</button>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16 }}>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <p>No preview available.</p>
        )}
      </div>
    </div>
  )
}