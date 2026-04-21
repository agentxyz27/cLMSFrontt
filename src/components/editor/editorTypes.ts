/**
 * editorTypes.ts
 *
 * Types local to the canvas editor.
 * These are not API response shapes — they describe editor UI state.
 */

import type { CanvasData, CanvasElement } from '../../types'

/**
 * Full editor state held in CanvasEditor.tsx.
 * This is what gets serialized to contentJson on save.
 */
export interface EditorState {
  canvasData: CanvasData
  selectedId: string | null   // id of the currently selected element, null if none
}

/**
 * Props passed down to CanvasStage.
 */
export interface CanvasStageProps {
  canvasData: CanvasData
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (updated: CanvasElement) => void
}

/**
 * Props passed down to PropertiesPanel.
 */
export interface PropertiesPanelProps {
  element: CanvasElement | null
  onChange: (updated: CanvasElement) => void
  onDelete: (id: string) => void
}

/**
 * Props passed down to EditorToolbar.
 */
export interface EditorToolbarProps {
  saving: boolean
  onAddText: () => void
  onAddImage: () => void
  onAddShape: () => void
  onSave: () => void
  onDone: () => void
}

// Additional types for future features
export interface EditorToolbarProps {
  saving: boolean
  background: string
  onAddText: () => void
  onAddImage: () => void
  onAddShape: () => void
  onBackgroundColorChange: (color: string) => void
  onBackgroundImageChange: (url: string) => void
  onSave: () => void
  onDone: () => void
}