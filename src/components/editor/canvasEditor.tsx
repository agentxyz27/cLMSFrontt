/**
 * CanvasEditor.tsx
 *
 * Main canvas editor component.
 * Wires together EditorToolbar, CanvasStage, and PropertiesPanel.
 *
 * Features:
 *   - Add text, image, shape elements
 *   - Delete selected element via Delete/Backspace key or properties panel button
 *   - Change background color via color picker
 *   - Change background image via URL prompt
 *   - Save canvas JSON to backend
 */
import { useState, useCallback, useEffect } from 'react'
import { api } from '../../api/api'
import EditorToolbar from './editorToolbar'
import CanvasStage from './canvasStage'
import PropertiesPanel from './propertiesPanel'
import type { CanvasData, CanvasElement } from '../../types'

const BLANK_CANVAS: CanvasData = {
  canvas: { width: 1280, height: 720, background: '#ffffff' },
  elements: []
}

let _idCounter = 0
function generateId(): string {
  _idCounter += 1
  return `el_${Date.now()}_${_idCounter}`
}

function makeTextElement(): CanvasElement {
  return {
    id: generateId(), type: 'text', x: 100, y: 100, width: 300, height: 60,
    props: { text: 'Text here', fontSize: 24, color: '#111111', fontStyle: 'normal', align: 'left' }
  }
}

function makeImageElement(url: string): CanvasElement {
  return {
    id: generateId(), type: 'image', x: 100, y: 100, width: 300, height: 200,
    props: { url, alt: 'Image' }
  }
}

function makeShapeElement(): CanvasElement {
  return {
    id: generateId(), type: 'shape', x: 100, y: 100, width: 200, height: 120,
    props: { fill: '#4A90D9', stroke: '#2c5f8a', strokeWidth: 2, shape: 'rect' }
  }
}

interface CanvasEditorProps {
  lessonId: number
  initial: CanvasData | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const [canvasData, setCanvasData] = useState<CanvasData>(initial ?? BLANK_CANVAS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const selectedElement = canvasData.elements.find(el => el.id === selectedId) ?? null

  const addElement = useCallback((element: CanvasElement) => {
    setCanvasData(prev => ({ ...prev, elements: [...prev.elements, element] }))
    setSelectedId(element.id)
  }, [])

  const updateElement = useCallback((updated: CanvasElement) => {
    setCanvasData(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === updated.id ? updated : el)
    }))
  }, [])

  const deleteElement = useCallback((id: string) => {
    setCanvasData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }))
    setSelectedId(null)
  }, [])

  // ── Keyboard delete ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or select
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteElement(selectedId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, deleteElement])

  // ── Background handlers ──────────────────────────────────────────────────
  const handleBackgroundColorChange = useCallback((color: string) => {
    setCanvasData(prev => ({
      ...prev,
      canvas: { ...prev.canvas, background: color }
    }))
  }, [])

  const handleBackgroundImageChange = useCallback((url: string) => {
    setCanvasData(prev => ({
      ...prev,
      canvas: { ...prev.canvas, backgroundImage: url }
    }))
  }, [])

  // ── Add element handlers ─────────────────────────────────────────────────
  function handleAddText() { addElement(makeTextElement()) }

  function handleAddImage() {
    const url = window.prompt('Enter image URL:')
    if (!url?.trim()) return
    addElement(makeImageElement(url.trim()))
  }

  function handleAddShape() { addElement(makeShapeElement()) }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await api.put(`/lessons/${lessonId}`, { contentJson: canvasData }, token)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <EditorToolbar
        saving={saving}
        background={canvasData.canvas.background}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onBackgroundColorChange={handleBackgroundColorChange}
        onBackgroundImageChange={handleBackgroundImageChange}
        onSave={handleSave}
        onDone={onDone}
      />

      {saveError && (
        <div style={{ background: '#fee', color: '#c00', padding: '6px 12px', fontSize: '13px' }}>
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div style={{ background: '#efe', color: '#060', padding: '6px 12px', fontSize: '13px' }}>
          Saved successfully
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CanvasStage
          canvasData={canvasData}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={updateElement}
        />
        <PropertiesPanel
          element={selectedElement}
          onChange={updateElement}
          onDelete={deleteElement}
        />
      </div>
    </div>
  )
}