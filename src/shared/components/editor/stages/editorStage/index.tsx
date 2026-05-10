// shared/components/editor/stages/editorStage.tsx
import { useRef } from 'react'
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { CanvasStageProps } from '@/shared/components/editor/editorTypes'
import type { DragTargetProps } from '@/shared/types'
import { BackgroundImage } from '@/shared/components/editor/elements/konva'
import { useLinkMode } from '@/shared/components/editor/canvasEditor/hooks/useLinkMode'
import { useCanvasZoom } from '@/shared/components/editor/canvasEditor/hooks/useCanvasZoom'
import { useCanvasPanning } from '@/shared/components/editor/canvasEditor/hooks/useCanvasPanning'
import { useTransformer } from '@/shared/components/editor/hooks/useTransformer'
import { EditorElementDispatcher } from './editorElementDispatcher'
import { DragLinkPopover } from '@/shared/components/editor/overlays/dragLinkPopOver'
import { LinkModeBanner } from '@/shared/components/editor/overlays/linkModeBanner'

export function EditorStage({ canvasData, selectedId, onSelect, onChange, onLinkTarget }: CanvasStageProps) {
  const { canvas, elements } = canvasData
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { trRef, nodeRefCallback } = useTransformer({ selectedId })
  const { zoom, stageOffset, setStageOffset } = useCanvasZoom({ wrapperRef })
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useCanvasPanning({
    stageOffset, onOffsetChange: setStageOffset,
  })

  const dragItems = elements.filter(e => e.type === 'drag-item')

  const {
    linkMode, popover, setPopover,
    enterLinkMode, cancelLinkMode,
    handleLinkPick, handleTargetContextMenu,
  } = useLinkMode({ elements, selectedId, zoom, stageOffset, onLinkTarget })

  return (
    <div
      ref={wrapperRef}
      style={{
        overflow: 'hidden', background: '#e5e5e5',
        flex: 1, width: '100%', height: '100%',
        userSelect: 'none', position: 'relative',
        cursor: linkMode ? 'crosshair' : 'default',
      }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseLeave}
    >
      <Stage
        width={wrapperRef.current?.clientWidth ?? canvas.width}
        height={wrapperRef.current?.clientHeight ?? canvas.height}
        scaleX={zoom} scaleY={zoom}
        x={stageOffset.x} y={stageOffset.y}
        onMouseDown={e => {
          if (e.evt.button !== 0) return
          if (e.target === e.target.getStage()) {
            onSelect(null)
            setPopover(null)
            if (linkMode) cancelLinkMode()
          }
        }}
      >
        <Layer>
          <Group clipX={0} clipY={0} clipWidth={canvas.width} clipHeight={canvas.height}>
            <Rect x={0} y={0} width={canvas.width} height={canvas.height}
              fill={canvas.background} listening={false} />

            {canvas.backgroundImage && (
              <BackgroundImage url={canvas.backgroundImage} width={canvas.width} height={canvas.height} />
            )}

            {elements.map(el => (
              <EditorElementDispatcher
                key={el.id}
                element={el}
                onSelect={() => onSelect(el.id)}
                onChange={onChange}
                nodeRefCallback={nodeRefCallback(el.id)}
                linkMode={!!linkMode}
                isLinkSource={linkMode?.targetId === el.id}
                dragItems={dragItems}
                onLinkPick={handleLinkPick}
                onContextMenu={e => handleTargetContextMenu(e, el)}
              />
            ))}
          </Group>
        </Layer>

        <Layer>
          <Transformer ref={trRef} />
        </Layer>
      </Stage>

      {linkMode && (() => {
        const targetEl = elements.find(e => e.id === linkMode.targetId)
        const label = targetEl ? (targetEl.props as DragTargetProps).label : ''
        return <LinkModeBanner targetLabel={label} onCancel={cancelLinkMode} />
      })()}

      {popover && (
        <DragLinkPopover
          popover={popover}
          dragItems={dragItems}
          onLink={(targetId, itemId) => onLinkTarget(targetId, itemId)}
          onClose={() => setPopover(null)}
          onEnterLinkMode={enterLinkMode}
        />
      )}
    </div>
  )
}