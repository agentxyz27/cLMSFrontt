import React from 'react'
import { PreviewStage } from '../../stages'
import { NODE_TYPE_COLOR, NODE_TYPE_LABEL } from '../constants'
import { useTimelineReorder } from '../hooks/useTimelineReorder'
import type { LessonNode } from '@/shared/types'

interface EditorTimelineProps {
  nodes: LessonNode[]
  activeNodeId: string
  onSelectNode: (nodeId: string) => void
  onNodeContextMenu: (e: React.MouseEvent, nodeId: string) => void
  onAddNode: () => void
  onReorderNodes: (newNodes: LessonNode[]) => void
}

export default function EditorTimeline({
  nodes,
  activeNodeId,
  onSelectNode,
  onNodeContextMenu,
  onAddNode,
  onReorderNodes
}: EditorTimelineProps) {
  const { dragIndex, dropIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useTimelineReorder(nodes, onReorderNodes)

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
        const isDragging = dragIndex === index
        const isDropTarget = dropIndex === index && dragIndex !== index
        const color = NODE_TYPE_COLOR[node.type]

        return (
          <React.Fragment key={node.id}>
            {isDropTarget && dragIndex! > index && (
              <div style={{
                flexShrink: 0, width: 3, height: 80,
                borderRadius: 2, background: '#3b82f6',
                boxShadow: '0 0 6px #3b82f6'
              }} />
            )}

            <div
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDrop={e => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => dragIndex === null && onSelectNode(node.id)}
              onContextMenu={e => onNodeContextMenu(e, node.id)}
              title="Drag to reorder · Right-click for settings"
              style={{
                flexShrink: 0,
                width: 136, height: 90,
                borderRadius: 8,
                border: isActive ? `2px solid ${color}` : '1.5px solid #2a2d3a',
                background: '#0f1117',
                boxShadow: isActive ? `0 0 0 3px ${color}33` : '0 1px 4px rgba(0,0,0,0.3)',
                cursor: isDragging ? 'grabbing' : 'grab',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s, transform 0.15s',
                userSelect: 'none',
                opacity: isDragging ? 0.35 : 1,
                transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                outline: isDropTarget ? '2px solid #3b82f6' : 'none',
                outlineOffset: 2
              }}
            >
              <div style={{ flex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
                <PreviewStage contentJson={node.contentJson} previewWidth={132} />
              </div>
              <div style={{
                padding: '3px 7px',
                background: '#0f1117',
                borderTop: `1px solid ${isActive ? color + '44' : '#1e2130'}`,
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <svg width="8" height="10" viewBox="0 0 8 10" style={{ flexShrink: 0, opacity: 0.35 }}>
                  {[0, 4].map(cx => [2, 5, 8].map(cy => (
                    <circle key={`${cx}-${cy}`} cx={cx + 1} cy={cy} r={1} fill="#8b8fa8" />
                  )))}
                </svg>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: '#8b8fa8', fontWeight: 500 }}>
                  {index + 1}. {NODE_TYPE_LABEL[node.type]}
                </span>
              </div>
            </div>

            {isDropTarget && dragIndex! < index && (
              <div style={{
                flexShrink: 0, width: 3, height: 80,
                borderRadius: 2, background: '#3b82f6',
                boxShadow: '0 0 6px #3b82f6'
              }} />
            )}
          </React.Fragment>
        )
      })}

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