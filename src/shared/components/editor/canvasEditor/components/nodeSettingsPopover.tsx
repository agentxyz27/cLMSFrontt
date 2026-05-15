import React, { useState } from 'react'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '../constants'
import type {
  LessonNode,
  LessonNodeType,
  TransitionCondition,
  Question
} from '@/shared/types'
import QuestionConfigModal from '@/shared/components/editor/builders/questionConfigModal'
import { questionApi } from '@/shared/api/questionApi'

interface NodeSettingsPopoverProps {
  x: number
  y: number
  modalRef?: React.RefObject<HTMLDivElement | null>
  node: LessonNode
  allNodes: LessonNode[]
  canDelete: boolean
  lessonId: number
  token: string | null
  onChangeType: (type: LessonNodeType) => void
  onSetTransition: (condition: TransitionCondition, targetNodeId: string | null) => void
  onAddQuestionId: (nodeId: string, questionId: number) => void
  onSelectQuestion: (questionId: number) => void
  onRemoveQuestionId: (nodeId: string, questionId: number) => void
  onDelete: () => void
  onClose: () => void
}

const POPOVER_W     = 300
const POPOVER_MAX_H = 580

const BRANCHING_NODE_TYPES: LessonNodeType[] = ['practice', 'mastery']
const QUESTION_NODE_TYPES:  LessonNodeType[] = ['practice', 'mastery']

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
      lessonId, token, modalRef,
      onChangeType, onSetTransition, onAddQuestionId, onSelectQuestion, onRemoveQuestionId,
      onDelete, onClose,
    } = props

    const [showQuestionModal, setShowQuestionModal] = useState(false)

    const safeX  = Math.min(x, window.innerWidth - POPOVER_W - 16)
    const flipUp = y + POPOVER_MAX_H > window.innerHeight - 16
    const safeY  = flipUp ? Math.max(16, y - POPOVER_MAX_H) : y

    const otherNodes    = allNodes.filter(n => n.id !== node.id)
    const nodeIndex     = allNodes.indexOf(node)
    const color         = NODE_TYPE_COLOR[node.type]
    const isBranching   = BRANCHING_NODE_TYPES.includes(node.type)
    const needsQuestion = QUESTION_NODE_TYPES.includes(node.type)

    const getTarget = (condition: TransitionCondition): string =>
      (node.transitions ?? []).find(t => t.condition === condition)?.targetNodeId ?? ''

    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [fetchingId, setFetchingId] = useState<number | null>(null)

    async function handleEditQuestion(qid: number) {
      if (!token) return
      setFetchingId(qid)
      try {
        const q = await questionApi.getById(qid, token)
        setEditingQuestion(q)
        setShowQuestionModal(true)
      } catch (err) {
        console.error('Failed to load question', err)
      } finally {
        setFetchingId(null)
      }
    }

    return (
      <>
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
            >×</button>
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

            {/* Questions — practice and mastery only */}
            {needsQuestion && (
              <>
                <div style={{ height: 1, background: '#2a2d3a', margin: '4px 0 12px' }} />
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#10b981', marginBottom: 10 }}>
                  QUESTIONS ({(node.questionIds ?? []).length})
                </div>

                {(node.questionIds ?? []).map((qid, i) => (
                  <div key={qid} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                    background: '#052e16', border: '1px solid #14532d',
                    fontSize: 11, gap: 4,
                  }}>
                    {/* Canvas editor */}
                    <button
                      onClick={() => { onSelectQuestion(qid); onClose() }}
                      style={{ background: 'none', border: 'none', color: '#86efac', cursor: 'pointer', fontSize: 11, padding: 0, flex: 1, textAlign: 'left' }}
                    >
                      ✏️ Q{i + 1} · #{qid}
                    </button>

                    {/* Edit semantic content */}
                    <button
                      onClick={() => handleEditQuestion(qid)}
                      disabled={fetchingId === qid}
                      title="Edit question content"
                      style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 13, padding: '0 4px' }}
                    >
                      {fetchingId === qid ? '…' : '⚙️'}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => onRemoveQuestionId(node.id, qid)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13, padding: 0 }}
                    >×</button>
                  </div>
                ))}

                <button
                  onClick={() => setShowQuestionModal(true)}
                  style={{
                    width: '100%', padding: '7px 0', fontSize: 12,
                    borderRadius: 6, border: '1px solid #14532d',
                    background: '#052e16', color: '#86efac',
                    cursor: 'pointer', transition: 'all 0.12s', marginBottom: 10,
                  }}
                >
                  + Add Question
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

        {/* Question Config Modal */}
        {showQuestionModal && (
          <QuestionConfigModal
            ref={modalRef}
            lessonId={lessonId}
            nodeId={node.id}
            token={token}
            editQuestionId={editingQuestion?.id}
            editTemplateType={editingQuestion?.templateType}
            editTopicId={editingQuestion?.topicId}
            editContent={editingQuestion?.contentJson}
            onSave={(questionId) => {
              if (!editingQuestion) onAddQuestionId(node.id, questionId)
              setShowQuestionModal(false)
              setEditingQuestion(null)
            }}
            onClose={() => {
              setShowQuestionModal(false)
              setEditingQuestion(null)
            }}
          />
        )}
      </>
    )
  }
)

export default NodeSettingsPopover