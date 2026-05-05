import { useState } from 'react'
import { BLANK_LESSON } from './constants'
import { makeTextElement, makeImageElement, makeShapeElement } from './factories'
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
import CanvasStage from '../canvasStage'
import type { LessonGraph } from '@/shared/types'

interface CanvasEditorProps {
  lessonId: number
  initial: LessonGraph | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const [lessonContent, setLessonContent] = useState<LessonGraph>(initial ?? BLANK_LESSON)
  const [activeNodeId, setActiveNodeId] = useState<string>((initial ?? BLANK_LESSON).nodes[0].id)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeNode = lessonContent.nodes.find(n => n.id === activeNodeId) ?? lessonContent.nodes[0]
  const activeCanvas = activeNode.contentJson
  const selectedElement = activeCanvas.elements.find(el => el.id === selectedId) ?? null

  const { contextMenu, contextMenuRef, openAt: openContextMenu, close: closeContextMenu } = useContextMenu()

  const { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage } =
    useCanvasElements({ activeNodeId, setLessonContent, setSelectedId })

  const { addNode, deleteNode, changeNodeType, setNextNode, setHintNode, updateQuiz } =
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

  function handleAddText() {
    addElement(makeTextElement())
  }

  function handleAddImage() {
    const url = window.prompt('Enter image URL:')
    if (url?.trim()) addElement(makeImageElement(url.trim()))
  }

  function handleAddShape() {
    addElement(makeShapeElement())
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
          <TopToolBar
            title="Lesson Editor"
            onSave={() => save(lessonContent)}
          />
        </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">

        <div className="shrink-0">
          <ToolStrip
            background={activeCanvas.canvas.background}
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            onAddShape={handleAddShape}
            onBackgroundColorChange={setBackgroundColor}
            onBackgroundImageChange={setBackgroundImage}
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={() => save(lessonContent)}
            onDone={onDone}
          />
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
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

      <div className="shrink-0 border-t border-white/10 bg-[#11131a]">
        <EditorTimeline
          nodes={lessonContent.nodes}
          activeNodeId={activeNodeId}
          onSelectNode={(id) => {
            setActiveNodeId(id)
            setSelectedId(null)
          }}
          onNodeContextMenu={openContextMenu}
          onAddNode={() => addNode()}
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