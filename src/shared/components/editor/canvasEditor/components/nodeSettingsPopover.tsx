import React, { useState } from 'react'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '../constants'
import { questionApi } from '@/shared/api/questionApi'
import type {
  LessonNode,
  LessonNodeType,
  TransitionCondition,
  TemplateType,
} from '@/shared/types'

interface NodeSettingsPopoverProps {
  x: number
  y: number
  node: LessonNode
  allNodes: LessonNode[]
  canDelete: boolean
  lessonId: number
  token: string | null
  onChangeType: (type: LessonNodeType) => void
  onSetTransition: (condition: TransitionCondition, targetNodeId: string | null) => void
  onAddQuestionId: (nodeId: string, questionId: number) => void
  onRemoveQuestionId: (nodeId: string, questionId: number) => void
  onDelete: () => void
  onClose: () => void
}

const POPOVER_W     = 300
const POPOVER_MAX_H = 580

// Nodes that branch on correct/incorrect
const BRANCHING_NODE_TYPES: LessonNodeType[] = ['practice', 'mastery']

// Nodes that require a linked Question record
const QUESTION_NODE_TYPES: LessonNodeType[] = ['practice', 'mastery']

// Math topics seeded in DB — id matches seed order
const MATH_TOPICS = [
  { id: 1,  name: 'Addition'      }, { id: 2,  name: 'Subtraction'   },
  { id: 3,  name: 'Multiplication'}, { id: 4,  name: 'Division'      },
  { id: 5,  name: 'Fractions'     }, { id: 6,  name: 'Decimals'      },
  { id: 7,  name: 'Geometry'      }, { id: 8,  name: 'Measurement'   },
  { id: 9,  name: 'Word Problems' }, { id: 10, name: 'Patterns'      },
  { id: 11, name: 'Place Value'   }, { id: 12, name: 'Time'          },
  { id: 13, name: 'Money'         }, { id: 14, name: 'Data and Graphs'},
]

const inputCss: React.CSSProperties = {
  width: '100%', marginTop: 4, fontSize: 12,
  padding: '5px 8px', borderRadius: 6,
  border: '1px solid #2a2d3a',
  background: '#0a0c12', color: '#e2e8f0',
  boxSizing: 'border-box', outline: 'none',
}

const labelCss: React.CSSProperties = {
  display: 'block', fontSize: 11,
  color: '#6b7280', marginBottom: 10,
}

const NodeSettingsPopover = React.forwardRef<HTMLDivElement, NodeSettingsPopoverProps>(
  function NodeSettingsPopover(props, ref) {
    const {
      x, y, node, allNodes, canDelete,
      lessonId, token,
      onChangeType, onSetTransition, onAddQuestionId, onRemoveQuestionId,
      onDelete, onClose,
    } = props

    const [topicId,      setTopicId     ] = useState<number>(1)
    const [templateType, setTemplateType] = useState<TemplateType>('DRAG_MATCH')
    const [saving,       setSaving      ] = useState(false)
    const [saveError,    setSaveError   ] = useState<string | null>(null)
    const [saved,        setSaved       ] = useState(false)

    const safeX  = Math.min(x, window.innerWidth - POPOVER_W - 16)
    const flipUp = y + POPOVER_MAX_H > window.innerHeight - 16
    const safeY  = flipUp ? Math.max(16, y - POPOVER_MAX_H) : y

    const otherNodes    = allNodes.filter(n => n.id !== node.id)
    const nodeIndex     = allNodes.indexOf(node)
    const color         = NODE_TYPE_COLOR[node.type]
    const isBranching   = BRANCHING_NODE_TYPES.includes(node.type)
    const needsQuestion = QUESTION_NODE_TYPES.includes(node.type)

    // Read current transition targets from node
    const getTarget = (condition: TransitionCondition): string =>
     (node.transitions ?? []).find(t => t.condition === condition)?.targetNodeId ?? ''

    // Auto-detect interaction type from canvas elements
    const elements        = (node.content ?? (node as any).contentJson)?.elements ?? []
    const hasDragElements = elements.some(el => el.type === 'drag-item' || el.type === 'drag-target')
    const hasMcOptions    = elements.some(el => el.type === 'mc-option')
    const detectedType: TemplateType = hasDragElements
      ? 'DRAG_MATCH'
      : hasMcOptions
        ? 'DRAG_MATCH'
        : templateType

    async function handleCreateQuestion() {
      if (!token) return
      setSaving(true)
      setSaveError(null)
      try {
        const res = await questionApi.create({
          lessonId,
          topicId,
          templateType: detectedType,
          contentJson: (node.content ?? (node as any).contentJson) as unknown as Record<string, unknown>,
        }, token)
        onAddQuestionId(node.id, res.question.id)
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } catch (err: unknown) {
        setSaveError(err instanceof Error ? err.message : 'Failed to create question')
      } finally {
        setSaving(false)
      }
    }

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed', left: safeX, top: safeY,
          width: POPOVER_W, maxHeight: POPOVER_MAX_H,
          background: '#16181f',
          border: '1px solid #2a2d3a',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          zIndex: 1000, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '10px 14px', background: '#0f1117',
          borderBottom: `1px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
              Node {nodeIndex + 1} · {NODE_TYPE_LABEL[node.type]}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#4b5568', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>

          {/* Node type */}
          <label style={labelCss}>
            Node type
            <select
              value={node.type}
              onChange={e => onChangeType(e.target.value as LessonNodeType)}
              style={inputCss}
            >
              <option value="hook">Hook</option>
              <option value="teach">Teach</option>
              <option value="practice">Practice</option>
              <option value="mastery">Mastery</option>
              <option value="reward">Reward</option>
            </select>
          </label>

          {/* Transitions */}
          <div style={{ height: 1, background: '#2a2d3a', margin: '4px 0 12px' }} />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#60a5fa', marginBottom: 10 }}>
            TRANSITIONS
          </div>

          {isBranching ? (
            <>
              <label style={labelCss}>
                If Passed
                <select
                  value={getTarget('passed')}
                  onChange={e => onSetTransition('passed', e.target.value || null)}
                  style={inputCss}
                >
                  <option value=''>— End of lesson —</option>
                  {otherNodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {allNodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelCss}>
                If Failed
                <select
                  value={getTarget('failed')}
                  onChange={e => onSetTransition('failed', e.target.value || null)}
                  style={inputCss}
                >
                  <option value=''>— Stay on node —</option>
                  {otherNodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {allNodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                    </option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label style={labelCss}>
              Always goes to →
              <select
                value={getTarget('always')}
                onChange={e => onSetTransition('always', e.target.value || null)}
                style={inputCss}
              >
                <option value=''>— End of lesson —</option>
                {otherNodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {allNodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Question record — practice and mastery only */}
          {needsQuestion && (
            <>
              <div style={{ height: 1, background: '#2a2d3a', margin: '4px 0 12px' }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#10b981', marginBottom: 10 }}>
                QUESTIONS ({(node.questionIds ?? []).length})
              </div>

              {(node.questionIds ?? []).map(qid => (
                <div key={qid} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                  background: '#052e16', border: '1px solid #14532d',
                  fontSize: 11, color: '#86efac',
                }}>
                  <span>✓ Question #{qid}</span>
                  <button
                    onClick={() => onRemoveQuestionId(node.id, qid)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, padding: 0 }}
                  >×</button>
                </div>
              ))}

              <label style={labelCss}>
                Topic
                <select value={topicId} onChange={e => setTopicId(Number(e.target.value))} style={inputCss}>
                  {MATH_TOPICS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>

              <label style={labelCss}>
                Type
                <select value={detectedType} onChange={e => setTemplateType(e.target.value as TemplateType)} style={inputCss}>
                  <option value="DRAG_MATCH">Drag Match</option>
                  <option value="FILL_STEP">Fill Step</option>
                  <option value="VISUAL_GROUPING">Visual Grouping</option>
                  <option value="NUMBER_LINE">Number Line</option>
                </select>
              </label>

              {hasDragElements && (
                <div style={{ fontSize: 10, color: '#f59e0b', marginBottom: 8 }}>⚡ Auto-detected: DRAG_MATCH</div>
              )}
              {saveError && <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8 }}>{saveError}</div>}
              {saved && <div style={{ fontSize: 11, color: '#86efac', marginBottom: 8 }}>✓ Question created!</div>}

              <button
                onClick={handleCreateQuestion}
                disabled={saving}
                style={{
                  width: '100%', padding: '7px 0', fontSize: 12,
                  borderRadius: 6, border: '1px solid #14532d',
                  background: saving ? '#0a1a0f' : '#052e16',
                  color: saving ? '#4b5568' : '#86efac',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.12s', marginBottom: 10,
                }}
              >
                {saving ? 'Creating…' : '+ Add Question'}
              </button>
            </>
          )}

          <div style={{ height: 1, background: '#2a2d3a', margin: '8px 0 12px' }} />

          {/* Delete */}
          <button
            onClick={onDelete}
            disabled={!canDelete}
            style={{
              width: '100%', padding: '7px 0', fontSize: 12, borderRadius: 6,
              border: canDelete ? '1px solid #7f1d1d' : '1px solid #2a2d3a',
              background: canDelete ? '#1c0a0a' : 'none',
              color: canDelete ? '#f87171' : '#374151',
              cursor: canDelete ? 'pointer' : 'not-allowed', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (canDelete) e.currentTarget.style.background = '#2d1010' }}
            onMouseLeave={e => { if (canDelete) e.currentTarget.style.background = '#1c0a0a' }}
          >
            {canDelete ? 'Delete this node' : 'Cannot delete last node'}
          </button>

        </div>
      </div>
    )
  }
)

export default NodeSettingsPopover