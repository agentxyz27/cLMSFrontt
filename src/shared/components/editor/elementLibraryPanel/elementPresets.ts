/**
 * elementPresets.ts
 *
 * Static preset library for the canvas element picker.
 * Each preset is a complete CanvasElement definition (no factory needed).
 *
 * Structure:
 *   ElementPresetCategory[]
 *     └── presets: ElementPreset[]
 *           └── element: CanvasElement  ← dropped directly onto canvas
 *
 * To make this backend-driven later:
 *   Replace ELEMENT_PRESET_LIBRARY with a fetch from GET /element-presets
 *   and cache in useElementPresets.ts. Shape stays identical.
 */

import type { CanvasElement } from '@/shared/types'

// ── Preset types ────────────────────────────────────────────────────────────

export type PresetTab = 'text' | 'shape' | 'elements' | 'images'

export interface ElementPreset {
  id: string
  label: string
  element: Omit<CanvasElement, 'id'>
}

export interface ElementPresetCategory {
  category: string
  presets: ElementPreset[]
}

export type ElementPresetLibrary = Record<Exclude<PresetTab, 'images'>, ElementPresetCategory[]>

// ── Helpers ─────────────────────────────────────────────────────────────────

const el = (partial: Omit<CanvasElement, 'id' | 'rotation'>): Omit<CanvasElement, 'id'> => ({
  ...partial,
  rotation: 0,
})

// ── Text Presets ─────────────────────────────────────────────────────────────

const TEXT_PRESETS: ElementPresetCategory[] = [
  {
    category: 'Heading',
    presets: [
      {
        id: 'text-heading-classic',
        label: 'Classic Heading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 400, height: 72,
          props: { text: 'Heading', fontSize: 48, color: '#111111', fontStyle: 'bold', align: 'left' },
        }),
      },
      {
        id: 'text-heading-serif',
        label: 'Serif Heading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 400, height: 72,
          props: { text: 'Heading', fontSize: 48, color: '#1a1a2e', fontStyle: 'bold', align: 'left' },
        }),
      },
      {
        id: 'text-heading-light',
        label: 'Light Heading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 400, height: 72,
          props: { text: 'Heading', fontSize: 48, color: '#555555', fontStyle: 'normal', align: 'left' },
        }),
      },
      {
        id: 'text-heading-accent',
        label: 'Accent Heading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 400, height: 72,
          props: { text: 'Heading', fontSize: 48, color: '#4A90D9', fontStyle: 'bold', align: 'center' },
        }),
      },
    ],
  },
  {
    category: 'Subheading',
    presets: [
      {
        id: 'text-sub-default',
        label: 'Subheading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 360, height: 48,
          props: { text: 'Subheading', fontSize: 32, color: '#333333', fontStyle: 'normal', align: 'left' },
        }),
      },
      {
        id: 'text-sub-muted',
        label: 'Muted Subheading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 360, height: 48,
          props: { text: 'Subheading', fontSize: 32, color: '#888888', fontStyle: 'italic', align: 'left' },
        }),
      },
      {
        id: 'text-sub-bold',
        label: 'Bold Subheading',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 360, height: 48,
          props: { text: 'Subheading', fontSize: 32, color: '#111111', fontStyle: 'bold', align: 'left' },
        }),
      },
    ],
  },
  {
    category: 'Body',
    presets: [
      {
        id: 'text-body-default',
        label: 'Body Text',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 340, height: 36,
          props: { text: 'Body text goes here', fontSize: 20, color: '#333333', fontStyle: 'normal', align: 'left' },
        }),
      },
      {
        id: 'text-body-centered',
        label: 'Centered Body',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 340, height: 36,
          props: { text: 'Body text goes here', fontSize: 20, color: '#333333', fontStyle: 'normal', align: 'center' },
        }),
      },
      {
        id: 'text-body-italic',
        label: 'Italic Body',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 340, height: 36,
          props: { text: 'Body text goes here', fontSize: 20, color: '#555555', fontStyle: 'italic', align: 'left' },
        }),
      },
    ],
  },
  {
    category: 'Label & Caption',
    presets: [
      {
        id: 'text-label-default',
        label: 'Label',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 200, height: 28,
          props: { text: 'LABEL', fontSize: 13, color: '#888888', fontStyle: 'bold', align: 'left' },
        }),
      },
      {
        id: 'text-caption',
        label: 'Caption',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 260, height: 28,
          props: { text: 'Caption text', fontSize: 13, color: '#aaaaaa', fontStyle: 'italic', align: 'left' },
        }),
      },
      {
        id: 'text-callout',
        label: 'Callout',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 320, height: 36,
          props: { text: '💡 Key insight here', fontSize: 18, color: '#d97706', fontStyle: 'bold', align: 'left' },
        }),
      },
    ],
  },
  {
    category: 'Decorative',
    presets: [
      {
        id: 'text-deco-poppy',
        label: 'Poppy',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 380, height: 80,
          props: { text: 'Fun Title!', fontSize: 52, color: '#f43f5e', fontStyle: 'bold', align: 'center' },
        }),
      },
      {
        id: 'text-deco-big-number',
        label: 'Big Number',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 200, height: 120,
          props: { text: '01', fontSize: 96, color: '#e5e7eb', fontStyle: 'bold', align: 'center' },
        }),
      },
      {
        id: 'text-deco-question',
        label: 'Question Prompt',
        element: el({
          type: 'text',
          x: 100, y: 100, width: 420, height: 60,
          props: { text: 'What do you think about...?', fontSize: 28, color: '#6366f1', fontStyle: 'italic', align: 'center' },
        }),
      },
    ],
  },
]

// ── Shape Presets ─────────────────────────────────────────────────────────────

const SHAPE_PRESETS: ElementPresetCategory[] = [
  {
    category: 'Rectangle',
    presets: [
      {
        id: 'shape-rect-solid',
        label: 'Solid Rect',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: '#4A90D9', stroke: '#2c5f8a', strokeWidth: 0, shape: 'rect' },
        }),
      },
      {
        id: 'shape-rect-outline',
        label: 'Outline Rect',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: 'transparent', stroke: '#4A90D9', strokeWidth: 3, shape: 'rect' },
        }),
      },
      {
        id: 'shape-rect-soft',
        label: 'Soft Rect',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1, shape: 'rect' },
        }),
      },
      {
        id: 'shape-rect-dark',
        label: 'Dark Rect',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: '#1e293b', stroke: '#334155', strokeWidth: 0, shape: 'rect' },
        }),
      },
      {
        id: 'shape-rect-accent',
        label: 'Accent Rect',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: '#fef3c7', stroke: '#f59e0b', strokeWidth: 2, shape: 'rect' },
        }),
      },
    ],
  },
  {
    category: 'Ellipse',
    presets: [
      {
        id: 'shape-ellipse-solid',
        label: 'Solid Circle',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 160, height: 160,
          props: { fill: '#10b981', stroke: '#059669', strokeWidth: 0, shape: 'ellipse' },
        }),
      },
      {
        id: 'shape-ellipse-outline',
        label: 'Outline Circle',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 160, height: 160,
          props: { fill: 'transparent', stroke: '#10b981', strokeWidth: 3, shape: 'ellipse' },
        }),
      },
      {
        id: 'shape-ellipse-soft',
        label: 'Soft Oval',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 200, height: 120,
          props: { fill: '#fdf2f8', stroke: '#f0abfc', strokeWidth: 1, shape: 'ellipse' },
        }),
      },
      {
        id: 'shape-ellipse-bold',
        label: 'Bold Circle',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 160, height: 160,
          props: { fill: '#f43f5e', stroke: '#e11d48', strokeWidth: 0, shape: 'ellipse' },
        }),
      },
    ],
  },
  {
    category: 'Decorative',
    presets: [
      {
        id: 'shape-divider',
        label: 'Divider',
        element: el({
          type: 'shape',
          x: 60, y: 200, width: 560, height: 4,
          props: { fill: '#e5e7eb', stroke: 'transparent', strokeWidth: 0, shape: 'rect' },
        }),
      },
      {
        id: 'shape-badge',
        label: 'Badge',
        element: el({
          type: 'shape',
          x: 100, y: 100, width: 120, height: 40,
          props: { fill: '#6366f1', stroke: 'transparent', strokeWidth: 0, shape: 'ellipse' },
        }),
      },
      {
        id: 'shape-card-bg',
        label: 'Card BG',
        element: el({
          type: 'shape',
          x: 60, y: 60, width: 560, height: 340,
          props: { fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1, shape: 'rect' },
        }),
      },
    ],
  },
]

// ── Interactive Element Presets ───────────────────────────────────────────────

const INTERACTIVE_PRESETS: ElementPresetCategory[] = [
  {
    category: 'Drag & Match',
    presets: [
      {
        id: 'drag-item-blue',
        label: 'Drag Item (Blue)',
        element: el({
          type: 'drag-item',
          x: 100, y: 400, width: 140, height: 52,
          props: { label: 'Item', color: '#4A90D9', textColor: '#ffffff' },
        }),
      },
      {
        id: 'drag-item-green',
        label: 'Drag Item (Green)',
        element: el({
          type: 'drag-item',
          x: 100, y: 400, width: 140, height: 52,
          props: { label: 'Item', color: '#10b981', textColor: '#ffffff' },
        }),
      },
      {
        id: 'drag-item-rose',
        label: 'Drag Item (Rose)',
        element: el({
          type: 'drag-item',
          x: 100, y: 400, width: 140, height: 52,
          props: { label: 'Item', color: '#f43f5e', textColor: '#ffffff' },
        }),
      },
      {
        id: 'drag-item-amber',
        label: 'Drag Item (Amber)',
        element: el({
          type: 'drag-item',
          x: 100, y: 400, width: 140, height: 52,
          props: { label: 'Item', color: '#f59e0b', textColor: '#ffffff' },
        }),
      },
      {
        id: 'drag-target-teal',
        label: 'Drop Target (Teal)',
        element: el({
          type: 'drag-target',
          x: 300, y: 200, width: 140, height: 140,
          props: { accepts: '', label: 'Target', color: '#10b981' },
        }),
      },
      {
        id: 'drag-target-violet',
        label: 'Drop Target (Violet)',
        element: el({
          type: 'drag-target',
          x: 300, y: 200, width: 140, height: 140,
          props: { accepts: '', label: 'Target', color: '#8b5cf6' },
        }),
      },
    ],
  },
  {
    category: 'Multiple Choice',
    presets: [
      {
        id: 'mc-option-light',
        label: 'MC Option (Light)',
        element: el({
          type: 'mc-option',
          x: 100, y: 500, width: 160, height: 52,
          props: { label: 'Option A', index: 0, color: '#f3f4f6', textColor: '#111111' },
        }),
      },
      {
        id: 'mc-option-blue',
        label: 'MC Option (Blue)',
        element: el({
          type: 'mc-option',
          x: 100, y: 500, width: 160, height: 52,
          props: { label: 'Option A', index: 0, color: '#dbeafe', textColor: '#1e40af' },
        }),
      },
      {
        id: 'mc-option-outlined',
        label: 'MC Option (Outlined)',
        element: el({
          type: 'mc-option',
          x: 100, y: 500, width: 160, height: 52,
          props: { label: 'Option A', index: 0, color: '#ffffff', textColor: '#374151' },
        }),
      },
    ],
  },
]

// ── Master Library ────────────────────────────────────────────────────────────

export const ELEMENT_PRESET_LIBRARY: ElementPresetLibrary = {
  text:     TEXT_PRESETS,
  shape:    SHAPE_PRESETS,
  elements: INTERACTIVE_PRESETS,
}