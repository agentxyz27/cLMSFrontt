import type { MultipleChoiceContent, CanvasData, CanvasElement } from '@/shared/types'

const CANVAS_WIDTH  = 1280
const CANVAS_HEIGHT = 720

const PROMPT_HEIGHT    = 80
const VERTICAL_PADDING = 40
const CHOICE_WIDTH     = 520
const CHOICE_HEIGHT    = 120
const COL_GAP          = 40
const ROW_GAP          = 24

const CHOICE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

function uid() {
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function createMultipleChoiceCanvas(content: MultipleChoiceContent): CanvasData {
  const { choices, prompt } = content

  // ── Prompt ───────────────────────────────────────────────────────────────
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

  // ── 2x2 grid layout ──────────────────────────────────────────────────────
  // Total grid width: 2 cols + 1 gap
  const gridWidth  = CHOICE_WIDTH * 2 + COL_GAP
  const gridStartX = (CANVAS_WIDTH - gridWidth) / 2
  const gridStartY = PROMPT_HEIGHT + VERTICAL_PADDING * 2

  const choiceEls: CanvasElement[] = choices.slice(0, 4).map((choice, i) => {
    const col = i % 2        // 0 or 1
    const row = Math.floor(i / 2)  // 0 or 1

    return {
      id: uid(),
      type: 'mc-option',
      x: gridStartX + col * (CHOICE_WIDTH + COL_GAP),
      y: gridStartY + row * (CHOICE_HEIGHT + ROW_GAP),
      width: CHOICE_WIDTH,
      height: CHOICE_HEIGHT,
      rotation: 0,
      props: {
        label: choice.label,
        index: i,            // kept for visual reference only — not used for correctness
        color: CHOICE_COLORS[i % CHOICE_COLORS.length],
        textColor: '#ffffff',
      },
    }
  })

  return {
    canvas: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      background: '#0f1117',
    },
    elements: [promptEl, ...choiceEls],
  }
}