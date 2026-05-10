// shared/components/editor/elements/dom/McOptionRenderer.tsx
import type { CanvasElement, McOptionProps } from '@/shared/types'

export function McOptionRenderer({ element }: { element: CanvasElement }) {
  const p = element.props as McOptionProps
  return (
    <div style={{
      position: 'absolute', left: element.x, top: element.y,
      width: element.width, height: element.height,
      background: p.color, border: '2px solid #d1d5db', borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', cursor: 'pointer', userSelect: 'none'
    }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: p.textColor, textAlign: 'center', padding: '0 8px' }}>
        {p.label}
      </span>
      <div style={{
        position: 'absolute', top: -8, left: -8,
        background: '#6366f1', borderRadius: 4,
        fontSize: 9, fontWeight: 700, color: '#fff', padding: '1px 5px'
      }}>{p.index + 1}</div>
    </div>
  )
}