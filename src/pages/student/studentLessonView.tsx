  /**
   * studentLessonView.tsx
   *
   * Node runner engine for student lesson viewing.
   * Lessons are now a graph of nodes — student progresses through them
   * based on quiz answers and teacher-configured connections.
   *
   * Flow:
   *   - Load lesson → start at first node
   *   - Render current node's canvas
   *   - If quiz node → show MCQ choices
   *   - Correct answer → go to nextNodeId
   *   - Wrong answer  → go to hintNodeId (or stay if none)
   *   - Reach result node or null nextNodeId → lesson complete
   *
   * Completion:
   *   - Score = correct answers / total quiz nodes * 100
   *   - POST /api/gamification/complete with score
   *
   * Endpoints:
   *   GET  /api/lessons/lesson/:id    → load full lesson with LessonContent
   *   GET  /api/progress              → check if already completed
   *   POST /api/gamification/complete → mark complete, earn XP, check badges
   */
  import { useEffect, useState, useRef } from 'react'
  import { useParams, useNavigate } from 'react-router-dom'
  import { useAuth } from '../../context/authContext'
  import { api } from '../../api/api'
  import type {
    Lesson,
    LessonNode,
    CanvasElement,
    CanvasData,
    TextElementProps,
    ImageElementProps,
    ShapeElementProps,
    Progress
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
        width: canvas.width,
        height: canvas.height,
        background: canvas.background,
        ...(canvas.backgroundImage ? {
          backgroundImage: `url(${canvas.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
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

  // ── Node type badge ────────────────────────────────────────────────────────

  const NODE_TYPE_COLOR: Record<string, string> = {
    explanation: '#3b82f6',
    example: '#8b5cf6',
    quiz: '#f59e0b',
    hint: '#10b981',
    result: '#ef4444'
  }

  const NODE_TYPE_LABEL: Record<string, string> = {
    explanation: 'Explanation',
    example: 'Example',
    quiz: 'Quiz',
    hint: 'Hint',
    result: 'Result'
  }

  // ── Main component ─────────────────────────────────────────────────────────

  export default function StudentLessonView() {
    const { token, loading: authLoading } = useAuth()
    const { id, lessonId } = useParams()
    const navigate = useNavigate()

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
    const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null)
    const [correctCount, setCorrectCount] = useState(0)
    const [totalQuizNodes, setTotalQuizNodes] = useState(0)
    const [lessonDone, setLessonDone] = useState(false)
    const [alreadyCompleted, setAlreadyCompleted] = useState(false)
    const [reward, setReward] = useState<CompleteResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    // ── Load lesson ────────────────────────────────────────────────────────
    useEffect(() => {
      if (authLoading || !token) return
      async function fetchData() {
        try {
          const [lessonRes, progressRes] = await Promise.all([
            api.get<Lesson>(`/lessons/lesson/${lessonId}`, token),
            api.get<Progress[]>('/progress', token)
          ])
          const isCompleted = progressRes.some(
            p => p.lessonId === Number(lessonId) && p.completed
          )
          setLesson(lessonRes)
          setAlreadyCompleted(isCompleted)

          if (lessonRes.contentJson?.nodes?.length) {
            setCurrentNodeId(lessonRes.contentJson.nodes[0].id)
            const quizCount = lessonRes.contentJson.nodes.filter(n => n.type === 'quiz').length
            setTotalQuizNodes(quizCount)
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Failed to load lesson')
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }, [token, authLoading, lessonId])

    // ── Scale canvas to container width ───────────────────────────────────
    useEffect(() => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const canvasWidth = 1280
      setScale(Math.min(1, containerWidth / canvasWidth))
    }, [lesson, currentNodeId])

    // ── Derived current node ───────────────────────────────────────────────
    const currentNode: LessonNode | null = lesson?.contentJson?.nodes?.find(
      n => n.id === currentNodeId
    ) ?? null

    // ── Navigation ─────────────────────────────────────────────────────────
    function goToNode(nodeId: string | null) {
      if (!nodeId) {
        // End of lesson
        handleLessonComplete()
        return
      }
      const next = lesson?.contentJson?.nodes?.find(n => n.id === nodeId)
      if (!next) {
        handleLessonComplete()
        return
      }
      if (next.type === 'result') {
        setCurrentNodeId(nodeId)
        // Auto-complete after showing result node
        setTimeout(() => handleLessonComplete(), 1500)
        return
      }
      setCurrentNodeId(nodeId)
      setSelectedChoice(null)
      setAnswerFeedback(null)
    }

    // ── Quiz answer handler ────────────────────────────────────────────────
    function handleAnswer() {
      if (!currentNode?.quiz || selectedChoice === null) return
      const isCorrect = selectedChoice === currentNode.quiz.correctIndex

      if (isCorrect) {
        setAnswerFeedback('correct')
        setCorrectCount(prev => prev + 1)
        setTimeout(() => {
          setAnswerFeedback(null)
          goToNode(currentNode.nextNodeId)
        }, 1000)
      } else {
        setAnswerFeedback('wrong')
        setTimeout(() => {
          setAnswerFeedback(null)
          setSelectedChoice(null)
          if (currentNode.hintNodeId) {
            goToNode(currentNode.hintNodeId)
          }
          // If no hint, stay on quiz
        }, 1000)
      }
    }

    // ── Lesson completion ──────────────────────────────────────────────────
    async function handleLessonComplete() {
      if (lessonDone || alreadyCompleted) return
      setLessonDone(true)
      setCompleting(true)
      try {
        const score = totalQuizNodes > 0
          ? Math.round((correctCount / totalQuizNodes) * 100)
          : 100  // no quizzes = full score
        const res = await api.post<CompleteResponse>(
          '/gamification/complete',
          { lessonId: Number(lessonId), score },
          token
        )
        setReward(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to complete lesson')
      } finally {
        setCompleting(false)
      }
    }

    // ── Render ─────────────────────────────────────────────────────────────
    if (authLoading || loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!lesson || !lesson.contentJson) return <div>Lesson not found</div>
    if (!currentNode) return <div>No nodes in this lesson.</div>

    // Already completed — show review mode
    if (alreadyCompleted && !lessonDone) {
      return (
        <div>
          <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back</button>
          <h1>{lesson.title}</h1>
          <p>✅ You have already completed this lesson.</p>
          <p>Reviewing all nodes:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {lesson.contentJson.nodes.map((node, index) => (
              <div key={node.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: NODE_TYPE_COLOR[node.type]
                  }} />
                  <span style={{ fontSize: 13, color: '#555' }}>
                    {index + 1}. {NODE_TYPE_LABEL[node.type]}
                  </span>
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

    // Lesson done — show reward
    if (lessonDone) {
      return (
        <div>
          <h1>🎉 Lesson Complete!</h1>
          {completing ? (
            <p>Saving your progress...</p>
          ) : reward ? (
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
                    <div key={badge.id}>
                      <strong>{badge.name}</strong> — {badge.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back to classroom</button>
        </div>
      )
    }

    // Active lesson — show current node
    return (
      <div>
        <button onClick={() => navigate(`/student/classrooms/${id}`)}>← Back</button>
        <h1>{lesson.title}</h1>

        {/* Node type indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: NODE_TYPE_COLOR[currentNode.type]
          }} />
          <span style={{ fontSize: 13, color: '#555' }}>
            {NODE_TYPE_LABEL[currentNode.type]}
          </span>
          <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
            Node {(lesson.contentJson.nodes.findIndex(n => n.id === currentNodeId) + 1)} of {lesson.contentJson.nodes.length}
          </span>
        </div>

        {/* Canvas */}
        <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden', marginBottom: 24 }}>
          <CanvasRenderer canvasData={currentNode.contentJson} scale={scale} />
        </div>

        {/* Quiz UI */}
        {currentNode.type === 'quiz' && currentNode.quiz && (
          <div style={{ marginBottom: 24 }}>
            <h3>{currentNode.quiz.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentNode.quiz.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedChoice(i)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    border: selectedChoice === i ? '2px solid #3b82f6' : '1px solid #ddd',
                    borderRadius: 6,
                    background: selectedChoice === i ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>

            {/* Answer feedback */}
            {answerFeedback === 'correct' && (
              <p style={{ color: '#22c55e', fontWeight: 'bold', marginTop: 8 }}>✅ Correct!</p>
            )}
            {answerFeedback === 'wrong' && (
              <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: 8 }}>
                ❌ Wrong. {currentNode.hintNodeId ? 'Check the hint!' : 'Try again!'}
              </p>
            )}

            {!answerFeedback && (
              <button
                onClick={handleAnswer}
                disabled={selectedChoice === null}
                style={{ marginTop: 12, padding: '8px 24px' }}
              >
                Submit Answer
              </button>
            )}
          </div>
        )}

        {/* Next button — for non-quiz nodes */}
        {currentNode.type !== 'quiz' && (
          <button onClick={() => goToNode(currentNode.nextNodeId)}>
            {currentNode.nextNodeId ? 'Next →' : 'Finish Lesson'}
          </button>
        )}
      </div>
    )
  }