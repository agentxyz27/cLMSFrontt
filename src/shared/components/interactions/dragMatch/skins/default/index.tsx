import React from 'react'
import type { DragMatchSkinPlugin, SkinItemState, SkinTargetState } from '../types'
import type { DragItemProps, DragTargetProps } from '@/shared/types'

const ItemRenderer: React.FC<SkinItemState> = ({
  item, canvasEl, scale, isPlaced, isDragging, disabled, onDragStart,
}) => {
  const p = canvasEl.props as DragItemProps

  if (isPlaced) {
    return (
      <div style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        borderRadius: 8, border: '2px dashed #ffffff33',
        background: 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: 12 * scale, color: '#ffffff44' }}>{item.label}</span>
      </div>
    )
  }

  return (
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        background: p.color, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        border: isDragging ? '2px solid #3b82f6' : '2px solid transparent',
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <span style={{
        fontSize: 13 * scale, fontWeight: 600,
        color: p.textColor, textAlign: 'center', padding: '0 8px',
      }}>
        {item.label}
      </span>
    </div>
  )
}

const TargetRenderer: React.FC<SkinTargetState> = ({
  target, canvasEl, scale, placedItem, disabled,
  onDrop, onDragOver, onUnplace,
}) => {
  const p = canvasEl.props as DragTargetProps

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        border: `2px dashed ${p.color}`,
        borderRadius: 8,
        background: placedItem ? `${p.color}22` : `${p.color}10`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', transition: 'background 0.15s',
      }}
    >
      {placedItem ? (
        <div
          onClick={onUnplace}
          title={disabled ? '' : 'Click to remove'}
          style={{
            width: '100%', height: '100%',
            background: p.color,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: disabled ? 'default' : 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span style={{
            fontSize: 13 * scale, fontWeight: 600,
            color: '#fff', textAlign: 'center', padding: '0 6px',
          }}>
            {placedItem.label}
          </span>
        </div>
      ) : (
        <>
          <span style={{ fontSize: 11 * scale, color: p.color, fontWeight: 600, textAlign: 'center', padding: '0 6px' }}>
            {target.label}
          </span>
          <span style={{ fontSize: 10 * scale, color: p.color, opacity: 0.5 }}>
            drop here
          </span>
        </>
      )}
    </div>
  )
}

export const defaultSkin: DragMatchSkinPlugin = {
  id: 'default',
  ItemRenderer,
  prepare: (content) => ({ items: content.items, targets: content.targets }),
  TargetRenderer,
}