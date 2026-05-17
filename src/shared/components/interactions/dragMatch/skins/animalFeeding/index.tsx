import React from 'react'
import type { DragMatchSkinPlugin, SkinItemState, SkinTargetState } from '../types'
import { AnimalFeedingConfig } from './config'

const ANIMAL_EMOJI: Record<string, string> = {
  cat: '🐱', dog: '🐶', rabbit: '🐰', bird: '🐦', frog: '🐸',
}
const FOOD_EMOJI: Record<string, string> = {
  fish: '🐟', bone: '🦴', carrot: '🥕', worm: '🪱', fly: '🪰', generic: '⭐',
}

const ItemRenderer: React.FC<SkinItemState> = ({
  item, canvasEl, scale, isPlaced, isDragging, disabled, onDragStart,
}) => {
  const foodType = (item as any).foodType ?? 'generic'
  const emoji = FOOD_EMOJI[foodType] ?? '⭐'

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
        <span style={{ fontSize: 20 * scale, opacity: 0.3 }}>{emoji}</span>
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
        background: '#fef9c3', borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: isDragging ? '2px solid #f59e0b' : '2px solid #fde68a',
        cursor: disabled ? 'default' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.15s',
        gap: 2,
      }}
    >
      <span style={{ fontSize: 22 * scale }}>{emoji}</span>
      <span style={{ fontSize: 10 * scale, fontWeight: 600, color: '#92400e', textAlign: 'center', padding: '0 4px' }}>
        {item.label}
      </span>
    </div>
  )
}

const TargetRenderer: React.FC<SkinTargetState> = ({
  target, canvasEl, scale, placedItem, disabled,
  onDrop, onDragOver, onUnplace,
}) => {
  const animalType = (target as any).animalType ?? 'cat'
  const emoji = ANIMAL_EMOJI[animalType] ?? '🐱'
  const foodEmoji = placedItem ? (FOOD_EMOJI[(placedItem as any).foodType ?? 'generic'] ?? '⭐') : null

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{
        position: 'absolute',
        left: canvasEl.x * scale, top: canvasEl.y * scale,
        width: canvasEl.width * scale, height: canvasEl.height * scale,
        borderRadius: 12,
        background: placedItem ? '#dcfce7' : '#f0fdf4',
        border: `2px dashed ${placedItem ? '#22c55e' : '#86efac'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box', transition: 'all 0.15s',
        gap: 2, cursor: 'default',
      }}
    >
      <span style={{ fontSize: 28 * scale }}>{placedItem ? '😊' : emoji}</span>
      <span style={{ fontSize: 10 * scale, fontWeight: 600, color: '#166534', textAlign: 'center', padding: '0 4px' }}>
        {target.label}
      </span>
      {placedItem ? (
        <div
          onClick={onUnplace}
          title={disabled ? '' : 'Click to remove'}
          style={{ fontSize: 16 * scale, cursor: disabled ? 'default' : 'pointer' }}
        >
          {foodEmoji}
        </div>
      ) : (
        <span style={{ fontSize: 9 * scale, color: '#86efac' }}>drop here</span>
      )}
    </div>
  )
}

export const animalFeedingSkin: DragMatchSkinPlugin = {
  id: 'animal-feeding',
  ItemRenderer,
  prepare: (content) => {
  const meta = content.skinMeta ?? {}
  return {
    items: content.items.map((item, i) => ({
      ...item,
      foodType: meta[`item_${i}_food`] ?? 'generic',
    })),
    targets: content.targets.map((target, i) => ({
      ...target,
      animalType: meta[`target_${i}_animal`] ?? 'cat',
    })),
  }
},
  TargetRenderer,
  ConfigFields: AnimalFeedingConfig,
  defaultMeta: () => ({ animalType: 'cat', foodType: 'generic' }),
}