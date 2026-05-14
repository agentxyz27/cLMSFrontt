import type { CanvasData, CanvasElement, DragItemProps, DragTargetProps } from '@/shared/types'
import { StaticText, StaticImage, StaticShape } from './staticRenderers'
import { useDragMatch } from './useDragMatch'

interface Props {
  canvasData: CanvasData
  scale: number
  disabled: boolean
  hints: string[]
  onSubmit: (answer: unknown) => void
  onHint: (hintIndex: number) => void
}

export default function DragMatch({ canvasData, scale, disabled, hints, onSubmit, onHint }: Props) {
  const { canvas, elements } = canvasData

  const items   = elements.filter(el => el.type === 'drag-item')
  const targets = elements.filter(el => el.type === 'drag-target')
  const statics = elements.filter(el => el.type === 'text' || el.type === 'image' || el.type === 'shape')

  const {
    matches, draggingId, hintIndex,
    placedItemIds, allFilled,
    handleDragStart, handleDrop, handleDragOver, handleUnplace, handleSubmit, handleShowHint,
  } = useDragMatch({ targets, hints, disabled, onSubmit, onHint })

  return (
    <div style={{ fontFamily: 'sans-serif', userSelect: 'none' }}>

      <div style={{
        position: 'relative',
        width: canvas.width * scale,
        height: canvas.height * scale,
        background: canvas.background,
        ...(canvas.backgroundImage ? {
          backgroundImage: `url(${canvas.backgroundImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        } : {}),
        borderRadius: 8, overflow: 'hidden', marginBottom: 16,
      }}>
        {statics.map(el => {
          if (el.type === 'text')  return <StaticText  key={el.id} el={el} scale={scale} />
          if (el.type === 'image') return <StaticImage key={el.id} el={el} scale={scale} />
          if (el.type === 'shape') return <StaticShape key={el.id} el={el} scale={scale} />
          return null
        })}

        {targets.map(el => {
          const p        = el.props as DragTargetProps
          const placedId = matches[el.id]
          const placedEl = placedId ? items.find(i => i.id === placedId) : null
          const placedP  = placedEl ? (placedEl.props as DragItemProps) : null

          return (
            <div
              key={el.id}
              onDrop={() => handleDrop(el.id)}
              onDragOver={handleDragOver}
              style={{
                position: 'absolute',
                left: el.x * scale, top: el.y * scale,
                width: el.width * scale, height: el.height * scale,
                border: `2px dashed ${p.color}`, borderRadius: 8,
                background: placedId ? `${p.color}22` : `${p.color}10`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box', transition: 'background 0.15s',
              }}
            >
              {placedP ? (
                <div
                  onClick={() => handleUnplace(el.id)}
                  title={disabled ? '' : 'Click to remove'}
                  style={{
                    width: '100%', height: '100%',
                    background: placedP.color, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: disabled ? 'default' : 'pointer', boxSizing: 'border-box',
                  }}
                >
                  <span style={{ fontSize: 13 * scale, fontWeight: 600, color: placedP.textColor, textAlign: 'center', padding: '0 6px' }}>
                    {placedP.label}
                  </span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 11 * scale, color: p.color, fontWeight: 600, textAlign: 'center', padding: '0 6px' }}>
                    {p.label}
                  </span>
                  <span style={{ fontSize: 10 * scale, color: p.color, opacity: 0.5 }}>drop here</span>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        padding: '12px 16px', background: '#f3f4f6',
        borderRadius: 10, minHeight: 56, marginBottom: 16,
      }}>
        {items.map(el => {
          const p        = el.props as DragItemProps
          const isPlaced = placedItemIds.has(el.id)

          if (isPlaced) {
            return (
              <div key={el.id} style={{
                width: el.width * scale, height: el.height * scale,
                borderRadius: 8, border: '2px dashed #d1d5db',
                background: '#f9fafb', display: 'flex',
                alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
              }}>
                <span style={{ fontSize: 12 * scale, color: '#d1d5db' }}>{p.label}</span>
              </div>
            )
          }

          return (
            <div
              key={el.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(el.id)}
              style={{
                width: el.width * scale, height: el.height * scale,
                background: p.color, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                border: draggingId === el.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: disabled ? 'default' : 'grab',
                opacity: draggingId === el.id ? 0.5 : 1, transition: 'opacity 0.15s',
              }}
            >
              <span style={{ fontSize: 13 * scale, fontWeight: 600, color: p.textColor, textAlign: 'center', padding: '0 8px' }}>
                {p.label}
              </span>
            </div>
          )
        })}
      </div>

      {hintIndex !== null && hints[hintIndex] && (
        <div style={{
          marginBottom: 12, padding: '10px 14px',
          background: '#fefce8', border: '1px solid #fde68a',
          borderRadius: 8, fontSize: 13, color: '#92400e',
        }}>
          💡 {hints[hintIndex]}
        </div>
      )}

      {!disabled && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                padding: '9px 18px', fontSize: 13,
                borderRadius: 8, border: '1px solid #d1d5db',
                background: 'none', color: '#6b7280', cursor: 'pointer',
              }}
            >
              💡 Hint
            </button>
          )}
        </div>
      )}
    </div>
  )
}