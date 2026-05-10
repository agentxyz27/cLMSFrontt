// shared/components/editor/stages/ViewerStage.tsx
// DOM-based, student lesson view — fully static
import type { CanvasData } from '@/shared/types'
import { TextRenderer, ImageRenderer, ShapeRenderer, DragItemRenderer, DragTargetRenderer, McOptionRenderer } from '../elements/dom'

export function ViewerStage({ canvasData, scale }: { canvasData: CanvasData; scale: number }) {
  const { canvas, elements } = canvasData
  return (
    <div style={{
      position: 'relative', width: canvas.width, height: canvas.height,
      background: canvas.background,
      ...(canvas.backgroundImage ? {
        backgroundImage: `url(${canvas.backgroundImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
      } : {}),
      transform: `scale(${scale})`, transformOrigin: 'top left',
      marginBottom: canvas.height * (scale - 1), overflow: 'hidden'
    }}>
      {elements.map(el => {
        if (el.type === 'text')        return <TextRenderer        key={el.id} element={el} />
        if (el.type === 'image')       return <ImageRenderer       key={el.id} element={el} />
        if (el.type === 'shape')       return <ShapeRenderer       key={el.id} element={el} />
        if (el.type === 'drag-item')   return <DragItemRenderer    key={el.id} element={el} />
        if (el.type === 'drag-target') return <DragTargetRenderer  key={el.id} element={el} />
        if (el.type === 'mc-option')   return <McOptionRenderer    key={el.id} element={el} />
        return null
      })}
    </div>
  )
}