import { useEffect, useMemo, useState } from 'react'
import CanvasPreview from './editor/canvasPreview'
import type { LessonGraph, LessonNode } from '../types'

interface GraphPreviewProps {
  graph: LessonGraph
  previewWidth?: number
}

export default function GraphPreview({
  graph,
  previewWidth = 640
}: GraphPreviewProps) {
  // ── Build Node Map (O(1) lookup instead of .find hell) ──
  const nodeMap = useMemo(() => {
    return Object.fromEntries(graph.nodes.map(n => [n.id, n]))
  }, [graph])

  // ── State ───────────────────────────────────────────────
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  // ── Initialize first node ───────────────────────────────
  useEffect(() => {
    if (graph.nodes.length > 0) {
      setCurrentNodeId(graph.nodes[0].id)
      setHistory([])
    } else {
      setCurrentNodeId(null)
    }
  }, [graph])

  // ── Resolve current node ────────────────────────────────
  const currentNode: LessonNode | null = currentNodeId
    ? nodeMap[currentNodeId]
    : null

  const canvas = currentNode?.contentJson

  // ── Navigation Helpers ──────────────────────────────────
  const goTo = (nodeId: string | null | undefined) => {
    if (!nodeId || !nodeMap[nodeId]) return
    if (currentNodeId) {
      setHistory(prev => [...prev, currentNodeId])
    }
    setCurrentNodeId(nodeId)
  }

  const goNext = () => {
    if (!currentNode?.nextNodeId) return
    goTo(currentNode.nextNodeId)
  }

  const goBack = () => {
    if (history.length === 0) return

    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setCurrentNodeId(prev)
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div>
      {/* Canvas */}
      {canvas ? (
        <CanvasPreview contentJson={canvas} previewWidth={previewWidth} />
      ) : (
        <div
          style={{
            width: previewWidth,
            height: previewWidth * 0.5625,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <p style={{ color: '#999' }}>No content</p>
        </div>
      )}

      {/* Controls */}
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={goBack} disabled={history.length === 0}>
          ← Back
        </button>

        <button onClick={goNext} disabled={!currentNode?.nextNodeId}>
          Next →
        </button>
      </div>

      {/* Debug / Node Info (optional but VERY useful) */}
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        <div>Node: {currentNode?.id ?? 'None'}</div>
        <div>Type: {currentNode?.type ?? 'N/A'}</div>
      </div>

      {/* Quiz Simulation (basic preview support) */}
      {currentNode?.type === 'quiz' && (
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button onClick={() => goTo(currentNode.nextNodeId)}>
            Simulate Correct
          </button>

          <button onClick={() => goTo(currentNode.hintNodeId)}>
            Simulate Wrong
          </button>
        </div>
      )}
    </div>
  )
}