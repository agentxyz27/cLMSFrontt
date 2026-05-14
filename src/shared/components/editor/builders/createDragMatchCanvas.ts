import type { DragMatchContent, CanvasData, CanvasElement } from '@/shared/types'

const CANVAS_WIDTH  = 1280
const CANVAS_HEIGHT = 720

const PROMPT_HEIGHT    = 80
const ITEM_HEIGHT      = 52
const TARGET_HEIGHT    = 120
const ITEM_WIDTH       = 140
const TARGET_WIDTH     = 140
const VERTICAL_PADDING = 40
const GAP              = 24

const ITEM_COLORS   = ['#f59e0b', '#f43f5e', '#3b82f6', '#8b5cf6', '#10b981']
const TARGET_COLORS = ['#10b981', '#8b5cf6', '#f43f5e', '#3b82f6', '#f59e0b']

function uid() {
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function createDragMatchCanvas(content: DragMatchContent): CanvasData {
  const { items, targets, prompt } = content
  const count = items.length

  // ── Prompt element ───────────────────────────────────────────────────────
  const promptEl: CanvasElement = {
    id: uid(),
    type: 'text',
    x: CANVAS_WIDTH * 0.1,
    y: VERTICAL_PADDING,
    width: CANVAS_WIDTH * 0.8,
    height: PROMPT_HEIGHT,
    rotation: 0,
    props: {
      text: prompt,
      fontSize: 28,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    },
  }

  // ── Layout calculations ──────────────────────────────────────────────────
  const totalItemWidth   = count * ITEM_WIDTH   + (count - 1) * GAP
  const totalTargetWidth = count * TARGET_WIDTH + (count - 1) * GAP
  const itemStartX       = (CANVAS_WIDTH - totalItemWidth)   / 2
  const targetStartX     = (CANVAS_WIDTH - totalTargetWidth) / 2
  const targetY          = PROMPT_HEIGHT + VERTICAL_PADDING * 2
  const itemY            = CANVAS_HEIGHT - ITEM_HEIGHT - VERTICAL_PADDING * 2

  // ── Target elements ──────────────────────────────────────────────────────
  const targetEls: CanvasElement[] = targets.map((target, i) => ({
    id: uid(),
    type: 'drag-target',
    x: targetStartX + i * (TARGET_WIDTH + GAP),
    y: targetY,
    width: TARGET_WIDTH,
    height: TARGET_HEIGHT,
    rotation: 0,
    props: {
      label: target.label,
      accepts: target.accepts,   // semantic id — points to item.id not canvas el id
      color: TARGET_COLORS[i % TARGET_COLORS.length],
    },
  }))

  // ── Item elements ────────────────────────────────────────────────────────
  const itemEls: CanvasElement[] = items.map((item, i) => ({
    id: uid(),
    type: 'drag-item',
    x: itemStartX + i * (ITEM_WIDTH + GAP),
    y: itemY,
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    rotation: 0,
    props: {
      label: item.label,
      color: ITEM_COLORS[i % ITEM_COLORS.length],
      textColor: '#ffffff',
    },
  }))

  return {
    canvas: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#0f1117',
    },
    elements: [promptEl, ...targetEls, ...itemEls],
  }
}