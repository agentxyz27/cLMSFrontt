/**
 * teacherLessonNew.tsx
 *
 * Three-step flow:
 *   Step 1 — Teacher enters a lesson title
 *   Step 2 — Teacher chooses: blank lesson or use a template
 *   Step 3 — Node-based canvas editor opens
 *
 * When using a template:
 *   The template's CanvasData becomes the contentJson of the first
 *   explanation node in a new LessonContent. Templates are single
 *   canvas layouts — they get wrapped into a lesson node graph.
 *
 * Endpoints:
 *   POST /api/lessons           → create lesson (title + classRoomId)
 *   GET  /api/templates         → fetch public templates for selection
 *   POST /api/templates/:id/use → create lesson from template
 *   PUT  /api/lessons/:id       → save LessonContent (handled inside CanvasEditor)
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import CanvasEditor from '../../components/editor/canvasEditor'
import CanvasPreview from '../../components/editor/canvasPreview'
import type { CanvasData, LessonContent } from '../../types'
import { extractIdFromSlug } from '../../utils/slugify'

interface CreatedLesson {
  id: number
  title: string
}

interface Template {
  id: number
  title: string
  usageCount: number
  teacher: { id: number; name: string } | null
  contentJson?: CanvasData
}

type Step = 'title' | 'choose' | 'editor'

export default function TeacherLessonNew() {
  const { token } = useAuth()
  const { id: rawId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('title')
  const [title, setTitle] = useState('')
  const [lesson, setLesson] = useState<CreatedLesson | null>(null)
  const [initialContent, setInitialContent] = useState<LessonContent | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [using, setUsing] = useState(false)

  const handleTitleNext = () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setError(null)
    fetchTemplates()
    setStep('choose')
  }

  const fetchTemplates = async () => {
    setTemplatesLoading(true)
    try {
      const res = await api.get<Template[]>('/templates', token)
      setTemplates(res)
    } catch {
      // silently fail — blank lesson still available
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleBlankLesson = async () => {
    setCreating(true)
    setError(null)
    try {
      const res = await api.post<{ lesson: CreatedLesson }>(
        '/lessons',
        { title, classRoomId: Number(id) },
        token
      )
      setLesson(res.lesson)
      setInitialContent(null) // editor will use BLANK_LESSON default
      setStep('editor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setCreating(false)
    }
  }

  const handleUseTemplate = async () => {
    if (!selectedTemplate) return
    setUsing(true)
    setError(null)
    try {
      const res = await api.post<{ lesson: CreatedLesson }>(
        `/templates/${selectedTemplate.id}/use`,
        { classRoomId: Number(id), title },
        token
      )
      setLesson(res.lesson)

      // Wrap template CanvasData into a LessonContent with one explanation node
      if (selectedTemplate.contentJson) {
        const wrappedContent: LessonContent = {
          nodes: [
            {
              id: 'node_1',
              type: 'explanation',
              contentJson: selectedTemplate.contentJson,
              nextNodeId: null,
              hintNodeId: null
            }
          ],
          settings: {
            passingScore: 70,
            retryLimit: null,
            badgeId: null
          }
        }
        setInitialContent(wrappedContent)
      } else {
        setInitialContent(null)
      }

      setStep('editor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson from template')
    } finally {
      setUsing(false)
    }
  }

  // ── Step 1 — enter title ──────────────────────────────────────────────
  if (step === 'title') {
    return (
      <div>
        <button onClick={() => navigate(`/teacher/classrooms/${id}`)}>← Back</button>
        <h1>New Lesson</h1>
        <input
          type="text"
          placeholder="Lesson title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTitleNext()}
          autoFocus
        />
        <button onClick={handleTitleNext}>Next →</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  // ── Step 2 — choose blank or template ─────────────────────────────────
  if (step === 'choose') {
    return (
      <div>
        <button onClick={() => setStep('title')}>← Back</button>
        <h1>Choose a starting point</h1>
        <p>Creating: <strong>{title}</strong></p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: 24 }}>
          <button onClick={handleBlankLesson} disabled={creating}>
            {creating ? 'Creating...' : '+ Start with blank lesson'}
          </button>
        </div>

        <h2>Or choose a template</h2>
        {templatesLoading ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <p>No public templates available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(
                  selectedTemplate?.id === template.id ? null : template
                )}
                style={{
                  cursor: 'pointer',
                  border: selectedTemplate?.id === template.id
                    ? '2px solid #3b82f6'
                    : '1px solid #eee',
                  borderRadius: 8,
                  overflow: 'hidden',
                  width: 260,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
              >
                <div style={{ pointerEvents: 'none' }}>
                  {template.contentJson ? (
                    <CanvasPreview contentJson={template.contentJson} previewWidth={260} />
                  ) : (
                    <div style={{
                      width: 260, height: 146,
                      background: '#f5f5f5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <p style={{ color: '#999' }}>No preview</p>
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 12px' }}>
                  <h3 style={{ margin: 0, fontSize: 14 }}>{template.title}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>
                    By {template.teacher?.name ?? 'Unknown'} · Used {template.usageCount} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTemplate && (
          <div style={{ marginTop: 24 }}>
            <p>Using: <strong>{selectedTemplate.title}</strong></p>
            <button onClick={handleUseTemplate} disabled={using}>
              {using ? 'Creating...' : 'Use this template →'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Step 3 — canvas editor ────────────────────────────────────────────
  return (
    <CanvasEditor
      lessonId={lesson!.id}
      initial={initialContent}
      token={token}
      onDone={() => navigate(`/teacher/classrooms/${id}`)}
    />
  )
}