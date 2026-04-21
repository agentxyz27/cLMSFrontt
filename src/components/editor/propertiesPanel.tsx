/**
 * PropertiesPanel.tsx
 *
 * Right panel of the canvas editor.
 * Shows editable properties for the currently selected element.
 * If nothing is selected, shows a placeholder message.
 *
 * Supports:
 *   text  → text content, font size, color, font style, alignment
 *   image → alt text, image URL (replace image)
 *   shape → fill color, stroke color, stroke width
 *
 * onChange is called immediately on every field change — no confirm step.
 * Parent (CanvasEditor) holds state and re-renders the canvas.
 */

import type { PropertiesPanelProps } from './editorTypes'
import type {
  TextElementProps,
  ImageElementProps,
  ShapeElementProps,
  CanvasElement,
  CanvasElementProps
} from '../../types'

export default function PropertiesPanel({
  element,
  onChange,
  onDelete
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <div style={{
        width: '220px',
        borderLeft: '1px solid #ddd',
        padding: '16px',
        background: '#fafafa',
        color: '#999',
        fontSize: '14px'
      }}>
        <p>Select an element to edit its properties.</p>
      </div>
    )
  }

  // Helper — merges partial props update into the full element
  function updateProps(partial: Partial<TextElementProps & ImageElementProps & ShapeElementProps>) {
    if (!element) return
    const updated: CanvasElement = {
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      props: { ...element.props, ...partial } as CanvasElementProps
    }
    onChange(updated)
  }

  const props = element.props as TextElementProps & ImageElementProps & ShapeElementProps

  return (
    <div style={{
      width: '220px',
      borderLeft: '1px solid #ddd',
      padding: '16px',
      background: '#fafafa',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: '#555' }}>
        {element.type} properties
      </strong>

      {/* ── Position and size (all types) ── */}
      <fieldset style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
        <legend style={{ fontSize: '12px', color: '#777' }}>Position & Size</legend>
        <label style={{ fontSize: '13px' }}>X
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={e => onChange({ ...element, x: Number(e.target.value) })}
            style={{ width: '100%', marginTop: '2px' }}
          />
        </label>
        <label style={{ fontSize: '13px', marginTop: '6px', display: 'block' }}>Y
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={e => onChange({ ...element, y: Number(e.target.value) })}
            style={{ width: '100%', marginTop: '2px' }}
          />
        </label>
        <label style={{ fontSize: '13px', marginTop: '6px', display: 'block' }}>Width
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={e => onChange({ ...element, width: Number(e.target.value) })}
            style={{ width: '100%', marginTop: '2px' }}
          />
        </label>
        <label style={{ fontSize: '13px', marginTop: '6px', display: 'block' }}>Height
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={e => onChange({ ...element, height: Number(e.target.value) })}
            style={{ width: '100%', marginTop: '2px' }}
          />
        </label>
      </fieldset>

      {/* ── Text properties ── */}
      {element.type === 'text' && (
        <fieldset style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
          <legend style={{ fontSize: '12px', color: '#777' }}>Text</legend>

          <label style={{ fontSize: '13px', display: 'block' }}>Content
            <textarea
              value={props.text}
              onChange={e => updateProps({ text: e.target.value })}
              rows={4}
              style={{ width: '100%', marginTop: '2px', resize: 'vertical' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Font size
            <input
              type="number"
              value={props.fontSize}
              min={8}
              max={120}
              onChange={e => updateProps({ fontSize: Number(e.target.value) })}
              style={{ width: '100%', marginTop: '2px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Color
            <input
              type="color"
              value={props.color}
              onChange={e => updateProps({ color: e.target.value })}
              style={{ width: '100%', marginTop: '2px', height: '32px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Style
            <select
              value={props.fontStyle || 'normal'}
              onChange={e => updateProps({ fontStyle: e.target.value as TextElementProps['fontStyle'] })}
              style={{ width: '100%', marginTop: '2px' }}
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
            </select>
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Align
            <select
              value={props.align || 'left'}
              onChange={e => updateProps({ align: e.target.value as TextElementProps['align'] })}
              style={{ width: '100%', marginTop: '2px' }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </fieldset>
      )}

      {/* ── Image properties ── */}
      {element.type === 'image' && (
        <fieldset style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
          <legend style={{ fontSize: '12px', color: '#777' }}>Image</legend>

          <label style={{ fontSize: '13px', display: 'block' }}>Alt text
            <input
              type="text"
              value={props.alt}
              onChange={e => updateProps({ alt: e.target.value })}
              style={{ width: '100%', marginTop: '2px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Image URL
            <input
              type="text"
              value={props.url}
              onChange={e => updateProps({ url: e.target.value })}
              style={{ width: '100%', marginTop: '2px' }}
            />
          </label>
        </fieldset>
      )}

      {/* ── Shape properties ── */}
      {element.type === 'shape' && (
        <fieldset style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
          <legend style={{ fontSize: '12px', color: '#777' }}>Shape</legend>

          <label style={{ fontSize: '13px', display: 'block' }}>Fill color
            <input
              type="color"
              value={props.fill}
              onChange={e => updateProps({ fill: e.target.value })}
              style={{ width: '100%', marginTop: '2px', height: '32px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Stroke color
            <input
              type="color"
              value={props.stroke}
              onChange={e => updateProps({ stroke: e.target.value })}
              style={{ width: '100%', marginTop: '2px', height: '32px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Stroke width
            <input
              type="number"
              value={props.strokeWidth}
              min={0}
              max={20}
              onChange={e => updateProps({ strokeWidth: Number(e.target.value) })}
              style={{ width: '100%', marginTop: '2px' }}
            />
          </label>

          <label style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>Shape type
            <select
              value={props.shape}
              onChange={e => updateProps({ shape: e.target.value as ShapeElementProps['shape'] })}
              style={{ width: '100%', marginTop: '2px' }}
            >
              <option value="rect">Rectangle</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </label>
        </fieldset>
      )}

      {/* ── Delete ── */}
      <button
        onClick={() => onDelete(element.id)}
        style={{ marginTop: 'auto', color: 'red', background: 'none', border: '1px solid red', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
      >
        Delete element
      </button>
    </div>
  )
}