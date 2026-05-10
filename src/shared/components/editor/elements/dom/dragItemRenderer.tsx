// shared/components/editor/elements/dom/DragItemRenderer.tsx
import type { CanvasElement, DragItemProps } from '@/shared/types'

export function DragItemRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as DragItemProps
  return (
    <div style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height,
      background: p.color, borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      cursor: 'grab', userSelect: 'none'
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: p.textColor, textAlign: 'center', padding: '0 8px' }}>
        {p.label}
      </span>
      <div style={{
        position: 'absolute', top: -8, right: -8,
        background: '#f59e0b', borderRadius: 4,
        fontSize: 9, fontWeight: 700, color: '#fff', padding: '1px 4px'
      }}>DRAG</div>
    </div>
  )
}