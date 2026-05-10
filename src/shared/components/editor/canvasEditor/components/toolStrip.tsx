/**
 * ToolStrip — full left sidebar.
 * Replaces EditorToolbar entirely: holds element tools, canvas background,
 * bg-image, save, and done/exit. Save status is shown as a small toast
 * that appears briefly below the save button.
 *
 * When isQuizNode is true, shows interactive element tools:
 * drag-item, drag-target, mc-option
 */
import React from 'react'
import { Type, Image, Square } from 'lucide-react'

interface ToolStripProps {
  // canvas
  background: string
  onAddText: () => void
  onAddImage: () => void
  onAddShape: () => void
  onBackgroundColorChange: (color: string) => void
  onBackgroundImageChange: (url: string) => void
  // interactive elements — only shown on quiz nodes
  isQuizNode: boolean
  onAddDragItem: () => void
  onAddDragTarget: () => void
  onAddMcOption: () => void
  // save / exit
  saving: boolean
  saveError: string | null
  saveSuccess: boolean
  onSave: () => void
  onDone: () => void
}

// ── Shared button style helpers ────────────────────────────────────────────

function iconBtn(title: string, onClick: () => void, children: React.ReactNode, accent = '#3b82f6') {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: '1px solid transparent',
        background: 'none', color: '#8b8fa8',
        fontSize: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s', flexShrink: 0
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#1e2130'
        e.currentTarget.style.color = '#e2e8f0'
        e.currentTarget.style.borderColor = accent
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none'
        e.currentTarget.style.color = '#8b8fa8'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 28, height: 1, background: '#2a2d3a', margin: '4px 0' }} />
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 8, fontWeight: 700, letterSpacing: '0.08em',
      color: '#4b5568', textTransform: 'uppercase',
      marginTop: 4, marginBottom: 2
    }}>
      {children}
    </div>
  )
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ToolStrip({
  background,
  onAddText,
  onAddImage,
  onAddShape,
  onBackgroundColorChange,
  onBackgroundImageChange,
  isQuizNode,
  onAddDragItem,
  onAddDragTarget,
  onAddMcOption,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onDone
}: ToolStripProps) {

  function handleBgImage() {
    const url = window.prompt('Enter background image URL:')
    if (url?.trim()) onBackgroundImageChange(url.trim())
  }

  return (
    <div style={{
      width: 52,
      background: '#16181f',
      borderRight: '1px solid #2a2d3a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px 0',
      gap: 2,
      flexShrink: 0,
      overflowY: 'auto'
    }}>

      {/* ── Element tools ── */}
      {iconBtn('Add text', onAddText, <Type size={18} />)}
      {iconBtn('Add image', onAddImage, <Image size={18} />)}
      {iconBtn('Add shape', onAddShape, <Square size={18} />)}

      <Divider />

      {/* ── Interactive tools — quiz nodes only ── */}
      {isQuizNode && (
        <>
          <SectionLabel>Quiz</SectionLabel>
          {iconBtn('Add drag item',   onAddDragItem,   '✋', '#f59e0b')}
          {iconBtn('Add drag target', onAddDragTarget, '🎯', '#10b981')}
          {iconBtn('Add MC option',   onAddMcOption,   'A)', '#6366f1')}
          <Divider />
        </>
      )}

      {/* ── Background color swatch ── */}
      <div
        title="Canvas background color"
        style={{
          position: 'relative', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background,
          border: '2px solid #3b4060',
          boxShadow: '0 0 0 1px #0f1117',
          pointerEvents: 'none'
        }} />
        <input
          type="color"
          value={background}
          onChange={e => onBackgroundColorChange(e.target.value)}
          style={{
            opacity: 0, position: 'absolute', inset: 0,
            width: '100%', height: '100%', cursor: 'crosshair'
          }}
        />
      </div>

      {/* ── Background image ── */}
      {iconBtn('Set background image', handleBgImage, '🏞')}

      {/* ── Spacer pushes save/done to bottom ── */}
      <div style={{ flex: 1 }} />

      <Divider />

      {/* ── Save ── */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {iconBtn(
          saving ? 'Saving…' : 'Save (⌘S)',
          onSave,
          saving ? <span style={{ fontSize: 11 }}>…</span> : '💾',
          '#10b981'
        )}

        {/* Toast */}
        {(saveSuccess || saveError) && (
          <div style={{
            position: 'absolute',
            left: 44, top: 4,
            whiteSpace: 'nowrap',
            background: saveError ? '#450a0a' : '#052e16',
            color: saveError ? '#fca5a5' : '#86efac',
            fontSize: 11,
            padding: '4px 8px',
            borderRadius: 6,
            border: `1px solid ${saveError ? '#7f1d1d' : '#14532d'}`,
            pointerEvents: 'none',
            zIndex: 50
          }}>
            {saveError ?? 'Saved'}
          </div>
        )}
      </div>

      {/* ── Done / exit ── */}
      {iconBtn('Exit editor', onDone, '✕', '#ef4444')}

    </div>
  )
}