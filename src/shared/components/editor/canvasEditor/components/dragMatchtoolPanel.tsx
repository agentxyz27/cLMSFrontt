import type { CanvasElement, DragItemProps, DragTargetProps } from '@/shared/types'

interface Props {
  dragItems:       CanvasElement[]
  dragTargets:     CanvasElement[]
  onLinkTarget:    (targetId: string, acceptsItemId: string) => void
  onUpdateElement: (el: CanvasElement) => void
}

const inputCss: React.CSSProperties = {
  width: '100%', fontSize: 11,
  padding: '4px 7px', borderRadius: 5,
  border: '1px solid #2a2d3a',
  background: '#0a0c12', color: '#e2e8f0',
  boxSizing: 'border-box', outline: 'none',
  marginTop: 3
}

const labelCss: React.CSSProperties = {
  display: 'block', fontSize: 10,
  color: '#6b7280', marginBottom: 8
}

export default function DragMatchToolPanel({
  dragItems,
  dragTargets,
  onLinkTarget,
  onUpdateElement
}: Props) {
  return (
    <div style={{ padding: 12 }}>

      {/* Header */}
      <div style={{
        fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', color: '#f59e0b',
        marginBottom: 12
      }}>
        DRAG MATCH CONFIG
      </div>

      {/* Drag items */}
      {dragItems.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: '#4A90D9', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Items ({dragItems.length})
          </div>
          {dragItems.map((item, i) => {
            const p = item.props as DragItemProps
            return (
              <div key={item.id} style={{
                marginBottom: 8, padding: 8,
                background: '#0f1117', borderRadius: 6,
                border: '1px solid #1e2130'
              }}>
                <div style={{ fontSize: 9, color: '#4b5568', marginBottom: 4 }}>
                  item_{i + 1} · {item.id.slice(-6)}
                </div>
                <label style={labelCss}>
                  Label
                  <input
                    type="text"
                    value={p.label}
                    onChange={e => onUpdateElement({
                      ...item,
                      props: { ...p, label: e.target.value }
                    })}
                    style={inputCss}
                  />
                </label>
                <label style={{ ...labelCss, marginBottom: 0 }}>
                  Color
                  <input
                    type="color"
                    value={p.color}
                    onChange={e => onUpdateElement({
                      ...item,
                      props: { ...p, color: e.target.value }
                    })}
                    style={{ ...inputCss, padding: 2, height: 28, cursor: 'pointer' }}
                  />
                </label>
              </div>
            )
          })}
        </div>
      )}

      {/* Drag targets */}
      {dragTargets.length > 0 && (
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: '#10b981', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Targets ({dragTargets.length})
          </div>
          {dragTargets.map((target, i) => {
            const p = target.props as DragTargetProps
            return (
              <div key={target.id} style={{
                marginBottom: 8, padding: 8,
                background: '#0f1117', borderRadius: 6,
                border: '1px solid #1e2130'
              }}>
                <div style={{ fontSize: 9, color: '#4b5568', marginBottom: 4 }}>
                  target_{i + 1} · {target.id.slice(-6)}
                </div>
                <label style={labelCss}>
                  Label
                  <input
                    type="text"
                    value={p.label}
                    onChange={e => onUpdateElement({
                      ...target,
                      props: { ...p, label: e.target.value }
                    })}
                    style={inputCss}
                  />
                </label>
                <label style={labelCss}>
                  Accepts (drag item)
                  <select
                    value={p.accepts}
                    onChange={e => onLinkTarget(target.id, e.target.value)}
                    style={inputCss}
                  >
                    <option value="">— Not linked —</option>
                    {dragItems.map((item, j) => {
                      const ip = item.props as DragItemProps
                      return (
                        <option key={item.id} value={item.id}>
                          item_{j + 1}: {ip.label}
                        </option>
                      )
                    })}
                  </select>
                </label>
                <label style={{ ...labelCss, marginBottom: 0 }}>
                  Color
                  <input
                    type="color"
                    value={p.color}
                    onChange={e => onUpdateElement({
                      ...target,
                      props: { ...p, color: e.target.value }
                    })}
                    style={{ ...inputCss, padding: 2, height: 28, cursor: 'pointer' }}
                  />
                </label>
              </div>
            )
          })}
        </div>
      )}

      {dragItems.length === 0 && dragTargets.length === 0 && (
        <p style={{ fontSize: 11, color: '#4b5568', lineHeight: 1.5 }}>
          Add drag items and targets from the toolbar to configure this question.
        </p>
      )}

    </div>
  )
}