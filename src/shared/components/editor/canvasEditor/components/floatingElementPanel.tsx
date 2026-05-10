import PropertiesPanel from '../../propertiesPanel'
import type { CanvasElement } from '@/shared/types'

interface FloatingElementPanelProps {
  element: CanvasElement
  onChange: (updated: CanvasElement) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function FloatingElementPanel({
  element,
  onChange,
  onDelete,
  onClose
}: FloatingElementPanelProps) {
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: 244,
      background: '#16181f',
      border: '1px solid #2a2d3a',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
      overflow: 'hidden',
      zIndex: 10
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #2a2d3a',
        background: '#0f1117',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#4b6bfb' }}>
          ELEMENT
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
        >×</button>
      </div>

      {/* Properties */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        <PropertiesPanel
          element={element}
          onChange={onChange}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}