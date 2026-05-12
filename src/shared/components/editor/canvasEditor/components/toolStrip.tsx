import { useState } from 'react'
import React from 'react'
import { ElementLibraryPanel } from '@/shared/components/editor/elementLibraryPanel'
import type { PresetTab } from '@/shared/components/editor/elementLibraryPanel/elementPresets'
import type { CanvasElement } from '@/shared/types'
import { Type, Image, Square, Component } from 'lucide-react'

interface ToolStripProps {
  background: string
  token: string | null
  onAddElement: (element: CanvasElement) => void
  onBackgroundColorChange: (color: string) => void
  onBackgroundImageChange: (url: string) => void
  isQuizNode: boolean
  onAddDragItem: () => void
  onAddDragTarget: () => void
  onAddMcOption: () => void
  saving: boolean
  saveError: string | null
  saveSuccess: boolean
  onSave: () => void
  onDone: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function IconBtn({
  title, onClick, children, accent = '#3b82f6', active = false,
}: {
  title: string
  onClick: () => void
  children: React.ReactNode
  accent?: string
  active?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: 8,
        border: `1px solid ${active ? accent : 'transparent'}`,
        background: active ? '#1e2130' : 'none',
        color: active ? '#e2e8f0' : '#8b8fa8',
        fontSize: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s', flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#1e2130'
        e.currentTarget.style.color = '#e2e8f0'
        e.currentTarget.style.borderColor = accent
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = active ? '#1e2130' : 'none'
        e.currentTarget.style.color = active ? '#e2e8f0' : '#8b8fa8'
        e.currentTarget.style.borderColor = active ? accent : 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div style={{ width: 28, height: 1, background: '#2a2d3a', margin: '4px 0' }} />
}


// ── Component ──────────────────────────────────────────────────────────────

export default function ToolStrip({
  background,
  token,
  onAddElement,
  onBackgroundColorChange,
  onBackgroundImageChange,
  saving,
  saveError,
  saveSuccess,
  onSave,
  onDone,
}: ToolStripProps) {
  const [activeTab, setActiveTab] = useState<PresetTab | null>(null)

  function toggleTab(tab: PresetTab) {
    setActiveTab(prev => prev === tab ? null : tab)
  }

  function handleBgImage() {
    const url = window.prompt('Enter background image URL:')
    if (url?.trim()) onBackgroundImageChange(url.trim())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', flexShrink: 0 }}>

      {/* ── Icon rail (always 52px) ── */}
      <div style={{
        width: 52,
        background: '#16181f',
        borderRight: '1px solid #2a2d3a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '10px 0',
        gap: 12, flexShrink: 0, overflowY: 'auto',
      }}>

        <IconBtn title="Text styles" onClick={() => toggleTab('text')} accent="#3b82f6" active={activeTab === 'text'}>
          <Type size={24}/>
        </IconBtn>

        <IconBtn title="Images" onClick={() => toggleTab('images')} accent="#3b82f6" active={activeTab === 'images'}>
          <Image size={24}/>
        </IconBtn>

        <IconBtn title="Shapes" onClick={() => toggleTab('shape')} accent="#3b82f6" active={activeTab === 'shape'}>
          <Square size={24}/>
        </IconBtn>

        <IconBtn title="Elements library" onClick={() => toggleTab('elements')} accent="#f59e0b" active={activeTab === 'elements'}>
          <Component size={24}/>
        </IconBtn>
        <Divider />

        {/* Background color swatch */}
        <div
          title="Canvas background color"
          style={{
            position: 'relative', width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 5,
            background,
            border: '2px solid #3b4060',
            boxShadow: '0 0 0 1px #0f1117',
            pointerEvents: 'none',
          }} />
          <input
            type="color"
            value={background}
            onChange={e => onBackgroundColorChange(e.target.value)}
            style={{
              opacity: 0, position: 'absolute', inset: 0,
              width: '100%', height: '100%', cursor: 'crosshair',
            }}
          />
        </div>

        <IconBtn title="Set background image" onClick={handleBgImage} accent="#3b82f6">🏞</IconBtn>

        <div style={{ flex: 1 }} />
        <Divider />

        {/* Save */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconBtn title={saving ? 'Saving…' : 'Save (⌘S)'} onClick={onSave} accent="#10b981">
            {saving ? <span style={{ fontSize: 11 }}>…</span> : '💾'}
          </IconBtn>
          {(saveSuccess || saveError) && (
            <div style={{
              position: 'absolute', left: 44, top: 4,
              whiteSpace: 'nowrap',
              background: saveError ? '#450a0a' : '#052e16',
              color: saveError ? '#fca5a5' : '#86efac',
              fontSize: 11, padding: '4px 8px', borderRadius: 6,
              border: `1px solid ${saveError ? '#7f1d1d' : '#14532d'}`,
              pointerEvents: 'none', zIndex: 50,
            }}>
              {saveError ?? 'Saved'}
            </div>
          )}
        </div>

        <IconBtn title="Exit editor" onClick={onDone} accent="#ef4444">✕</IconBtn>

      </div>

      {/* ── Expanding library panel ── */}
      <div style={{
        width: activeTab ? 260 : 0,
        overflow: 'hidden',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#16181f',
        borderRight: activeTab ? '1px solid #2a2d3a' : 'none',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        {activeTab && (
          <>
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: '1px solid #2a2d3a',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexShrink: 0,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#e2e8f0',
                letterSpacing: '-0.01em', whiteSpace: 'nowrap',
              }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Library
              </span>
              <button
                onClick={() => setActiveTab(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#4b5568', fontSize: 14, lineHeight: 1,
                  padding: 4, borderRadius: 4,
                  display: 'flex', alignItems: 'center',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4b5568' }}
              >
                ✕
              </button>
            </div>

            <ElementLibraryPanel
              activeTab={activeTab}
              onAddElement={onAddElement}
              token={token}
            />
          </>
        )}
      </div>

    </div>
  )
}