/**
 * teacherTemplateBrowser.tsx
 *
 * Displays all public templates available to teachers.
 * Templates are now FULL LessonGraphs.
 *
 * - Card = first node preview (CanvasPreview)
 * - Modal = full graph navigation (GraphPreview)
 */

import { useState } from 'react'
import { useAuth } from '../../context/authContext'
import { useTemplates } from '../../hooks/useTemplates'
import { useClassRooms } from '../../hooks/useClassRooms'
import { templateApi } from '../../api/templateApi'

import CanvasPreview from '../../components/editor/canvasPreview'
import GraphPreview from '../../components/graphPreview'

import type { Template, ClassRoom } from '../../types'

export default function TeacherTemplateBrowser() {
  const { token } = useAuth()

  const { data: templates = [], loading, error } = useTemplates(token)
  const { data: classRooms = [] } = useClassRooms(token)

  const [selected, setSelected] = useState<Template | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [selectedClassRoomId, setSelectedClassRoomId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [using, setUsing] = useState(false)
  const [useError, setUseError] = useState<string | null>(null)
  const [useSuccess, setUseSuccess] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  // ───────────────────────────────────────────────────────────
  // Open Preview (fetch full template)
  // ───────────────────────────────────────────────────────────
  const openPreview = async (template: Template) => {
    if (!token) return

    setPreviewLoading(true)
    setUseError(null)
    setUseSuccess(false)
    setSelectedClassRoomId('')
    setLessonTitle(template.title)
    setPreviewError(null)

    try {
      const res = await templateApi.getById(template.id, token)
      setSelected(res)
    } catch (err: unknown) {
      setPreviewError(
        err instanceof Error ? err.message : 'Failed to load template preview'
      )
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreview = () => {
    setSelected(null)
    setUseError(null)
    setUseSuccess(false)
    setSelectedClassRoomId('')
    setPreviewError(null)
  }

  // ───────────────────────────────────────────────────────────
  // Use Template → Create Lesson
  // ───────────────────────────────────────────────────────────
  const handleUse = async () => {
    if (!selected || !token) return

    if (!selectedClassRoomId) {
      setUseError('Please select a classroom')
      return
    }

    if (!lessonTitle.trim()) {
      setUseError('Please enter a lesson title')
      return
    }

    setUsing(true)
    setUseError(null)

    try {
      await templateApi.use(
        selected.id,
        {
          classRoomId: Number(selectedClassRoomId),
          title: lessonTitle
        },
        token
      )
      setUseSuccess(true)
    } catch (err: unknown) {
      setUseError(
        err instanceof Error ? err.message : 'Failed to use template'
      )
    } finally {
      setUsing(false)
    }
  }

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  if (loading) return <div>Loading templates...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Template Library</h1>
      <p>Browse publicly available templates. Click any card to preview.</p>

      {templates.length === 0 ? (
        <p>No public templates available yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {templates.map(template => {
            const firstNodeCanvas =
              template.contentJson?.nodes?.[0]?.contentJson

            return (
              <div
                key={template.id}
                onClick={() => openPreview(template)}
                style={{
                  cursor: 'pointer',
                  border: '1px solid #eee',
                  borderRadius: 8,
                  overflow: 'hidden',
                  width: 300,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {firstNodeCanvas ? (
                    <CanvasPreview
                      contentJson={firstNodeCanvas}
                      previewWidth={300}
                    />
                  ) : (
                    <div
                      style={{
                        width: 300,
                        height: 169,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <p style={{ color: '#999' }}>No preview</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: '8px 12px' }}>
                  <h3 style={{ margin: 0 }}>{template.title}</h3>

                  <p style={{ margin: '4px 0', fontSize: 12, color: '#666' }}>
                    By {template.teacher?.name ?? 'Unknown'}
                  </p>

                  <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                    Used {template.usageCount} times
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────── */}
      {/* Preview Modal */}
      {/* ───────────────────────────────────────────────────── */}

      {(selected || previewLoading) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closePreview}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              maxWidth: 700,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {previewLoading ? (
              <p>Loading preview...</p>
            ) : previewError ? (
              <p style={{ color: 'red' }}>{previewError}</p>
            ) : selected && selected.contentJson ? (
              <>
                <h2 style={{ marginTop: 0 }}>{selected.title}</h2>

                <p style={{ color: '#666', fontSize: 14 }}>
                  By {selected.teacher?.name ?? 'Unknown'} · Used{' '}
                  {selected.usageCount} times
                </p>

                {/* 🔥 FULL GRAPH PREVIEW */}
                <GraphPreview
                  graph={selected.contentJson}
                  previewWidth={640}
                />

                <div
                  style={{
                    marginTop: 24,
                    borderTop: '1px solid #eee',
                    paddingTop: 16
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Use this template</h3>

                  {useSuccess ? (
                    <p style={{ color: '#22c55e' }}>
                      ✅ Lesson created successfully! Check your classroom.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Lesson title"
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: '1px solid #ddd'
                        }}
                      />

                      <select
                        value={selectedClassRoomId}
                        onChange={e => setSelectedClassRoomId(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: '1px solid #ddd'
                        }}
                      >
                        <option value="">Select a classroom</option>

                        {classRooms.map((c: ClassRoom) => (
                          <option key={c.id} value={c.id}>
                            {c.subject.name} — Grade {c.section.grade.level}{' '}
                            {c.section.name}
                          </option>
                        ))}
                      </select>

                      {useError && (
                        <p style={{ color: 'red', margin: 0 }}>
                          {useError}
                        </p>
                      )}

                      <button onClick={handleUse} disabled={using}>
                        {using ? 'Creating lesson...' : 'Use Template'}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <button onClick={closePreview}>Close</button>
                </div>
              </>
            ) : (
              <p>No preview available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}