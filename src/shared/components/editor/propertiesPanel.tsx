import type { PropertiesPanelProps } from './editorTypes'
import type { TextElementProps, ImageElementProps, ShapeElementProps, CanvasElement, CanvasElementProps } from '@/shared/types'

const s = {
  section: { padding: '6px 12px 10px' } as React.CSSProperties,
  label: { fontSize: 11, color: '#6b7280', marginBottom: 4, display: 'block' } as React.CSSProperties,
  input: {
    width: '100%', background: '#12141a', border: '1px solid #2a2d3a',
    borderRadius: 6, color: '#e5e7eb', fontSize: 13, padding: '5px 8px',
    outline: 'none', boxSizing: 'border-box',
  } as React.CSSProperties,
  row: { display: 'flex', gap: 6 } as React.CSSProperties,
  divider: { height: 1, background: '#2a2d3a', margin: '2px 0' } as React.CSSProperties,
  iconBtn: (active: boolean) => ({
    flex: 1, padding: '5px 0', background: active ? '#2d3a5c' : '#12141a',
    border: `1px solid ${active ? '#4b6bfb' : '#2a2d3a'}`, borderRadius: 6,
    color: active ? '#fff' : '#9ca3af', cursor: 'pointer', fontSize: 13,
    textAlign: 'center',
  } as React.CSSProperties),
  deleteBtn: {
    width: '100%', marginTop: 2, padding: '7px 0',
    background: 'none', border: '1px solid #3f1f1f',
    borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 12,
  } as React.CSSProperties,
  sectionTitle: { fontSize: 11, color: '#6b7280', padding: '6px 12px 4px', display: 'block' } as React.CSSProperties,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={s.label}>{label}</span>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ ...s.label, marginBottom: 0, flex: 1 }}>{label}</span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 5, background: value,
          border: '2px solid #2a2d3a', cursor: 'pointer', flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{value}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default function PropertiesPanel({ element, onChange, onDelete, onSendBackward, onBringForward }: PropertiesPanelProps) {
  if (!element) return null

  function updateProps(partial: Partial<TextElementProps & ImageElementProps & ShapeElementProps>) {
    onChange({ ...element!, props: { ...element!.props, ...partial } as CanvasElementProps })
  }

  const p = element.props as TextElementProps & ImageElementProps & ShapeElementProps

  return (
    <div style={{ color: '#e5e7eb' }}>

      {/* Position & Size */}
      <span style={s.sectionTitle}>Position & Size</span>
      <div style={s.section}>
        <div style={s.row}>
          <Field label="X">
            <input style={s.input} type="number" value={Math.round(element.x)}
              onChange={e => onChange({ ...element, x: +e.target.value })} />
          </Field>
          <Field label="Y">
            <input style={s.input} type="number" value={Math.round(element.y)}
              onChange={e => onChange({ ...element, y: +e.target.value })} />
          </Field>
        </div>
        <div style={s.row}>
          <Field label="W">
            <input style={s.input} type="number" value={Math.round(element.width)}
              onChange={e => onChange({ ...element, width: +e.target.value })} />
          </Field>
          <Field label="H">
            <input style={s.input} type="number" value={Math.round(element.height)}
              onChange={e => onChange({ ...element, height: +e.target.value })} />
          </Field>
        </div>
      </div>

      <div style={s.divider} />

      {/* Text */}
      {element.type === 'text' && (
        <>
          <span style={s.sectionTitle}>Text</span>
          <div style={s.section}>
            <Field label="Content">
              <textarea value={p.text} onChange={e => updateProps({ text: e.target.value })}
                rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </Field>
            <Field label="Font size">
              <input style={s.input} type="number" value={p.fontSize} min={8} max={120}
                onChange={e => updateProps({ fontSize: +e.target.value })} />
            </Field>
            <ColorRow label="Color" value={p.color} onChange={c => updateProps({ color: c })} />
            <Field label="Style">
              <div style={s.row}>
                {(['normal', 'bold', 'italic'] as const).map(v => (
                  <button key={v} style={s.iconBtn(p.fontStyle === v || (!p.fontStyle && v === 'normal'))}
                    onClick={() => updateProps({ fontStyle: v })}>
                    {v === 'normal' ? 'Aa' : v === 'bold' ? 'B' : 'I'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Align">
              <div style={s.row}>
                {(['left', 'center', 'right'] as const).map(v => (
                  <button key={v} style={s.iconBtn(p.align === v || (!p.align && v === 'left'))}
                    onClick={() => updateProps({ align: v })}>
                    {v === 'left' ? '⬛▬▬' : v === 'center' ? '▬⬛▬' : '▬▬⬛'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </>
      )}

      {/* Image */}
      {element.type === 'image' && (
        <>
          <span style={s.sectionTitle}>Image</span>
          <div style={s.section}>
            <Field label="Alt text">
              <input style={s.input} type="text" value={p.alt}
                onChange={e => updateProps({ alt: e.target.value })} />
            </Field>
            <Field label="URL">
              <input style={s.input} type="text" value={p.url}
                onChange={e => updateProps({ url: e.target.value })} />
            </Field>
          </div>
        </>
      )}

      {/* Shape */}
      {element.type === 'shape' && (
        <>
          <span style={s.sectionTitle}>Shape</span>
          <div style={s.section}>
            <ColorRow label="Fill" value={p.fill} onChange={c => updateProps({ fill: c })} />
            <ColorRow label="Stroke" value={p.stroke} onChange={c => updateProps({ stroke: c })} />
            <Field label="Stroke width">
              <input style={s.input} type="number" value={p.strokeWidth} min={0} max={20}
                onChange={e => updateProps({ strokeWidth: +e.target.value })} />
            </Field>
            <Field label="Type">
              <div style={s.row}>
                {(['rect', 'ellipse'] as const).map(v => (
                  <button key={v} style={s.iconBtn(p.shape === v)}
                    onClick={() => updateProps({ shape: v })}>
                    {v === 'rect' ? '▭' : '⬭'}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </>
      )}
      <div style={s.divider} />

        <div style={{ padding: '8px 12px', display: 'flex', gap: 6 }}>
          <button style={{ ...s.iconBtn(false), flex: 1 }} onClick={onSendBackward}>↓ Back</button>
          <button style={{ ...s.iconBtn(false), flex: 1 }} onClick={onBringForward}>↑ Front</button>
        </div>

      <div style={s.divider} />
      <div style={{ padding: '8px 12px' }}>
        <button style={s.deleteBtn} onClick={() => onDelete(element.id)}>Delete</button>
      </div>
    </div>
  )
}