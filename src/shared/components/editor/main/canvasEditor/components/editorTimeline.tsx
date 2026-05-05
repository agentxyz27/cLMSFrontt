import React from 'react'
import CanvasPreview from '../../canvasPreview'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '../constants'
import type { LessonNode } from '@/shared/types'

interface EditorTimelineProps {
  nodes: LessonNode[]
  activeNodeId: string
  onSelectNode: (nodeId: string) => void
  onNodeContextMenu: (e: React.MouseEvent, nodeId: string) => void
  onAddNode: () => void
}

export default function EditorTimeline({
  nodes,
  activeNodeId,
  onSelectNode,
  onNodeContextMenu,
  onAddNode
}: EditorTimelineProps) {
  return (
    <div style={{
      height: 124,
      background: '#16181f',
      borderTop: '1px solid #2a2d3a',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 10,
      overflowX: 'auto',
      flexShrink: 0
    }}>
      {nodes.map((node, index) => {
        const isActive = node.id === activeNodeId
        const color = NODE_TYPE_COLOR[node.type]
        return (
          <div
            key={node.id}
            onClick={() => onSelectNode(node.id)}
            onContextMenu={e => onNodeContextMenu(e, node.id)}
            title="Right-click for node settings"
            style={{
              flexShrink: 0,
              width: 136, height: 90,
              borderRadius: 8,
              border: isActive ? `2px solid ${color}` : '1.5px solid #2a2d3a',
              background: '#0f1117',
              boxShadow: isActive ? `0 0 0 3px ${color}33` : '0 1px 4px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              userSelect: 'none'
            }}
          >
            <div style={{ flex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
              <CanvasPreview contentJson={node.contentJson} previewWidth={132} />
            </div>
            <div style={{
              padding: '3px 7px',
              background: '#0f1117',
              borderTop: `1px solid ${isActive ? color + '44' : '#1e2130'}`,
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 500 }}>
                {index + 1}. {NODE_TYPE_LABEL[node.type]}
              </span>
            </div>
          </div>
        )
      })}

      {/* Add node button */}
      <button
        onClick={onAddNode}
        style={{
          flexShrink: 0,
          width: 90, height: 90,
          borderRadius: 8,
          border: '1.5px dashed #2a2d3a',
          background: 'none',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: '#4b5568', fontSize: 11, gap: 5,
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#3b82f6'
          e.currentTarget.style.color = '#3b82f6'
          e.currentTarget.style.background = '#1a2235'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#2a2d3a'
          e.currentTarget.style.color = '#4b5568'
          e.currentTarget.style.background = 'none'
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
        <span>Add node</span>
      </button>
    </div>
  )
}