import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ViewerStage } from '@/shared/components/editor/stages'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '@/shared/components/editor/canvasEditor/constants'
import { BLANK_CANVAS } from '@/shared/components/editor/canvasEditor/constants'
import DragMatch from '../../../shared/components/interactions/dragMatch'
import type {
  LessonNode, LessonGraph, Question, CanvasData,
  DragMatchContent, MultipleChoiceContent, McOptionProps
} from '@/shared/types'

interface Props {
  title: string
  graph: LessonGraph
  currentNode: LessonNode
  currentNodeId: string
  classroomId: string
  currentQuestion: Question | null

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
  if (!question) return 'none'
  if (question.templateType === 'DRAG_MATCH')      return 'drag-match'
  if (question.templateType === 'MULTIPLE_CHOICE') return 'mc'
  return 'none'
}

function useViewportScale(cw: number, ch: number) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    function recalc() {
      setScale(Math.min(window.innerWidth / cw, window.innerHeight / ch))
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [cw, ch])
  return scale
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
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  useEffect(() => { setSelectedChoiceId(null) }, [currentQuestionId])

  const interactionType = detectInteractionType(currentQuestion)

  // Node canvas is always the visual base — teacher-authored slide
  const nodeCanvas: CanvasData = currentNode.content ?? BLANK_CANVAS

  // Question canvas is used only for interaction element positioning (drag-items, targets, mc-options)
  const questionCanvas: CanvasData =
    (currentQuestion?.contentJson as DragMatchContent | MultipleChoiceContent)?.canvas ?? BLANK_CANVAS

  const { width: CW, height: CH } = nodeCanvas.canvas
  const scale = useViewportScale(CW, CH)

  const dragMatchContent: DragMatchContent | null =
    interactionType === 'drag-match' && currentQuestion
      ? (currentQuestion.contentJson as DragMatchContent)
      : null

  const mcContent: MultipleChoiceContent | null =
    interactionType === 'mc' && currentQuestion
      ? (currentQuestion.contentJson as MultipleChoiceContent)
      : null

  const isLastQuestion = questionIndex === nodeQuestionCount - 1
  const nextLabel = isLastQuestion
    ? 'Finish Stage →'
    : `Next → (${questionIndex + 1}/${nodeQuestionCount})`

  const pill: React.CSSProperties = {
    background: 'rgba(0,0,0,0.50)',
    backdropFilter: 'blur(6px)',
    borderRadius: 8,
    padding: '6px 12px',
    color: '#f3f4f6',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#111', overflow: 'hidden' }}>

      {/* ── Canvas layer ── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        width: CW, height: CH,
      }}>

        {/* DRAG MATCH — node canvas as visual base, question canvas for element positions */}
        {isInteractiveNode && interactionType === 'drag-match' && dragMatchContent && (
          <div style={{ position: 'relative', width: CW, height: CH }}>
            <ViewerStage canvasData={nodeCanvas} scale={1} />
            <div style={{ position: 'absolute', inset: 0 }}>
              <DragMatch
                content={dragMatchContent}
                canvasData={questionCanvas}
                scale={1}
                disabled={questionFinished || attemptLoading}
                onSubmit={submitAnswer}
                onHint={useHint}
              />
            </div>
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {isInteractiveNode && interactionType === 'mc' && mcContent && (
          <div style={{ position: 'relative', width: CW, height: CH }}>
            <ViewerStage canvasData={nodeCanvas} scale={1} />

            {mcContent.choices.map((choice, i) => {
              const el = questionCanvas.elements.filter(e => e.type === 'mc-option')[i]
              if (!el) return null

              const isSelected = selectedChoiceId === choice.id
              const isCorrect  = questionFinished && choice.id === mcContent.correctId
              const isWrong    = questionFinished && isSelected && choice.id !== mcContent.correctId
              const baseColor  = (el.props as McOptionProps).color  // ← read color from canvas

              return (
                <div
                  key={choice.id}
                  onClick={() => { if (!questionFinished && !attemptLoading) setSelectedChoiceId(choice.id) }}
                  style={{
                    position: 'absolute',
                    left: el.x, top: el.y,
                    width: el.width, height: el.height,
                    borderRadius: 8, boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: questionFinished ? 'default' : 'pointer',
                    background: isCorrect  ? '#22c55e33'
                              : isWrong    ? '#ef444433'
                              : isSelected ? '#3b82f633'
                              : baseColor,
                    border: isCorrect  ? '3px solid #22c55e'
                          : isWrong    ? '3px solid #ef4444'
                          : isSelected ? '3px solid #3b82f6'
                          : '2px solid transparent',
                    transition: 'border 0.15s, background 0.15s',
                    opacity: isWrong ? 0.7 : 1,
                  }}
                >
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#ffffff',
                    textAlign: 'center',
                    padding: '0 12px',
                    pointerEvents: 'none',
                  }}>
                    {choice.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}


        {/* HOOK / TEACH / REWARD */}
        {!isInteractiveNode && (
          <ViewerStage canvasData={nodeCanvas} scale={1} />
        )}

        {/* No questions attached */}
        {isInteractiveNode && interactionType === 'none' && (
          <div style={{
            width: CW, height: CH,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280', fontSize: 20,
          }}>
            No questions attached to this node yet.
          </div>
        )}
      </div>

      {/* ── UI overlay ── */}

      {/* Back */}
      <button
        onClick={() => navigate(`/student/classrooms/${classroomId}`)}
        style={{
          position: 'fixed', top: 14, left: 16, zIndex: 20,
          ...pill, cursor: 'pointer', border: 'none',
        }}
      >
        ← Back
      </button>

      {/* Node type + progress */}
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 20, ...pill }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: NODE_TYPE_COLOR[currentNode.type], flexShrink: 0 }} />
        <span>{NODE_TYPE_LABEL[currentNode.type]}</span>
        {isInteractiveNode && nodeQuestionCount > 0 && (
          <span style={{ color: '#9ca3af' }}>{questionIndex + 1}/{nodeQuestionCount}</span>
        )}
        {isInteractiveNode && nodeRetries > 0 && (
          <span style={{ color: '#f59e0b' }}>retry {nodeRetries}</span>
        )}
        {isInteractiveNode && questionIndex > 0 && (
          <span style={{ color: '#9ca3af' }}>{nodeCorrectCount}/{questionIndex} ✓</span>
        )}
      </div>

      {/* Error */}
      {attemptError && (
        <div style={{
          position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 20,
          background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: 8, padding: '8px 20px', fontSize: 13, color: '#dc2626',
        }}>
          {attemptError}
        </div>
      )}

      {/* ── Bottom action bar ── */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>

        {feedback === 'correct' && (
          <div style={{ ...pill, background: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: 15 }}>
            ✅ Correct!
          </div>
        )}
        {feedback === 'wrong' && !questionFinished && (
          <div style={{ ...pill, background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 15 }}>
            ❌ Wrong — try again!
          </div>
        )}

        {/* MC actions */}
        {isInteractiveNode && interactionType === 'mc' && !questionFinished && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { if (selectedChoiceId) submitAnswer(selectedChoiceId) }}
              disabled={!selectedChoiceId || attemptLoading}
              style={{
                padding: '11px 30px', fontSize: 14, fontWeight: 600,
                borderRadius: 9, border: 'none',
                background: selectedChoiceId ? '#3b82f6' : '#374151',
                color: selectedChoiceId ? '#fff' : '#6b7280',
                cursor: selectedChoiceId ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              Submit Answer
            </button>
            <button
              onClick={giveUp}
              disabled={attemptLoading}
              style={{ padding: '11px 18px', fontSize: 12, ...pill, cursor: 'pointer', border: 'none' }}
            >
              Give Up
            </button>
          </div>
        )}

        {/* Drag-match give-up */}
        {isInteractiveNode && interactionType === 'drag-match' && !questionFinished && (
          <button
            onClick={giveUp}
            disabled={attemptLoading}
            style={{ padding: '8px 20px', fontSize: 12, ...pill, cursor: 'pointer', border: 'none' }}
          >
            Give Up
          </button>
        )}

        {/* Advance after question finished */}
        {questionFinished && isInteractiveNode && (
          <button
            onClick={advanceQuestion}
            style={{
              padding: '13px 40px', fontSize: 15, fontWeight: 700,
              background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
            }}
          >
            {nextLabel}
          </button>
        )}

        {/* Non-interactive advance */}
        {!isInteractiveNode && (
          <button
            onClick={advanceAlways}
            style={{
              padding: '13px 40px', fontSize: 15, fontWeight: 700,
              background: '#3b82f6', color: '#fff',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
            }}
          >
            {currentNode.transitions.length === 0 ? 'Finish Lesson' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  )
}