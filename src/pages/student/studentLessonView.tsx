/**
 * studentLessonView.tsx
 *
 * Node runner engine for student lesson viewing.
 */
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useLesson } from '../../hooks/useLesson'
import { useProgress } from '../../hooks/useProgress'
import { progressApi } from '../../api/progressApi'
import type {
  LessonNode,
  CanvasElement,
  CanvasData,
  TextElementProps,
  ImageElementProps,
  ShapeElementProps
} from '../../types'

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

// ── Canvas renderers ───────────────────────────────────────────────────────

function TextRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as TextElementProps
  return (
    <div style={{
      position: 'absolute',
      left: element.x, top: element.y,
      width: element.width, height: element.height,
      fontSize: p.fontSize, color: p.color,
      fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
      fontWeight: p.fontStyle === 'bold' ? 'bold' : 'normal',
      textAlign: p.align || 'left',
      overflow: 'hidden', whiteSpace: 'pre-wrap',
      wordBreak: 'break-word', lineHeight: 1.2, boxSizing: 'border-box'
    }}>
      {p.text}
    </div>
  )
}

function ImageRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ImageElementProps
  return (
    <img src={p.url} alt={p.alt} style={{
      position: 'absolute',
      left: element.x, top: element.y,
      width: element.width, height: element.height,
      objectFit: 'contain'
    }} />
  )
}

function ShapeRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as ShapeElementProps
  return (
    <div style={{
      position: 'absolute',
      left: element.x, top: element.y,
      width: element.width, height: element.height,
      background: p.fill,
      border: `${p.strokeWidth}px solid ${p.stroke}`,
      borderRadius: p.shape === 'ellipse' ? '50%' : '0',
      boxSizing: 'border-box'
    }} />
  )
}

function CanvasRenderer({ canvasData, scale }: { canvasData: CanvasData; scale: number }) {
  const { canvas, elements } = canvasData
  return (
    <div style={{
      position: 'relative',
      width: canvas.width, height: canvas.height,
      background: canvas.background,
      ...(canvas.backgroundImage ? {
        backgroundImage: `url(${canvas.backgroundImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      } : {}),
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      marginBottom: canvas.height * (scale - 1),
      overflow: 'hidden'
    }}>
      {elements.map(el => {
        if (el.type === 'text') return <TextRenderer key={el.id} element={el} />
        if (el.type === 'image') return <ImageRenderer key={el.id} element={el} />
        if (el.type === 'shape') return <ShapeRenderer key={el.id} element={el} />
        return null
      })}
    </div>
  )
}

const NODE_TYPE_COLOR: Record<string, string> = {
  explanation: '#3b82f6', example: '#8b5cf6',
  quiz: '#f59e0b', hint: '#10b981', result: '#ef4444'
}

const NODE_TYPE_LABEL: Record<string, string> = {
  explanation: 'Explanation', example: 'Example',
  quiz: 'Quiz', hint: 'Hint', result: 'Result'
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StudentLessonView() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()
  const navigate = useNavigate()

  const { data: lesson, loading: lessonLoading, error: lessonError } = useLesson(lessonId, token)
  const { data: progressList, loading: progressLoading, error: progressError } = useProgress(token)

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalQuizNodes, setTotalQuizNodes] = useState(0)
  const [lessonDone, setLessonDone] = useState(false)
  const [reward, setReward] = useState<CompleteResponse | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Initialize node state when lesson loads
  useEffect(() => {
    if (!lesson?.contentJson?.nodes?.length) return
    setCurrentNodeId(lesson.contentJson.nodes[0].id)
    setTotalQuizNodes(lesson.contentJson.nodes.filter(n => n.type === 'quiz').length)
  }, [lesson])

  // Scale canvas to container
  useEffect(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.offsetWidth
    setScale(Math.min(1, containerWidth / 1280))
  }, [lesson, currentNodeId])

  const alreadyCompleted = progressList.some(
    p => p.lessonId === Number(lessonId) && p.completed
  )

  const currentNode: LessonNode | null = lesson?.contentJson?.nodes?.find(
    n => n.id === currentNodeId
  ) ?? null

  async function handleLessonComplete() {
    if (lessonDone || alreadyCompleted || !token) return
    setLessonDone(true)
    setCompleting(true)
    try {
      const score = totalQuizNodes > 0
        ? Math.round((correctCount / totalQuizNodes) * 100)
        : 100
      const res = await progressApi.completeLesson(
        { lessonId: Number(lessonId), score },
        token
      )
      setReward(res)
    } catch (err: unknown) {
      setCompleteError(err instanceof Error ? err.message : 'Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  function goToNode(nodeId: string | null) {
    const nodes = lesson?.contentJson?.nodes ?? []
    if (!nodeId) {
      const currentIndex = nodes.findIndex(n => n.id === currentNodeId)
      const nextNode = nodes[currentIndex + 1]
      if (nextNode) {
        setCurrentNodeId(nextNode.id)
        setSelectedChoice(null)
        setAnswerFeedback(null)
        return
      }
      handleLessonComplete()
      return
    }
    const next = nodes.find(n => n.id === nodeId)
    if (!next) { handleLessonComplete(); return }
    if (next.type === 'result') {
      setCurrentNodeId(nodeId)
      setTimeout(() => handleLessonComplete(), 1500)
      return
    }
    setCurrentNodeId(nodeId)
    setSelectedChoice(null)
    setAnswerFeedback(null)
  }

  function handleAnswer() {
    if (!currentNode?.quiz || selectedChoice === null) return
    const isCorrect = selectedChoice === currentNode.quiz.correctIndex
    if (isCorrect) {
      setAnswerFeedback('correct')
      setCorrectCount(prev => prev + 1)
      setTimeout(() => { setAnswerFeedback(null); goToNode(currentNode.nextNodeId) }, 1000)
    } else {
      setAnswerFeedback('wrong')
      setTimeout(() => {
        setAnswerFeedback(null)
        setSelectedChoice(null)
        if (currentNode.hintNodeId) goToNode(currentNode.hintNodeId)
      }, 1000)
    }
  }

  if (lessonLoading || progressLoading) return <div>Loading...</div>
  if (lessonError) return <div>Error: {lessonError}</div>
  if (progressError) return <div>Error: {progressError}</div>
  if (!lesson || !lesson.contentJson) return <div>Lesson not found</div>
  if (!currentNode) return <div>No nodes in this lesson.</div>

  // Review mode
  if (alreadyCompleted && !lessonDone) {
    return (
      <div>
        <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back</button>
        <h1>{lesson.title}</h1>
        <p>✅ You have already completed this lesson.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {lesson.contentJson.nodes.map((node, index) => (
            <div key={node.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_TYPE_COLOR[node.type] }} />
                <span style={{ fontSize: 13, color: '#555' }}>{index + 1}. {NODE_TYPE_LABEL[node.type]}</span>
              </div>
              <div ref={index === 0 ? containerRef : null} style={{ width: '100%', overflowX: 'hidden' }}>
                <CanvasRenderer canvasData={node.contentJson} scale={scale} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Completion screen
  if (lessonDone) {
    return (
      <div>
        <h1>🎉 Lesson Complete!</h1>
        {completing ? <p>Saving your progress...</p> : reward ? (
          <div>
            <p>+{reward.xpEarned} XP earned!</p>
            <p>Total XP: {reward.totalXP}</p>
            <p>Level: {reward.level}</p>
            {totalQuizNodes > 0 && (
              <p>Quiz score: {Math.round((correctCount / totalQuizNodes) * 100)}%</p>
            )}
            {reward.newBadges.length > 0 && (
              <div>
                <p>🏅 New badges:</p>
                {reward.newBadges.map(badge => (
                  <div key={badge.id}><strong>{badge.name}</strong> — {badge.description}</div>
                ))}
              </div>
            )}
          </div>
        ) : null}
        {completeError && <p style={{ color: 'red' }}>{completeError}</p>}
        <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back to classroom</button>
      </div>
    )
  }

  // Active lesson
  return (
    <div>
      <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back</button>
      <h1>{lesson.title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_TYPE_COLOR[currentNode.type] }} />
        <span style={{ fontSize: 13, color: '#555' }}>{NODE_TYPE_LABEL[currentNode.type]}</span>
        <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
          Node {lesson.contentJson.nodes.findIndex(n => n.id === currentNodeId) + 1} of {lesson.contentJson.nodes.length}
        </span>
      </div>

      <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
        <CanvasRenderer canvasData={currentNode.contentJson} scale={scale} />
      </div>

      {currentNode.type === 'quiz' && currentNode.quiz && (
        <div style={{ marginBottom: 24 }}>
          <h3>{currentNode.quiz.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentNode.quiz.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => setSelectedChoice(i)}
                style={{
                  padding: '10px 16px', textAlign: 'left',
                  border: selectedChoice === i ? '2px solid #3b82f6' : '1px solid #ddd',
                  borderRadius: 6,
                  background: selectedChoice === i ? '#eff6ff' : '#fff',
                  cursor: 'pointer', fontSize: 14
                }}
              >
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
            <button onClick={handleAnswer} disabled={selectedChoice === null} style={{ marginTop: 12, padding: '8px 24px' }}>
              Submit Answer
            </button>
          )}
        </div>
      )}

      {currentNode.type !== 'quiz' && (
        <button onClick={() => goToNode(currentNode.nextNodeId)}>
          {currentNode.nextNodeId ? 'Next →' : 'Finish Lesson'}
        </button>
      )}
    </div>
  )
}