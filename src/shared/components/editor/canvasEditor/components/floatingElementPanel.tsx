import PropertiesPanel from '../../propertiesPanel'
import type { CanvasElement } from '@/shared/types'

interface FloatingElementPanelProps {
  element: CanvasElement
  onChange: (updated: CanvasElement) => void
  onDelete: (id: string) => void
  onBringForward: () => void
  onSendBackward: () => void
  onClose: () => void
}

export default function FloatingElementPanel({ element, onChange, onDelete, onClose, onSendBackward, onBringForward }: FloatingElementPanelProps) {
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      width: 240,
      background: '#1e2028',
      borderRadius: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      zIndex: 10,
      fontFamily: 'inherit',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px 8px',
        borderBottom: '1px solid #2a2d3a',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {element.type}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#6b7280',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0,
          display: 'flex', alignItems: 'center',
        }}>×</button>
      </div>
      <div style={{ padding: '8px 0', maxHeight: 420, overflowY: 'auto' }}>
        <PropertiesPanel 
          element={element} 
          onChange={onChange} 
          onDelete={onDelete} 
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
        />
      </div>
    </div>
  )
}