import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CanvasRenderer, NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '@/shared/components/editor/main/canvasRenderer'
import type { LessonGraph } from '@/shared/types'

interface Props {
  title: string
  graph: LessonGraph
  classroomId: string
}

export default function LessonReviewMode({ title, graph, classroomId }: Props) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return
    setScale(Math.min(1, containerRef.current.offsetWidth / 1280))
  }, [])

  return (
    <div>
      <button onClick={() => navigate(`/student/classrooms/${classroomId}`)}>← Back</button>
      <h1>{title}</h1>
      <p>✅ You have already completed this lesson.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {graph.nodes.map((node, index) => (
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