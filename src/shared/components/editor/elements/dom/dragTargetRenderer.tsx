// shared/components/editor/elements/dom/DragTargetRenderer.tsx
import type { CanvasElement, DragTargetProps } from '@/shared/types'

export function DragTargetRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as DragTargetProps
  return (
    <div style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height,
      border: `2px dashed ${p.color}`, borderRadius: 8,
      background: `${p.color}18`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', gap: 4
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: p.color, textAlign: 'center', padding: '0 8px' }}>
        {p.label}
      </span>
      {p.accepts && (
        <span style={{ fontSize: 9, color: p.color, opacity: 0.7, background: `${p.color}22`, borderRadius: 3, padding: '1px 5px' }}>
          ← {p.accepts}
        </span>
      )}
      <div style={{
        position: 'absolute', top: -8, right: -8,
        background: '#10b981', borderRadius: 4,
        fontSize: 9, fontWeight: 700, color: '#fff', padding: '1px 4px'
      }}>DROP</div>
    </div>
  )
}