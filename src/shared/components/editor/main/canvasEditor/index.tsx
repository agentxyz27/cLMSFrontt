/**
 * canvasEditor/index.tsx
 *
 * Thin orchestrator. No business logic lives here — it only:
 *   1. Holds the two pieces of top-level state (lessonContent, activeNodeId, selectedId)
 *   2. Wires hooks together
 *   3. Renders layout + composed components
 *
 * Layout:
 *   TOP    — EditorToolbar
 *   LEFT   — ToolStrip
 *   CENTER — CanvasStage  +  FloatingElementPanel (when element selected)
 *   BOTTOM — EditorTimeline  (right-click node → NodeSettingsPopover)
 */
import { useState } from 'react'
import { BLANK_LESSON } from './constants'
import { makeTextElement, makeImageElement, makeShapeElement } from './factories'
import { useCanvasElements } from './hooks/useCanvasElements'
import { useNodeGraph } from './hooks/useNodeGraph'
import { useSave } from './hooks/useSave'
import { useContextMenu } from './hooks/useContextMenu'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import ToolStrip from './components/toolStrip'
import EditorTimeline from './components/editorTimeline'
import NodeSettingsPopover from './components/nodeSettingsPopover'
import FloatingElementPanel from './components/floatingElementPanel'
import CanvasStage from '../canvasStage'
import type { LessonGraph } from '@/shared/types'

interface CanvasEditorProps {
  lessonId: number
  initial: LessonGraph | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  // ── Core state ─────────────────────────────────────────────────────────
  const [lessonContent, setLessonContent] = useState<LessonGraph>(initial ?? BLANK_LESSON)
  const [activeNodeId, setActiveNodeId] = useState<string>((initial ?? BLANK_LESSON).nodes[0].id)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────
  const activeNode = lessonContent.nodes.find(n => n.id === activeNodeId) ?? lessonContent.nodes[0]
  const activeCanvas = activeNode.contentJson
  const selectedElement = activeCanvas.elements.find(el => el.id === selectedId) ?? null

  // ── Hooks ──────────────────────────────────────────────────────────────
  const { contextMenu, contextMenuRef, openAt: openContextMenu, close: closeContextMenu } = useContextMenu()

  const { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage } =
    useCanvasElements({ activeNodeId, setLessonContent, setSelectedId })

  const { addNode, deleteNode, changeNodeType, setNextNode, setHintNode, updateQuiz } =
    useNodeGraph({ setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu })

  const { saving, saveError, saveSuccess, save } = useSave(lessonId, token)

  useKeyboardShortcuts({
    selectedId,
    onDeleteElement: deleteElement,
    onEscape: () => { closeContextMenu(); setSelectedId(null) }
  })

  // ── Add-element helpers (need window.prompt, kept here intentionally) ──
  function handleAddText() { addElement(makeTextElement()) }
  function handleAddImage() {
    const url = window.prompt('Enter image URL:')
    if (url?.trim()) addElement(makeImageElement(url.trim()))
  }
  function handleAddShape() { addElement(makeShapeElement()) }

  // ── Context menu node ──────────────────────────────────────────────────
  const contextNode = contextMenu
    ? lessonContent.nodes.find(n => n.id === contextMenu.nodeId) ?? null
    : null

    
  // ── Render ─────────────────────────────────────────────────────────────
  return (
   <div className="flex flex-col flex-1 min-h-0 bg-[#0f1117]">

      {saveError && (
        <div style={{ background: '#450a0a', color: '#fca5a5', padding: '5px 14px', fontSize: 12, flexShrink: 0 }}>
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div style={{ background: '#052e16', color: '#86efac', padding: '5px 14px', fontSize: 12, flexShrink: 0 }}>
          Saved successfully
        </div>
      )}

      {/* MIDDLE: ToolStrip + Canvas */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT */}
        <ToolStrip
          background={activeCanvas.canvas.background}
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onAddShape={handleAddShape}
          onBackgroundColorChange={setBackgroundColor}
          onBackgroundImageChange={setBackgroundImage}   // ✅ add this
          saving={saving}                                // ✅ add this
          saveError={saveError}                          // ✅ add this
          saveSuccess={saveSuccess}                      // ✅ add this
          onSave={() => save(lessonContent)}
          onDone={onDone}
          />

        {/* CENTER */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <CanvasStage
            canvasData={activeCanvas}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={updateElement}
          />

          {selectedElement && (
            <FloatingElementPanel
              element={selectedElement}
              onChange={updateElement}
              onDelete={deleteElement}
              onClose={() => setSelectedId(null)}
            />
          )}
        </div>
      </div>

      {/* BOTTOM */}
      <div className="h-28 shrink-0 border-t bg-[#11131a]">
        <EditorTimeline
          nodes={lessonContent.nodes}
          activeNodeId={activeNodeId}
          onSelectNode={(id) => { setActiveNodeId(id); setSelectedId(null) }}
          onNodeContextMenu={openContextMenu}
          onAddNode={() => addNode()}
        />
      </div>


      {/* Right-click popover */}
      {contextMenu && contextNode && (
        <NodeSettingsPopover
          ref={contextMenuRef}
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextNode}
          allNodes={lessonContent.nodes}
          canDelete={lessonContent.nodes.length > 1}
          onChangeType={type => changeNodeType(contextNode.id, type)}
          onChangeNextNode={id => setNextNode(contextNode.id, id)}
          onChangeHintNode={id => setHintNode(contextNode.id, id)}
          onUpdateQuiz={quiz => updateQuiz(contextNode.id, quiz)}
          onDelete={() => deleteNode(contextNode.id, lessonContent.nodes)}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}