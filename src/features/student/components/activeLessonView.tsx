import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ViewerStage } from '@/shared/components/editor/stages'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '@/shared/components/editor/canvasEditor/constants'
import { BLANK_CANVAS } from '@/shared/components/editor/canvasEditor/constants'
import DragMatch from './interactions/dragMatch'
import type { LessonNode, LessonGraph, Question, CanvasData } from '@/shared/types'

interface Props {
  title: string
  graph: LessonGraph
  currentNode: LessonNode
  currentNodeId: string
  classroomId: string
  currentQuestion: Question | null  // ← added

  isInteractiveNode: boolean
  currentQuestionId: number | null
  questionIndex: number
  nodeQuestionCount: number
  nodeCorrectCount: number
  nodeRetries: number

  feedback: 'correct' | 'wrong' | null
  hintsUsed: number
  attempts: number
  questionFinished: boolean
  attemptLoading: boolean
  attemptError: string | null

  submitAnswer: (answer: unknown) => void
  useHint: (hintIndex: number) => void
  giveUp: () => void
  advanceQuestion: () => void
  advanceAlways: () => void
}

function detectInteractionType(question: Question | null): 'drag-match' | 'mc' | 'none' {
  const els = question?.contentJson?.canvas?.elements ?? []
  if (els.some(el => el.type === 'drag-item' || el.type === 'drag-target')) return 'drag-match'
  if (els.some(el => el.type === 'mc-option')) return 'mc'
  return 'none'
}

export default function ActiveLessonView({
  title, graph, currentNode, currentNodeId, classroomId,
  currentQuestion,
  isInteractiveNode, currentQuestionId, questionIndex, nodeQuestionCount,
  nodeCorrectCount, nodeRetries,
  feedback, hintsUsed, attempts, questionFinished, attemptLoading, attemptError,
  submitAnswer, useHint, giveUp,
  advanceQuestion, advanceAlways,
}: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    setScale(Math.min(1, containerRef.current.offsetWidth / 1280))
  }, [currentNodeId, questionIndex])

  useEffect(() => { setSelectedChoice(null) }, [currentQuestionId])

  const interactionType = isInteractiveNode ? detectInteractionType(currentQuestion) : 'none'
  const questionCanvas: CanvasData = currentQuestion?.contentJson?.canvas ?? BLANK_CANVAS
  const isLastQuestion = questionIndex === nodeQuestionCount - 1
  const nextQuestionLabel = isLastQuestion
    ? 'Finish Stage →'
    : `Next Question → (${questionIndex + 1}/${nodeQuestionCount})`

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px' }}>

      <button
        onClick={() => navigate(`/student/classrooms/${classroomId}`)}
        style={{ marginBottom: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6b7280' }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_TYPE_COLOR[currentNode.type] }} />
        <span style={{ fontSize: 13, color: '#555' }}>{NODE_TYPE_LABEL[currentNode.type]}</span>

        {isInteractiveNode && nodeQuestionCount > 0 && (
          <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
            Question {questionIndex + 1} of {nodeQuestionCount}
          </span>
        )}

        {isInteractiveNode && nodeRetries > 0 && (
          <span style={{ fontSize: 11, color: '#f59e0b', marginLeft: 8 }}>
            Retry {nodeRetries}
          </span>
        )}

        {isInteractiveNode && questionIndex > 0 && (
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
            {nodeCorrectCount}/{questionIndex} correct
          </span>
        )}
      </div>

      {attemptError && (
        <div style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 6, fontSize: 12, color: '#dc2626', marginBottom: 12 }}>
          {attemptError}
        </div>
      )}

      {/* ── DRAG MATCH ── */}
      {isInteractiveNode && interactionType === 'drag-match' && (
        <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
          <DragMatch
            canvasData={questionCanvas}
            scale={scale}
            disabled={questionFinished || attemptLoading}
            hints={currentQuestion?.contentJson?.hints ?? []}
            onSubmit={(answer) => submitAnswer(answer)}
            onHint={hintIndex => useHint(hintIndex)}
          />

          {!questionFinished && (
            <button
              onClick={giveUp}
              disabled={attemptLoading}
              style={{
                marginTop: 8, padding: '6px 16px', fontSize: 12,
                background: 'none', border: '1px solid #d1d5db',
                borderRadius: 6, color: '#9ca3af', cursor: 'pointer',
              }}
            >
              Give Up
            </button>
          )}

          {questionFinished && (
            <div style={{ marginTop: 12 }}>
              {feedback === 'correct'
                ? <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>✅ Correcttt!</p>
                : <p style={{ color: '#6b7280', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Skipped — keep going!</p>
              }
              <button
                onClick={advanceQuestion}
                style={{ padding: '10px 28px', fontSize: 14, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                {nextQuestionLabel}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MULTIPLE CHOICE ── */}
      {isInteractiveNode && interactionType === 'mc' && (
        <div ref={containerRef} style={{ width: '100%', marginBottom: 24 }}>
          <ViewerStage canvasData={questionCanvas} scale={scale} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {questionCanvas.elements
              .filter(el => el.type === 'mc-option')
              .sort((a, b) => (a.props as any).index - (b.props as any).index)
              .map(el => {
                const p = el.props as any
                const isSelected = selectedChoice === p.index
                return (
                  <button
                    key={el.id}
                    onClick={() => !questionFinished && setSelectedChoice(p.index)}
                    style={{
                      padding: '10px 20px', fontSize: 14, borderRadius: 8,
                      border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                      background: feedback === 'correct' && isSelected ? '#dcfce7'
                        : feedback === 'wrong' && isSelected ? '#fee2e2'
                        : isSelected ? '#eff6ff' : p.color,
                      color: p.textColor,
                      cursor: questionFinished ? 'default' : 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                      minWidth: 120,
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
            <button
              onClick={() => { if (selectedChoice !== null) submitAnswer(selectedChoice) }}
              disabled={selectedChoice === null || attemptLoading}
              style={{
                marginTop: 12, padding: '8px 24px', fontSize: 14, borderRadius: 8,
                background: selectedChoice !== null ? '#3b82f6' : '#e5e7eb',
                color: selectedChoice !== null ? '#fff' : '#9ca3af',
                border: 'none', cursor: selectedChoice !== null ? 'pointer' : 'not-allowed',
              }}
            >
              Submit Answer
            </button>
          )}

          {questionFinished && (
            <button
              onClick={advanceQuestion}
              style={{ marginTop: 12, padding: '10px 28px', fontSize: 14, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              {nextQuestionLabel}
            </button>
          )}
        </div>
      )}

      {/* ── No questions attached ── */}
      {isInteractiveNode && interactionType === 'none' && (
        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
          No questions attached to this node yet.
        </div>
      )}

      {/* ── Hook / Teach / Reward ── */}
      {!isInteractiveNode && (
        <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
          <ViewerStage canvasData={currentNode.content} scale={scale} />
          <button
            onClick={advanceAlways}
            style={{ marginTop: 16, padding: '10px 28px', fontSize: 14, fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {currentNode.transitions.length === 0 ? 'Finish Lesson' : 'Next →'}
          </button>
        </div>
      )}

    </div>
  )
}