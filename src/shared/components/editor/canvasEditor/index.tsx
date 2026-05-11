import { useState } from 'react'
import { BLANK_LESSON } from './constants'
import {
  makeTextElement, makeImageElement, makeShapeElement,
  makeDragItem, makeDragTarget, makeMcOption
} from './factories'
import { useCanvasElements } from './hooks/useCanvasElements'
import { useNodeGraph } from './hooks/useNodeGraph'
import { useSave } from './hooks/useSave'
import { useContextMenu } from './hooks/useContextMenu'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import TopToolBar from './components/topToolBar'
import ToolStrip from './components/toolStrip'
import EditorTimeline from './components/editorTimeline'
import NodeSettingsPopover from './components/nodeSettingsPopover'
import FloatingElementPanel from './components/floatingElementPanel'
import DragMatchToolPanel from './components/dragMatchtoolPanel'
import { EditorStage } from '../stages'
import type { LessonGraph } from '@/shared/types'

interface CanvasEditorProps {
  lessonId: number
  initial: LessonGraph | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const [lessonContent, setLessonContent] = useState<LessonGraph>(initial ?? BLANK_LESSON)
  const [activeNodeId, setActiveNodeId]   = useState<string>((initial ?? BLANK_LESSON).nodes[0].id)
  const [selectedId, setSelectedId]       = useState<string | null>(null)

  const activeNode       = lessonContent.nodes.find(n => n.id === activeNodeId) ?? lessonContent.nodes[0]
  const activeCanvas     = activeNode.contentJson
  const selectedElement  = activeCanvas.elements.find(el => el.id === selectedId) ?? null
  const isQuizNode       = activeNode.type === 'quiz'

  // Drag-match panel — shown when node is quiz type
  const dragItems   = activeCanvas.elements.filter(el => el.type === 'drag-item')
  const dragTargets = activeCanvas.elements.filter(el => el.type === 'drag-target')
  const hasDragElements = dragItems.length > 0 || dragTargets.length > 0

  const { contextMenu, contextMenuRef, openAt: openContextMenu, close: closeContextMenu } = useContextMenu()

  const { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage } =
    useCanvasElements({ activeNodeId, setLessonContent, setSelectedId })

  const { addNode, deleteNode, changeNodeType, setNextNode, setHintNode, updateQuiz, updateNode, setQuestionId } =
    useNodeGraph({ setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu })

  const { saving, saveError, saveSuccess, save } = useSave(lessonId, token)

  useKeyboardShortcuts({
    selectedId,
    onDeleteElement: deleteElement,
    onEscape: () => {
      closeContextMenu()
      setSelectedId(null)
    },
  })

  // ── Element handlers ───────────────────────────────────────────────────
  function handleAddText()  { addElement(makeTextElement()) }
  function handleAddShape() { addElement(makeShapeElement()) }
  function handleAddImage() {
    const url = window.prompt('Enter image URL:')
    if (url?.trim()) addElement(makeImageElement(url.trim()))
  }
  function handleAddDragItem()   { addElement(makeDragItem()) }
  function handleAddDragTarget() { addElement(makeDragTarget()) }
  function handleAddMcOption() {
    const existingOptions = activeCanvas.elements.filter(el => el.type === 'mc-option')
    addElement(makeMcOption(existingOptions.length))
  }

  // Update drag-target accepts link
  function handleLinkTarget(targetId: string, acceptsItemId: string) {
    const target = activeCanvas.elements.find(el => el.id === targetId)
    if (!target) return
    updateElement({ ...target, props: { ...target.props, accepts: acceptsItemId } })
  }

  const contextNode = contextMenu
    ? lessonContent.nodes.find(n => n.id === contextMenu.nodeId) ?? null
    : null

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#0f1117]">

      {saveError && (
        <div className="shrink-0 bg-[#450a0a] px-4 py-1.5 text-xs text-[#fca5a5]">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="shrink-0 bg-[#052e16] px-4 py-1.5 text-xs text-[#86efac]">
          Saved successfully
        </div>
      )}

      <div className="shrink-0 px-4 py-2 border-b">
        <TopToolBar title="Lesson Editor" onSave={() => save(lessonContent)} />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Tool strip */}
        <div className="shrink-0">
          <ToolStrip
            background={activeCanvas.canvas.background}
            isQuizNode={isQuizNode}
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            onAddShape={handleAddShape}
            onAddDragItem={handleAddDragItem}
            onAddDragTarget={handleAddDragTarget}
            onAddMcOption={handleAddMcOption}
            onBackgroundColorChange={setBackgroundColor}
            onBackgroundImageChange={setBackgroundImage}
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={() => save(lessonContent)}
            onDone={onDone}
          />
        </div>

        {/* Canvas */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <EditorStage
            canvasData={activeCanvas}
            selectedId={selectedId}
            onLinkTarget={handleLinkTarget}
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

        {/* Drag-match config panel — right side, quiz nodes only */}
        {isQuizNode && hasDragElements && (
          <div className="shrink-0 w-56 border-l border-white/10 bg-[#11131a] overflow-y-auto">
            <DragMatchToolPanel
              dragItems={dragItems}
              dragTargets={dragTargets}
              onLinkTarget={handleLinkTarget}
              onUpdateElement={updateElement}
            />
          </div>
        )}

      </div>

      {/* Timeline */}
      <div className="shrink-0 border-t border-white/10 bg-[#11131a]">
        <EditorTimeline
          nodes={lessonContent.nodes}
          activeNodeId={activeNodeId}
          onSelectNode={(id) => {
            setActiveNodeId(id)
            setSelectedId(null)
          }}
          onNodeContextMenu={openContextMenu}
          onAddNode={addNode}
          onReorderNodes={(newNodes) => {
            setLessonContent(prev => ({
              ...prev,
              nodes: newNodes
            }))
          }}
        />
      </div>

      {/* Node settings popover */}
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
          onSetQuestionId={setQuestionId}
          lessonId={lessonId}
          token={token}
          onDelete={() => deleteNode(contextNode.id, lessonContent.nodes)}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}