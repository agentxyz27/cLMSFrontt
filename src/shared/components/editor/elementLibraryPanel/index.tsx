import { useState, useRef } from 'react'
import { generateElementId } from '../canvasEditor/factories'
import {
  ELEMENT_PRESET_LIBRARY,
  type PresetTab,
  type ElementPreset,
  type ElementPresetCategory,
} from './elementPresets'
import type { CanvasElement } from '@/shared/types'

export interface ElementLibraryPanelProps {
  activeTab: PresetTab
  onAddElement: (element: CanvasElement) => void
  token: string | null
}

// ── Preset preview ────────────────────────────────────────────────────────────

function PresetPreview({ preset }: { preset: ElementPreset }) {
  const { type, props } = preset.element

  if (type === 'text') {
    const p = props as { text: string; fontSize: number; color: string; fontStyle?: string }
    return (
      <span style={{
        fontSize: Math.min(p.fontSize, 22),
        color: p.color === '#111111' || p.color === '#333333' ? '#e2e8f0' : p.color,
        fontWeight: p.fontStyle === 'bold' ? 700 : 400,
        fontStyle: p.fontStyle === 'italic' ? 'italic' : 'normal',
        display: 'block', lineHeight: 1.2,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        maxWidth: '100%',
      }}>
        {p.text}
      </span>
    )
  }

  if (type === 'shape') {
    const p = props as { fill: string; stroke: string; strokeWidth: number; shape: string }
    return (
      <div style={{
        width: 36, height: p.shape === 'ellipse' ? 36 : 24,
        borderRadius: p.shape === 'ellipse' ? '50%' : 5,
        background: p.fill === 'transparent' ? 'transparent' : p.fill,
        border: p.strokeWidth > 0 ? `${Math.min(p.strokeWidth, 2)}px solid ${p.stroke}` : '1px solid #2a2d3a',
        flexShrink: 0,
      }} />
    )
  }

  if (type === 'drag-item') {
    const p = props as { label: string; color: string; textColor: string }
    return (
      <div style={{
        padding: '3px 10px', borderRadius: 6,
        background: p.color, color: p.textColor,
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        {p.label}
      </div>
    )
  }

  if (type === 'drag-target') {
    const p = props as { label: string; color: string }
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 6,
        border: `2px dashed ${p.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: p.color, fontWeight: 600,
      }}>
        {p.label}
      </div>
    )
  }

  if (type === 'mc-option') {
    const p = props as { label: string; color: string; textColor: string }
    return (
      <div style={{
        padding: '3px 10px', borderRadius: 6,
        background: p.color === '#ffffff' || p.color === '#f3f4f6' ? '#2a2d3a' : p.color,
        color: p.textColor === '#111111' || p.textColor === '#374151' ? '#e2e8f0' : p.textColor,
        fontSize: 12, border: '1px solid #3b4060', whiteSpace: 'nowrap',
      }}>
        {p.label}
      </div>
    )
  }

  return <div style={{ width: 28, height: 28, background: '#2a2d3a', borderRadius: 5 }} />
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({ category, onAdd }: {
  category: ElementPresetCategory
  onAdd: (preset: ElementPreset) => void
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: '#4b5568', textTransform: 'uppercase', margin: '0 0 8px 0',
      }}>
        {category.category}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {category.presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onAdd(preset)}
            title={`Add ${preset.label}`}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              border: '1px solid #2a2d3a', background: '#1a1d27',
              cursor: 'pointer', textAlign: 'left', minHeight: 48,
              transition: 'background 0.12s, border-color 0.12s, transform 0.1s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1e2130'
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.transform = 'translateX(2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1a1d27'
              e.currentTarget.style.borderColor = '#2a2d3a'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'translateX(2px)' }}
          >
            <span style={{ fontSize: 12, color: '#8b8fa8', fontWeight: 500, flex: 1 }}>
              {preset.label}
            </span>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', minWidth: 72, overflow: 'hidden',
            }}>
              <PresetPreview preset={preset} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Uploaded image item ───────────────────────────────────────────────────────

interface UploadedImage {
  id: string
  url: string
  name: string
}

function ImageGrid({ images, onAdd }: {
  images: UploadedImage[]
  onAdd: (url: string) => void
}) {
  if (images.length === 0) return null
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: '#4b5568', textTransform: 'uppercase', margin: '0 0 8px 0',
      }}>
        Uploaded
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {images.map(img => (
          <button
            key={img.id}
            onClick={() => onAdd(img.url)}
            title={`Add ${img.name}`}
            style={{
              padding: 0, border: '1px solid #2a2d3a', borderRadius: 8,
              background: '#1a1d27', cursor: 'pointer', overflow: 'hidden',
              aspectRatio: '1', transition: 'border-color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d3a' }}
          >
            <img
              src={img.url}
              alt={img.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Images tab ────────────────────────────────────────────────────────────────

function ImagesTab({ onAddElement, token }: {
  onAddElement: (element: CanvasElement) => void
  token: string | null
}) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Upload failed')
      }

      const data = await res.json()
      setImages(prev => [{ id: crypto.randomUUID(), url: data.url, name: data.name }, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    uploadFile(files[0])
  }

  function handleAddImage(url: string) {
    onAddElement({
      id: generateElementId(),
      type: 'image',
      x: 100 + Math.floor(Math.random() * 16),
      y: 100 + Math.floor(Math.random() * 16),
      width: 320,
      height: 240,
      rotation: 0,
      props: { url: url, alt: '' },
    })
  }

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        style={{
          border: `2px dashed ${dragging ? '#3b82f6' : '#2a2d3a'}`,
          borderRadius: 10,
          padding: '20px 12px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? '#1e2130' : '#1a1d27',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <span style={{ fontSize: 24 }}>{uploading ? '⏳' : '🖼️'}</span>
        <span style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
          {uploading ? 'Uploading…' : 'Click or drag an image to upload'}
        </span>
        <span style={{ fontSize: 10, color: '#4b5568' }}>JPG, PNG, GIF, WEBP · max 10MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
      />

      {/* Error */}
      {error && (
        <div style={{
          fontSize: 11, color: '#fca5a5',
          background: '#450a0a', borderRadius: 6,
          padding: '6px 10px', border: '1px solid #7f1d1d',
        }}>
          {error}
        </div>
      )}

      {/* Image grid */}
      <ImageGrid images={images} onAdd={handleAddImage} />

    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function ElementLibraryPanel({ activeTab, onAddElement, token }: ElementLibraryPanelProps) {
  const handleAdd = (preset: ElementPreset) => {
    onAddElement({
      ...preset.element,
      id: generateElementId(),
      x: preset.element.x + Math.floor(Math.random() * 16),
      y: preset.element.y + Math.floor(Math.random() * 16),
    })
  }

  if (activeTab === 'images') {
    return <ImagesTab onAddElement={onAddElement} token={token} />
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '12px',
      scrollbarWidth: 'thin', scrollbarColor: '#2a2d3a transparent',
    }}>
      {ELEMENT_PRESET_LIBRARY[activeTab].map(cat => (
        <CategorySection key={cat.category} category={cat} onAdd={handleAdd} />
      ))}
    </div>
  )
}