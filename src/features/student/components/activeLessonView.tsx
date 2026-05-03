import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasRenderer, NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '@/shared/components/editor/main/canvasRenderer'
import type { LessonNode, LessonGraph } from '@/shared/types'

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
  onNext: (nodeId: string | null) => void
}

export default function ActiveLessonView({
  title, graph, currentNode, currentNodeId, classroomId,
  selectedChoice, answerFeedback,
  onSelectChoice, onAnswer, onNext
}: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return
    setScale(Math.min(1, containerRef.current.offsetWidth / 1280))
  }, [currentNodeId])

  return (
    <div>
      <button onClick={() => navigate(`/student/classrooms/${classroomId}`)}>← Back</button>
      <h1>{title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: NODE_TYPE_COLOR[currentNode.type] }} />
        <span style={{ fontSize: 13, color: '#555' }}>{NODE_TYPE_LABEL[currentNode.type]}</span>
        <span style={{ fontSize: 12, color: '#999', marginLeft: 'auto' }}>
          Node {graph.nodes.findIndex(n => n.id === currentNodeId) + 1} of {graph.nodes.length}
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
            <button onClick={onAnswer} disabled={selectedChoice === null} style={{ marginTop: 12, padding: '8px 24px' }}>
              Submit Answer
            </button>
          )}
        </div>
      )}

      {currentNode.type !== 'quiz' && (
        <button onClick={() => onNext(currentNode.nextNodeId)}>
          {currentNode.nextNodeId ? 'Next →' : 'Finish Lesson'}
        </button>
      )}
    </div>
  )
}