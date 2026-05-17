import React, { useEffect, useState } from 'react'
import type { DragMatchSkinPlugin, SkinItemState, SkinTargetState } from '../types'
import { CHEST_ASSETS, CHEST_VARIANTS, type ChestVariant } from './assets'
import { ChestConfig } from './config'

const ItemRenderer: React.FC<SkinItemState> = ({
  item, canvasEl, scale, isPlaced, isDragging, disabled, onDragStart,
}) => {
  if (isPlaced) {
    return (
      <div style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        borderRadius: 8, border: '2px dashed #ffffff22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: 11 * scale, color: '#ffffff33' }}>{item.label}</span>
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
        background: '#1e3a5f',
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
        boxShadow: isDragging ? '0 0 0 2px #f59e0b' : '0 2px 8px rgba(0,0,0,0.3)',
        border: isDragging ? '2px solid #f59e0b' : '2px solid #2d5a8e',
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.6 : 1,
        transition: 'opacity 0.15s, box-shadow 0.15s',
      }}
    >
      <span style={{
        fontSize: 13 * scale, fontWeight: 700,
        color: '#e2e8f0', textAlign: 'center', padding: '0 8px',
      }}>
        {item.label}
      </span>
    </div>
  )
}

const TargetRenderer: React.FC<SkinTargetState> = ({
  target, canvasEl, scale, placedItem, disabled,
  isHovering, dropResult,
  onDrop, onDragOver, onDragEnter, onDragLeave, onUnplace,
}) => {
  const variant: ChestVariant = (target as any).chestVariant ?? 'bc1'
  const assets = CHEST_ASSETS[variant] ?? CHEST_ASSETS['bc1']

  const [showAnim, setShowAnim] = useState(false)

  // trigger animation on drop, then settle
  useEffect(() => {
    if (placedItem) {
      setShowAnim(true)
      const t = setTimeout(() => setShowAnim(false), 1200)
      return () => clearTimeout(t)
    } else {
      setShowAnim(false)
    }
  }, [placedItem])

  const imgSrc = showAnim
    ? assets.animation
    : isHovering
    ? assets.open
    : assets.closed

  const glowColor = dropResult === 'correct'
    ? '0 0 12px 4px rgba(34,197,94,0.7)'
    : dropResult === 'wrong'
    ? '0 0 12px 4px rgba(239,68,68,0.7)'
    : 'none'

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        boxSizing: 'border-box',
        filter: dropResult === 'correct'
          ? 'drop-shadow(0 0 8px rgba(34,197,94,0.8))'
          : dropResult === 'wrong'
          ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))'
          : 'none',
        transition: 'filter 0.2s',
        cursor: placedItem && !disabled ? 'pointer' : 'default',
      }}
      onClick={placedItem && !disabled ? onUnplace : undefined}
      title={placedItem && !disabled ? 'Click to remove' : undefined}
    >
      {/* chest image fills the slot */}
      <img
        src={imgSrc}
        alt={target.label}
        style={{
          width: '100%',
          height: '85%',
          objectFit: 'contain',
          imageRendering: 'pixelated',
          transition: 'filter 0.15s',
        }}
      />

      {/* label always visible below chest */}
      <span style={{
        fontSize: 11 * scale,
        fontWeight: 600,
        color: '#e2e8f0',
        textAlign: 'center',
        lineHeight: 1.2,
        height: '15%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px',
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
      }}>
        {target.label}
      </span>
    </div>
  )
}

export const chestSkin: DragMatchSkinPlugin = {
  id: 'chest',
  prepare: (content) => {
    const meta = content.skinMeta ?? {}
    return {
      items: content.items,
      targets: content.targets.map((target, i) => ({
        ...target,
        chestVariant: meta[`target_${i}_variant`] ?? 'bc1',
      })),
    }
  },
  ItemRenderer,
  TargetRenderer,
  ConfigFields: ChestConfig,
  defaultMeta: () => ({}),
}