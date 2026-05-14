import React, { useState } from 'react'
import type { DragMatchContent, MultipleChoiceContent, TemplateType } from '@/shared/types'
import { createDragMatchCanvas } from '../createDragMatchCanvas'

const MATH_TOPICS = [
  { id: 1,  name: 'Addition'       }, { id: 2,  name: 'Subtraction'    },
  { id: 3,  name: 'Multiplication' }, { id: 4,  name: 'Division'       },
  { id: 5,  name: 'Fractions'      }, { id: 6,  name: 'Decimals'       },
  { id: 7,  name: 'Geometry'       }, { id: 8,  name: 'Measurement'    },
  { id: 9,  name: 'Word Problems'  }, { id: 10, name: 'Patterns'       },
  { id: 11, name: 'Place Value'    }, { id: 12, name: 'Time'           },
  { id: 13, name: 'Money'          }, { id: 14, name: 'Data and Graphs' },
]

interface Pair {
  itemLabel: string
  targetLabel: string
}

interface QuestionConfigModalProps {
  lessonId: number
  nodeId: string
  token: string | null
  editQuestionId?: number
  editTemplateType?: TemplateType
  editTopicId?: number
  editContent?: DragMatchContent | MultipleChoiceContent
  onSave: (questionId: number) => void
  onClose: () => void
}

const inputCss: React.CSSProperties = {
  width: '100%', fontSize: 12, padding: '6px 10px',
  borderRadius: 6, border: '1px solid #2a2d3a',
  background: '#0a0c12', color: '#e2e8f0',
  boxSizing: 'border-box', outline: 'none',
}

const labelCss: React.CSSProperties = {
  display: 'block', fontSize: 11,
  color: '#6b7280', marginBottom: 6,
}

const btnCss = (variant: 'primary' | 'ghost' | 'danger'): React.CSSProperties => ({
  padding: '6px 14px', fontSize: 12, borderRadius: 6,
  cursor: 'pointer', border: 'none', transition: 'all 0.12s',
  background: variant === 'primary' ? '#3b82f6'
    : variant === 'danger'  ? '#7f1d1d'
    : 'transparent',
  color: variant === 'primary' ? '#fff'
    : variant === 'danger'  ? '#f87171'
    : '#6b7280',
})

function buildDragMatchContent(
  prompt: string,
  pairs: Pair[],
  hints: string[],
): DragMatchContent {
  const items   = pairs.map((p, i) => ({ id: `item_${i + 1}`,   label: p.itemLabel   }))
  const targets = pairs.map((p, i) => ({ id: `target_${i + 1}`, label: p.targetLabel, accepts: `item_${i + 1}` }))
  const canvas  = createDragMatchCanvas({ prompt, items, targets })
  return {
    prompt,
    hints: hints.filter(Boolean),
    items,
    targets,
    canvas,
  }
}

const QuestionConfigModal = React.forwardRef<HTMLDivElement, QuestionConfigModalProps>(
  function QuestionConfigModal(props, ref) {
    const {
      lessonId, token,
      editQuestionId, editTemplateType, editTopicId, editContent,
      onSave, onClose,
    } = props

    const isEdit = !!editQuestionId

    const [templateType, setTemplateType] = useState<TemplateType>(editTemplateType ?? 'DRAG_MATCH')
    const [topicId,      setTopicId     ] = useState<number>(editTopicId ?? 1)
    const [prompt,       setPrompt      ] = useState(editContent?.prompt ?? '')
    const [hints,        setHints       ] = useState<string[]>(editContent?.hints ?? [])
    const [saving,       setSaving      ] = useState(false)
    const [error,        setError       ] = useState<string | null>(null)

    const initPairs = (): Pair[] => {
      if (editContent && 'items' in editContent) {
        return editContent.items.map((item, i) => ({
          itemLabel:   item.label,
          targetLabel: (editContent as DragMatchContent).targets[i]?.label ?? '',
        }))
      }
      return [{ itemLabel: '', targetLabel: '' }]
    }
    const [pairs, setPairs] = useState<Pair[]>(initPairs)

    function addPair() {
      setPairs(prev => [...prev, { itemLabel: '', targetLabel: '' }])
    }

    function removePair(i: number) {
      setPairs(prev => prev.filter((_, idx) => idx !== i))
    }

    function updatePair(i: number, field: keyof Pair, value: string) {
      setPairs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
    }

    function addHint()             { setHints(prev => [...prev, '']) }
    function removeHint(i: number) { setHints(prev => prev.filter((_, idx) => idx !== i)) }
    function updateHint(i: number, value: string) {
      setHints(prev => prev.map((h, idx) => idx === i ? value : h))
    }

    function validate(): string | null {
      if (!prompt.trim())                         return 'Prompt is required'
      if (pairs.length === 0)                     return 'At least one pair is required'
      if (pairs.some(p => !p.itemLabel.trim()))   return 'All item labels are required'
      if (pairs.some(p => !p.targetLabel.trim())) return 'All target labels are required'
      return null
    }

    async function handleSubmit() {
      const validationError = validate()
      if (validationError) { setError(validationError); return }
      if (!token) return

      setSaving(true)
      setError(null)

      try {
        const contentJson = buildDragMatchContent(prompt, pairs, hints)
        const { questionApi } = await import('@/shared/api/questionApi')

        if (isEdit && editQuestionId) {
          await questionApi.update(editQuestionId, { topicId, contentJson }, token)
          onSave(editQuestionId)
        } else {
          const res = await questionApi.create({
            lessonId,
            topicId,
            templateType,
            contentJson,
          }, token)
          onSave(res.question.id)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save question')
      } finally {
        setSaving(false)
      }
    }

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          width: 520, maxHeight: '90vh', overflowY: 'auto',
          background: '#16181f', borderRadius: 12,
          border: '1px solid #2a2d3a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Header */}
          <div style={{
            padding: '12px 16px', background: '#0f1117',
            borderBottom: '1px solid #2a2d3a',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
              {isEdit ? 'Edit Question' : 'Add Question'}
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4b5568', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          {/* Body */}
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Type + Topic */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelCss}>
                Type
                <select value={templateType} onChange={e => setTemplateType(e.target.value as TemplateType)} style={inputCss}>
                  <option value="DRAG_MATCH">Drag Match</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                </select>
              </label>
              <label style={labelCss}>
                Topic
                <select value={topicId} onChange={e => setTopicId(Number(e.target.value))} style={inputCss}>
                  {MATH_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
            </div>

            {/* Prompt */}
            <label style={labelCss}>
              Prompt
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Match each fraction to its name"
                style={{ ...inputCss, marginTop: 4 }}
              />
            </label>

            {/* Pairs — drag match only */}
            {templateType === 'DRAG_MATCH' && (
              <div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>Pairs</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#4b5568' }}>Item (draggable)</span>
                  <span style={{ fontSize: 10, color: '#4b5568' }}>Target (drop zone)</span>
                  <span />
                </div>
                {pairs.map((pair, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 24px', gap: 6, marginBottom: 6 }}>
                    <input
                      value={pair.itemLabel}
                      onChange={e => updatePair(i, 'itemLabel', e.target.value)}
                      placeholder={`Item ${i + 1}`}
                      style={inputCss}
                    />
                    <input
                      value={pair.targetLabel}
                      onChange={e => updatePair(i, 'targetLabel', e.target.value)}
                      placeholder={`Target ${i + 1}`}
                      style={inputCss}
                    />
                    <button
                      onClick={() => removePair(i)}
                      disabled={pairs.length === 1}
                      style={{
                        background: 'none', border: 'none', fontSize: 16,
                        color: pairs.length === 1 ? '#2a2d3a' : '#f87171',
                        cursor: pairs.length === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >×</button>
                  </div>
                ))}
                <button onClick={addPair} style={{ ...btnCss('ghost'), fontSize: 11, paddingLeft: 0 }}>
                  + Add pair
                </button>
              </div>
            )}

            {/* Hints */}
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                Hints <span style={{ color: '#374151' }}>(optional)</span>
              </div>
              {hints.map((hint, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 24px', gap: 6, marginBottom: 6 }}>
                  <input
                    value={hint}
                    onChange={e => updateHint(i, e.target.value)}
                    placeholder={`Hint ${i + 1}`}
                    style={inputCss}
                  />
                  <button
                    onClick={() => removeHint(i)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16 }}
                  >×</button>
                </div>
              ))}
              <button onClick={addHint} style={{ ...btnCss('ghost'), fontSize: 11, paddingLeft: 0 }}>
                + Add hint
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ fontSize: 11, color: '#f87171', padding: '6px 10px', background: '#1c0a0a', borderRadius: 6 }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #2a2d3a',
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
          }}>
            <button onClick={onClose} style={btnCss('ghost')}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={btnCss('primary')}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Question'}
            </button>
          </div>

        </div>
      </div>
    )
  }
)

export default QuestionConfigModal