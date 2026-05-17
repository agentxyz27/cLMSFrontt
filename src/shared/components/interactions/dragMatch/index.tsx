import type { DragMatchContent, CanvasData } from '@/shared/types'
import { useDragMatch } from './useDragMatch'
import { getSkin } from './skins/registry'

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
  const hints         = content.hints ?? []
  const canvasItems   = elements.filter(el => el.type === 'drag-item')
  const canvasTargets = elements.filter(el => el.type === 'drag-target')

  const skin    = getSkin(content.skin)
  const prepared = skin.prepare(content)

  const {
    items, targets, matches, draggingId, hintIndex,
    placedItemIds, allFilled,
    handleDragStart, handleDrop, handleDragOver, handleUnplace, handleSubmit, handleShowHint,
  } = useDragMatch({
    content: { ...content, items: prepared.items, targets: prepared.targets },
    hints,
    disabled,
    onSubmit,
    onHint,
  })

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, userSelect: 'none' }}>

        {canvasTargets.map((el, i) => {
          const target = targets[i]
          if (!target) return null
          const placedItemId = matches[target.id]
          const placedItem   = placedItemId ? items.find(it => it.id === placedItemId) ?? null : null

          return (
            <skin.TargetRenderer
              key={el.id}
              target={target}
              canvasEl={el}
              scale={scale}
              placedItem={placedItem}
              disabled={disabled}
              onDrop={() => handleDrop(target.id)}
              onDragOver={handleDragOver}
              onUnplace={() => handleUnplace(target.id)}
            />
          )
        })}

        {canvasItems.map((el, i) => {
          const item = items[i]
          if (!item) return null

          return (
            <skin.ItemRenderer
              key={el.id}
              item={item}
              canvasEl={el}
              scale={scale}
              isPlaced={placedItemIds.has(item.id)}
              isDragging={draggingId === item.id}
              disabled={disabled}
              onDragStart={() => handleDragStart(item.id)}
            />
          )
        })}

      </div>

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