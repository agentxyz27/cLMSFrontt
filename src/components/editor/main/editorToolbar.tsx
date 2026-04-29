/**
 * EditorToolbar.tsx
 *
 * Top bar of the canvas editor.
 * Contains buttons to add elements, save, navigate away,
 * and controls for background color and background image.
 */
import type { EditorToolbarProps } from './editorTypes'

export default function EditorToolbar({
  saving,
  background,
  onAddText,
  onAddImage,
  onAddShape,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onSave,
  onDone
}: EditorToolbarProps) {

  function handleBackgroundImage() {
    const url = window.prompt('Enter background image URL:')
    if (url?.trim()) onBackgroundImageChange(url.trim())
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderBottom: '1px solid #ddd',
      background: '#fafafa',
      flexWrap: 'wrap'
    }}>
      {/* Add element buttons */}
      <span style={{ fontWeight: 'bold', marginRight: '4px' }}>Add:</span>
      <button onClick={onAddText}>+ Text</button>
      <button onClick={onAddImage}>+ Image</button>
      <button onClick={onAddShape}>+ Shape</button>

      <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 4px' }} />

      {/* Background controls */}
      <span style={{ fontWeight: 'bold', marginRight: '4px' }}>Background:</span>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
        Color
        <input
          type="color"
          value={background}
          onChange={e => onBackgroundColorChange(e.target.value)}
          style={{ width: 32, height: 28, cursor: 'pointer', border: 'none', padding: 0 }}
        />
      </label>
      <button onClick={handleBackgroundImage}>+ BG Image</button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Save and done */}
      <button onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      <button onClick={onDone}>Done</button>
    </div>
  )
}