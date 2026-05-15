import type { DragMatchContent, CanvasData, DragItemProps, DragTargetProps } from '@/shared/types'
import { useDragMatch } from './useDragMatch'

interface Props {
  content: DragMatchContent
  canvasData: CanvasData
  scale: number
  disabled: boolean
  onSubmit: (answer: unknown) => void
  onHint: (hintIndex: number) => void
}

export default function DragMatch({ content, canvasData, scale, disabled, onSubmit, onHint }: Props) {
  const { elements } = canvasData
  const hints   = content.hints ?? []
  const statics = elements.filter(el => el.type === 'text' || el.type === 'image' || el.type === 'shape')
  const canvasItems   = elements.filter(el => el.type === 'drag-item')
  const canvasTargets = elements.filter(el => el.type === 'drag-target')

  const {
    items, targets, matches, draggingId, hintIndex,
    placedItemIds, allFilled,
    handleDragStart, handleDrop, handleDragOver, handleUnplace, handleSubmit, handleShowHint,
  } = useDragMatch({ content, hints, disabled, onSubmit, onHint })

  return (
    <>
      {/* transparent overlay — no background, no container styling */}
      <div style={{ position: 'absolute', inset: 0, userSelect: 'none' }}>

        {/* targets */}
        {canvasTargets.map((el, i) => {
          const target = targets[i]
          if (!target) return null
          const placedItemId = matches[target.id]
          const placedItem   = placedItemId ? items.find(it => it.id === placedItemId) : null
          const canvasItem   = placedItem ? canvasItems[items.indexOf(placedItem)] : null
          const p = el.props as DragTargetProps

          return (
            <div
              key={el.id}
              onDrop={() => handleDrop(target.id)}
              onDragOver={handleDragOver}
              style={{
                position: 'absolute',
                left: el.x * scale, top: el.y * scale,
                width: el.width * scale, height: el.height * scale,
                border: `2px dashed ${p.color}`,
                borderRadius: 8,
                background: placedItemId ? `${p.color}22` : `${p.color}10`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box', transition: 'background 0.15s',
              }}
            >
              {placedItem && canvasItem ? (
                <div
                  onClick={() => handleUnplace(target.id)}
                  title={disabled ? '' : 'Click to remove'}
                  style={{
                    width: '100%', height: '100%',
                    background: (canvasItem.props as DragItemProps).color,
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: disabled ? 'default' : 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <span style={{
                    fontSize: 13 * scale, fontWeight: 600,
                    color: (canvasItem.props as DragItemProps).textColor,
                    textAlign: 'center', padding: '0 6px',
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
        })}

        {/* items */}
        {canvasItems.map((el, i) => {
          const item = items[i]
          if (!item) return null
          const isPlaced = placedItemIds.has(item.id)
          const p = el.props as DragItemProps

          if (isPlaced) {
            return (
              <div key={el.id} style={{
                position: 'absolute',
                left: el.x * scale, top: el.y * scale,
                width: el.width * scale, height: el.height * scale,
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
              key={el.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(item.id)}
              style={{
                position: 'absolute',
                left: el.x * scale, top: el.y * scale,
                width: el.width * scale, height: el.height * scale,
                background: p.color, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                border: draggingId === item.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: disabled ? 'default' : 'grab',
                opacity: draggingId === item.id ? 0.5 : 1,
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
        })}
      </div>

      {/* hints */}
      {hintIndex !== null && hints[hintIndex] && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 14px', background: '#fefce8',
          border: '1px solid #fde68a', borderRadius: 8,
          fontSize: 13, color: '#92400e', zIndex: 30,
        }}>
          💡 {hints[hintIndex]}
        </div>
      )}

      {/* submit + hint buttons */}
      {!disabled && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 10, alignItems: 'center', zIndex: 30,
        }}>
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            style={{
              padding: '9px 24px', fontSize: 14, fontWeight: 600,
              borderRadius: 8, border: 'none',
              cursor: allFilled ? 'pointer' : 'not-allowed',
              background: allFilled ? '#3b82f6' : '#e5e7eb',
              color: allFilled ? '#fff' : '#9ca3af',
              transition: 'background 0.15s',
            }}
          >
            Check Answer
          </button>

          {hints.length > 0 && (hintIndex === null || hintIndex < hints.length - 1) && (
            <button
              onClick={handleShowHint}
              style={{
                padding: '9px 18px', fontSize: 13, borderRadius: 8,
                border: '1px solid #ffffff33', background: 'rgba(0,0,0,0.4)',
                color: '#e5e7eb', cursor: 'pointer',
              }}
            >
              💡 Hint
            </button>
          )}
        </div>
      )}
    </>
  )
}