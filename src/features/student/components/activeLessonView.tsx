import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ViewerStage } from '@/shared/components/editor/stages'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '@/shared/components/editor/canvasEditor/constants'
import DragMatch from './interactions/dragMatch'
import type { LessonNode, LessonGraph, DragItemProps, DragTargetProps } from '@/shared/types'

interface Props {
  title: string
  graph: LessonGraph
  currentNode: LessonNode
  currentNodeId: string
  classroomId: string

  selectedChoice: number | null
  answerFeedback: 'correct' | 'wrong' | null
  onSelectChoice: (i: number) => void
  onAnswer: () => void

  feedback: 'correct' | 'wrong' | null
  hintsUsed: number
  questionFinished: boolean
  submitAnswer: (answer: unknown, correct: boolean) => void
  useHint: (hintIndex: number) => void
  giveUp: () => void

  onNext: (nodeId: string | null) => void
}

function detectInteractionType(node: LessonNode): 'drag-match' | 'mc' | 'none' {
  const els = node.contentJson.elements
  if (els.some(el => el.type === 'drag-item' || el.type === 'drag-target')) return 'drag-match'
  if (els.some(el => el.type === 'mc-option')) return 'mc'
  return 'none'
}

export default function ActiveLessonView({
  title, graph, currentNode, currentNodeId, classroomId,
  selectedChoice, answerFeedback,
  onSelectChoice, onAnswer,
  feedback, hintsUsed, questionFinished,
  submitAnswer, useHint, giveUp,
  onNext
}: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return
    setScale(Math.min(1, containerRef.current.offsetWidth / 1280))
  }, [currentNodeId])

  const interactionType = currentNode.type === 'quiz'
    ? detectInteractionType(currentNode)
    : 'none'

  const hints = currentNode.quiz?.question ? [currentNode.quiz.question] : []

  const nextLabel = currentNode.nextNodeId ? 'Next →' : 'Finish Lesson'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px' }}>

      <button onClick={() => navigate(`/student/classrooms/${classroomId}`)}
        style={{ marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}>
        ← Back
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_TYPE_COLOR[currentNode.type] }} />
        <span style={{ fontSize: 13, color: '#555' }}>{NODE_TYPE_LABEL[currentNode.type]}</span>
        <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
          {graph.nodes.findIndex(n => n.id === currentNodeId) + 1} / {graph.nodes.length}
        </span>
      </div>

      {/* ── DRAG MATCH ── */}
      {currentNode.type === 'quiz' && interactionType === 'drag-match' && (
        <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
          <DragMatch
            canvasData={currentNode.contentJson}
            scale={scale}
            disabled={questionFinished}
            hints={hints}
            onSubmit={(answer, correct) => submitAnswer(answer, correct)}
            onHint={hintIndex => useHint(hintIndex)}
          />

          {!questionFinished && (
            <button
              onClick={giveUp}
              style={{
                marginTop: 8, padding: '6px 16px', fontSize: 12,
                background: 'none', border: '1px solid #d1d5db',
                borderRadius: 6, color: '#9ca3af', cursor: 'pointer'
              }}
            >
              Give Up
            </button>
          )}

          {questionFinished && (
            <div style={{ marginTop: 12 }}>
              {feedback === 'correct'
                ? <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>✅ Correct! Great job.</p>
                : <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Question skipped — keep going!</p>
              }
              <button
                onClick={() => onNext(currentNode.nextNodeId)}
                style={{
                  padding: '10px 28px', fontSize: 14, fontWeight: 600,
                  background: '#3b82f6', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer'
                }}
              >
                {nextLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MULTIPLE CHOICE ── */}
      {currentNode.type === 'quiz' && interactionType === 'mc' && (
        <div ref={containerRef} style={{ width: '100%', marginBottom: 24 }}>
          <ViewerStage canvasData={currentNode.contentJson} scale={scale} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {currentNode.contentJson.elements
              .filter(el => el.type === 'mc-option')
              .sort((a, b) => (a.props as any).index - (b.props as any).index)
              .map(el => {
                const p = el.props as any
                const isSelected = selectedChoice === p.index
                return (
                  <button
                    key={el.id}
                    onClick={() => !questionFinished && onSelectChoice(p.index)}
                    style={{
                      padding: '10px 20px', fontSize: 14, borderRadius: 8,
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      background: feedback === 'correct' && isSelected ? '#dcfce7'
                        : feedback === 'wrong' && isSelected ? '#fee2e2'
                        : isSelected ? '#eff6ff' : p.color,
                      color: p.textColor,
                      cursor: questionFinished ? 'default' : 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                      minWidth: 120
                    }}
                  >
                    {p.label}
                  </button>
                )
              })}
          </div>

          {feedback === 'correct' && <p style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 8 }}>✅ Correct!</p>}
          {feedback === 'wrong'   && <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 8 }}>❌ Wrong. Try again!</p>}

          {!feedback && !questionFinished && (
            <button onClick={onAnswer} disabled={selectedChoice === null}
              style={{ marginTop: 12, padding: '8px 24px', fontSize: 14, borderRadius: 8,
                background: selectedChoice !== null ? '#3b82f6' : '#e5e7eb',
                color: selectedChoice !== null ? '#fff' : '#9ca3af',
                border: 'none', cursor: selectedChoice !== null ? 'pointer' : 'not-allowed' }}>
              Submit Answer
            </button>
          )}
          {questionFinished && (
            <button onClick={() => onNext(currentNode.nextNodeId)}
              style={{ marginTop: 12, padding: '10px 28px', fontSize: 14, fontWeight: 600,
                background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              {nextLabel}
            </button>
          )}
        </div>
      )}

      {/* ── LEGACY quiz ── */}
      {currentNode.type === 'quiz' && interactionType === 'none' && currentNode.quiz && (
        <div style={{ marginBottom: 24 }}>
          <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 16 }}>
            <ViewerStage canvasData={currentNode.contentJson} scale={scale} />
          </div>
          <h3 style={{ marginBottom: 12 }}>{currentNode.quiz.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentNode.quiz.choices.map((choice, i) => (
              <button key={i} onClick={() => onSelectChoice(i)} style={{
                padding: '10px 16px', textAlign: 'left',
                border: selectedChoice === i ? '2px solid #3b82f6' : '1px solid #ddd',
                borderRadius: 6, background: selectedChoice === i ? '#eff6ff' : '#fff',
                cursor: 'pointer', fontSize: 14
              }}>
                {choice}
              </button>
            ))}
          </div>
          {answerFeedback === 'correct' && <p style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 8 }}>✅ Correct!</p>}
          {answerFeedback === 'wrong' && (
            <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 8 }}>
              ❌ Wrong. {currentNode.hintNodeId ? 'Check the hint!' : 'Try again!'}
            </p>
          )}
          {!answerFeedback && (
            <button onClick={onAnswer} disabled={selectedChoice === null}
              style={{ marginTop: 12, padding: '8px 24px' }}>
              Submit Answer
            </button>
          )}
        </div>
      )}

      {/* ── Non-quiz nodes ── */}
      {currentNode.type !== 'quiz' && (
        <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
          <ViewerStage canvasData={currentNode.contentJson} scale={scale} />
          <button onClick={() => onNext(currentNode.nextNodeId)}
            style={{ marginTop: 16, padding: '10px 28px', fontSize: 14, fontWeight: 600,
              background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            {nextLabel}
          </button>
        </div>
      )}

    </div>
  )
}