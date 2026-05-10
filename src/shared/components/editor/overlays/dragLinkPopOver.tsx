import { useRef, useEffect, useState } from 'react'
import type { CanvasElement, DragItemProps } from '@/shared/types'
import type { ContextPopover } from '@/shared/components/editor/canvasEditor/hooks/useLinkMode'

// ── DragLinkPopover ───────────────────────────────────────────────────────

interface DragLinkPopoverProps {
  popover: ContextPopover
  dragItems: CanvasElement[]
  onLink: (targetId: string, itemId: string) => void
  onClose: () => void
  onEnterLinkMode: (targetId: string) => void
}

export function DragLinkPopover({
  popover,
  dragItems,
  onLink,
  onClose,
  onEnterLinkMode,
}: DragLinkPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.key === 'l' || e.key === 'L') && ref.current) {
        onClose()
        onEnterLinkMode(popover.targetId)
      }
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, onEnterLinkMode, popover.targetId])

  return (
    <div
      ref={ref}
      onContextMenu={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: popover.x,
        top: popover.y,
        zIndex: 1000,
        background: '#0f1117',
        border: '1px solid #2a2d3a',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        minWidth: 210,
        overflow: 'hidden',
        pointerEvents: 'all',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #1e2130',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 9, color: '#6b7280', letterSpacing: '0.08em', fontWeight: 700 }}>
            DROP TARGET
          </div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600, marginTop: 2 }}>
            {popover.targetLabel || '(no label)'}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#4b5568', fontSize: 14, padding: '2px 5px', lineHeight: 1,
        }}>✕</button>
      </div>

      {/* Items list */}
      <div style={{ padding: '6px 0' }}>
        <div style={{
          padding: '4px 12px 6px',
          fontSize: 9, color: '#6b7280',
          letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          Accepts
        </div>

        <ItemButton
          label="— Not linked —"
          active={popover.currentAccepts === ''}
          color={undefined}
          onClick={() => { onLink(popover.targetId, ''); onClose() }}
        />

        {dragItems.length === 0 && (
          <div style={{ padding: '6px 12px', fontSize: 11, color: '#4b5568', fontStyle: 'italic' }}>
            No drag items on canvas yet
          </div>
        )}

        {dragItems.map((item, i) => {
          const p = item.props as DragItemProps
          return (
            <ItemButton
              key={item.id}
              label={`item_${i + 1}: ${p.label || '(no label)'}`}
              active={popover.currentAccepts === item.id}
              color={p.color}
              onClick={() => { onLink(popover.targetId, item.id); onClose() }}
            />
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '7px 12px',
        borderTop: '1px solid #1e2130',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{ fontSize: 9, color: '#4b5568' }}>Visual link mode:</span>
        <button
          onClick={() => { onClose(); onEnterLinkMode(popover.targetId) }}
          style={{
            background: '#1e2130', border: '1px solid #2a2d3a',
            borderRadius: 4, cursor: 'pointer', color: '#f59e0b',
            fontSize: 10, fontWeight: 600, padding: '3px 8px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <span>⇢</span> Link on canvas <kbd style={{ fontSize: 9, color: '#9ca3af' }}>L</kbd>
        </button>
      </div>
    </div>
  )
}

// ── ItemButton ────────────────────────────────────────────────────────────

function ItemButton({ label, active, color, onClick }: {
  label: string
  active: boolean
  color: string | undefined
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '7px 12px',
        background: active ? '#10b98118' : hovered ? '#ffffff08' : 'none',
        border: 'none', cursor: 'pointer',
        color: active ? '#10b981' : '#e2e8f0',
        fontSize: 11, textAlign: 'left',
      }}
    >
      <span style={{
        width: 10, height: 10, borderRadius: color ? 3 : '50%',
        background: color ?? 'transparent',
        border: color
          ? (active ? '1.5px solid #10b981' : '1px solid #2a2d3a')
          : '1.5px solid #4b5568',
        flexShrink: 0,
      }} />
      <span style={{ flex: 1 }}>{label}</span>
      {active && <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>✓</span>}
    </button>
  )
}