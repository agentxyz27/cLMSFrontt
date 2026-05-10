import { useRef, useEffect } from 'react'
import { Stage, Layer, Rect, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { CanvasStageProps } from '../editorTypes'
import type { DragTargetProps } from '@/shared/types'
import {
  TextElement, ImageElement, ShapeElement,
  DragItemElement, DragTargetElement, McOptionElement,
  BackgroundImage,
} from '../elements/konva'
import { useLinkMode } from '../canvasEditor/hooks/useLinkMode'
import { useCanvasZoom } from '../canvasEditor/hooks/useCanvasZoom'
import { useCanvasPanning } from '../canvasEditor/hooks/useCanvasPanning'
import { DragLinkPopover } from '../overlays/dragLinkPopOver'
import { LinkModeBanner } from '../overlays/linkModeBanner'

export default function CanvasStage({ canvasData, selectedId, onSelect, onChange, onLinkTarget }: CanvasStageProps) {
  const { canvas, elements } = canvasData

  const wrapperRef = useRef<HTMLDivElement>(null)
  const trRef      = useRef<Konva.Transformer>(null)
  const nodeRefs   = useRef<Map<string, Konva.Node>>(new Map())

  const { zoom, stageOffset, setStageOffset } = useCanvasZoom({ wrapperRef })
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useCanvasPanning({
    stageOffset, onOffsetChange: setStageOffset,
  })

  const dragItems = elements.filter(e => e.type === 'drag-item')

  const {
    linkMode,
    popover,
    setPopover,
    enterLinkMode,
    cancelLinkMode,
    handleLinkPick,
    handleTargetContextMenu,
  } = useLinkMode({ elements, selectedId, zoom, stageOffset, onLinkTarget })

  // Transformer sync
  useEffect(() => {
    if (!trRef.current) return
    if (selectedId) {
      const node = nodeRefs.current.get(selectedId)
      trRef.current.nodes(node ? [node] : [])
    } else {
      trRef.current.nodes([])
    }
    trRef.current.getLayer()?.batchDraw()
  }, [selectedId])

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
          // Only handle left-click on the stage background
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

            {elements.map(el => {
              const cb = (node: Konva.Node | null) => {
                if (node) nodeRefs.current.set(el.id, node)
                else nodeRefs.current.delete(el.id)
              }
              const shared = {
                key: el.id, element: el,
                // No setPopover(null) here — popover closes itself on outside click
                onSelect: () => onSelect(el.id),
                onChange,
                nodeRefCallback: cb,
              }

              if (el.type === 'text')  return <TextElement  {...shared} />
              if (el.type === 'image') return <ImageElement {...shared} />
              if (el.type === 'shape') return <ShapeElement {...shared} />

              if (el.type === 'drag-item') return (
                <DragItemElement {...shared}
                  linkMode={!!linkMode}
                  onLinkPick={handleLinkPick}
                />
              )

              if (el.type === 'drag-target') return (
                <DragTargetElement {...shared}
                  linkMode={!!linkMode}
                  isLinkSource={linkMode?.targetId === el.id}
                  dragItems={dragItems}
                  onContextMenu={e => handleTargetContextMenu(e, el)}
                />
              )

              if (el.type === 'mc-option') return <McOptionElement {...shared} />
              return null
            })}
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