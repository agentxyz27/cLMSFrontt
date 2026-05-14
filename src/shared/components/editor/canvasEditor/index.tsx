import { useState } from 'react'
import { BLANK_LESSON } from './constants'
import { makeDragItem, makeDragTarget, makeMcOption } from './factories'
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
import { useUndoHistory } from './hooks/useUndoHistory'
import { EditorStage } from '../stages'
import type { LessonGraph, CanvasElement } from '@/shared/types'
import { normalizeLessonGraph } from '@/shared/utils/normalizeLessonGraph'

interface CanvasEditorProps {
  lessonId: number
  initial: LessonGraph | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const [lessonContent, setLessonContent] = useState<LessonGraph>(normalizeLessonGraph(initial ?? BLANK_LESSON))
  const [activeNodeId, setActiveNodeId] = useState<string>(normalizeLessonGraph(initial ?? BLANK_LESSON).nodes[0].id)
  const [selectedId, setSelectedId]       = useState<string | null>(null)

  const activeNode      = lessonContent.nodes.find(n => n.id === activeNodeId) ?? lessonContent.nodes[0]
  const activeCanvas = activeNode.content ?? (activeNode as any).contentJson                                          // ← was contentJson
  const selectedElement = activeCanvas.elements.find(el => el.id === selectedId) ?? null
  const needsQuestion   = activeNode.type === 'practice' || activeNode.type === 'mastery'  // ← was isQuizNode

  const { contextMenu, contextMenuRef, openAt: openContextMenu, close: closeContextMenu } = useContextMenu()

  const { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage, sendBackward, bringForward } =
    useCanvasElements({ activeNodeId, setLessonContent, setSelectedId })

  const { addNode, deleteNode, changeNodeType, setTransition, addQuestionId, removeQuestionId } =  // ← removed setNextNode, setHintNode, updateQuiz
    useNodeGraph({ setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu })

  const { saving, saveError, saveSuccess, save } = useSave(lessonId, token)

  const { push: pushUndo, undo, redo } = useUndoHistory(setLessonContent)

  function handleChange(updated: CanvasElement) {
    pushUndo(lessonContent)
    updateElement(updated)
  }
  function handleAdd(el: CanvasElement) {
    pushUndo(lessonContent)
    addElement(el)
  }
  function handleDelete(id: string) {
    pushUndo(lessonContent)
    deleteElement(id)
  }

  useKeyboardShortcuts({
    selectedId,
    onDeleteElement: handleDelete,
    onUndo: undo,
    onRedo: redo,
    onEscape: () => { closeContextMenu(); setSelectedId(null) },
  })

  function handleAddDragItem()   { handleAdd(makeDragItem()) }
  function handleAddDragTarget() { handleAdd(makeDragTarget()) }
  function handleAddMcOption() {
    const existingOptions = activeCanvas.elements.filter(el => el.type === 'mc-option')
    handleAdd(makeMcOption(existingOptions.length))
  }

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

        <div className="shrink-0">
          <ToolStrip
            background={activeCanvas.canvas.background}
            token={token}
            needsQuestion={needsQuestion}        // ← was isQuizNode
            onAddElement={addElement}
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

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 overflow-hidden">

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
                  onBringForward={() => { bringForward(selectedElement.id) }}
                  onSendBackward={() => { sendBackward(selectedElement.id) }}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </div>

          </div>

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
                setLessonContent(prev => ({ ...prev, nodes: newNodes }))
              }}
            />
          </div>

          {contextMenu && contextNode && (
            <NodeSettingsPopover
              ref={contextMenuRef}
              x={contextMenu.x}
              y={contextMenu.y}
              node={contextNode}
              allNodes={lessonContent.nodes}
              canDelete={lessonContent.nodes.length > 1}
              onChangeType={type => changeNodeType(contextNode.id, type)}
              onSetTransition={(condition, targetNodeId) => setTransition(contextNode.id, condition, targetNodeId)}  // ← replaced 3 dead props
              onAddQuestionId={addQuestionId}
              onRemoveQuestionId={removeQuestionId}
              lessonId={lessonId}
              token={token}
              onDelete={() => deleteNode(contextNode.id, lessonContent.nodes)}
              onClose={closeContextMenu}
            />
          )}
        </div>
      </div>
    </div>
  )
}