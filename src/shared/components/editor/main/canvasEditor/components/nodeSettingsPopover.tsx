import React from 'react'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '../constants'
import type { LessonNode, LessonNodeType, QuizData } from '@/shared/types'

interface NodeSettingsPopoverProps {
  x: number
  y: number
  node: LessonNode
  allNodes: LessonNode[]
  canDelete: boolean
  onChangeType: (type: LessonNodeType) => void
  onChangeNextNode: (id: string | null) => void
  onChangeHintNode: (id: string | null) => void
  onUpdateQuiz: (quiz: QuizData) => void
  onDelete: () => void
  onClose: () => void
}

const POPOVER_W = 280
const POPOVER_MAX_H = 520

const inputCss: React.CSSProperties = {
  width: '100%', marginTop: 4, fontSize: 12,
  padding: '5px 8px', borderRadius: 6,
  border: '1px solid #2a2d3a',
  background: '#0a0c12', color: '#e2e8f0',
  boxSizing: 'border-box', outline: 'none'
}

const labelCss: React.CSSProperties = {
  display: 'block', fontSize: 11,
  color: '#6b7280', marginBottom: 10
}

const NodeSettingsPopover = React.forwardRef<HTMLDivElement, NodeSettingsPopoverProps>(
  function NodeSettingsPopover(props, ref) {
    const {
      x, y, node, allNodes, canDelete,
      onChangeType, onChangeNextNode, onChangeHintNode,
      onUpdateQuiz, onDelete, onClose
    } = props

    // Smart positioning — don't overflow viewport
    const safeX = Math.min(x, window.innerWidth - POPOVER_W - 16)
    const flipUp = y + POPOVER_MAX_H > window.innerHeight - 16
    const safeY = flipUp ? Math.max(16, y - POPOVER_MAX_H) : y

    const otherNodes = allNodes.filter(n => n.id !== node.id)
    const nodeIndex = allNodes.indexOf(node)
    const color = NODE_TYPE_COLOR[node.type]

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
          zIndex: 1000,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '10px 14px',
          background: '#0f1117',
          borderBottom: `1px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
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

          <label style={labelCss}>
            Node type
            <select
              value={node.type}
              onChange={e => onChangeType(e.target.value as LessonNodeType)}
              style={inputCss}
            >
              <option value="explanation">Explanation</option>
              <option value="example">Example</option>
              <option value="quiz">Quiz</option>
              <option value="hint">Hint</option>
              <option value="result">Result</option>
            </select>
          </label>

          <label style={labelCss}>
            Next node
            <select
              value={node.nextNodeId ?? ''}
              onChange={e => onChangeNextNode(e.target.value || null)}
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

          {node.type === 'quiz' && (
            <label style={labelCss}>
              On wrong answer
              <select
                value={node.hintNodeId ?? ''}
                onChange={e => onChangeHintNode(e.target.value || null)}
                style={inputCss}
              >
                <option value=''>— Stay on quiz —</option>
                {otherNodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {allNodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                  </option>
                ))}
              </select>
            </label>
          )}

          {node.type === 'quiz' && (
            <>
              <div style={{ height: 1, background: '#2a2d3a', margin: '4px 0 12px' }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#f59e0b', marginBottom: 10 }}>
                QUIZ SETTINGS
              </div>

              <label style={labelCss}>
                Question
                <textarea
                  value={node.quiz?.question ?? ''}
                  onChange={e => onUpdateQuiz({ ...node.quiz!, question: e.target.value })}
                  rows={3}
                  style={{ ...inputCss, resize: 'vertical' }}
                />
              </label>

              {(node.quiz?.choices ?? ['', '', '', '']).map((choice, i) => (
                <label key={i} style={{ ...labelCss, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <input
                      type="radio"
                      name={`correct_${node.id}`}
                      checked={node.quiz?.correctIndex === i}
                      onChange={() => onUpdateQuiz({ ...node.quiz!, correctIndex: i })}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span style={{
                      fontSize: 11,
                      color: node.quiz?.correctIndex === i ? '#86efac' : '#6b7280',
                      fontWeight: node.quiz?.correctIndex === i ? 600 : 400
                    }}>
                      Choice {i + 1}{node.quiz?.correctIndex === i ? ' ✓' : ''}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={choice}
                    onChange={e => {
                      const choices = [...(node.quiz?.choices ?? ['', '', '', ''])]
                      choices[i] = e.target.value
                      onUpdateQuiz({ ...node.quiz!, choices })
                    }}
                    style={inputCss}
                  />
                </label>
              ))}
            </>
          )}

          <div style={{ height: 1, background: '#2a2d3a', margin: '8px 0 12px' }} />

          <button
            onClick={onDelete}
            disabled={!canDelete}
            style={{
              width: '100%', padding: '7px 0', fontSize: 12,
              borderRadius: 6,
              border: canDelete ? '1px solid #7f1d1d' : '1px solid #2a2d3a',
              background: canDelete ? '#1c0a0a' : 'none',
              color: canDelete ? '#f87171' : '#374151',
              cursor: canDelete ? 'pointer' : 'not-allowed',
              transition: 'all 0.12s'
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