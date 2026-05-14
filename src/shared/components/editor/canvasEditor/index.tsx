import { useState, useCallback } from 'react'
import { BLANK_CANVAS, BLANK_LESSON } from './constants'
import { makeDragItem, makeDragTarget, makeMcOption } from './factories'
import { useCanvasElements } from './hooks/useCanvasElements'
import { useNodeGraph } from './hooks/useNodeGraph'
import { useSave } from './hooks/useSave'
import { useContextMenu } from './hooks/useContextMenu'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useUndoHistory } from './hooks/useUndoHistory'
import TopToolBar from './components/topToolBar'
import ToolStrip from './components/toolStrip'
import EditorTimeline from './components/editorTimeline'
import NodeSettingsPopover from './components/nodeSettingsPopover'
import FloatingElementPanel from './components/floatingElementPanel'
import { EditorStage } from '../stages'
import { questionApi } from '@/shared/api/questionApi'
import type { LessonGraph, CanvasData, CanvasElement } from '@/shared/types'
import { normalizeLessonGraph } from '@/shared/utils/normalizeLessonGraph'

interface CanvasEditorProps {
  lessonId: number
  initial: LessonGraph | null
  token: string | null
  onDone: () => void
}

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const normalized = normalizeLessonGraph(initial ?? BLANK_LESSON)

  const [lessonContent, setLessonContent] = useState<LessonGraph>(normalized)
  const [activeNodeId, setActiveNodeId]   = useState<string>(normalized.nodes[0].id)
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null)
  const [questionCanvases, setQuestionCanvases] = useState<Record<number, CanvasData>>({})
  const [selectedId, setSelectedId]       = useState<string | null>(null)

  // ── Active node ──────────────────────────────────────────────────────────

  const activeNode = lessonContent.nodes.find(n => n.id === activeNodeId) ?? lessonContent.nodes[0]
  const needsQuestion = activeNode.type === 'practice' || activeNode.type === 'mastery'
  const nodeQuestionIds = activeNode.questionIds ?? []

  // ── Active canvas resolution ─────────────────────────────────────────────

  const EMPTY_QUESTION_CANVAS: CanvasData = {
    canvas: { width: 1280, height: 720, background: '#0f1117' },
    elements: []
  }

  const activeCanvas: CanvasData = activeQuestionId !== null
    ? (questionCanvases[activeQuestionId] ?? EMPTY_QUESTION_CANVAS)
    : activeNode.content

  const selectedElement = (activeCanvas.elements ?? []).find(el => el.id === selectedId) ?? null
  const activeQuestionIndex = activeQuestionId !== null ? nodeQuestionIds.indexOf(activeQuestionId) : -1

  // ── Hooks ────────────────────────────────────────────────────────────────

  const { contextMenu, contextMenuRef, modalRef, openAt: openContextMenu, close: closeContextMenu } = useContextMenu()

  const { addElement, updateElement, deleteElement, setBackgroundColor, setBackgroundImage, sendBackward, bringForward } =
    useCanvasElements({ activeNodeId, setLessonContent, setSelectedId })

  const { addNode, deleteNode, changeNodeType, setTransition, addQuestionId, removeQuestionId } =
    useNodeGraph({ setLessonContent, setActiveNodeId, setSelectedId, closeContextMenu })

  const { saving, saveError, saveSuccess, save } = useSave(lessonId, token)
  const { push: pushUndo, undo, redo } = useUndoHistory(setLessonContent)

  // ── Element ops — route to question canvas or node canvas ────────────────

  function handleChange(updated: CanvasElement) {
    if (activeQuestionId !== null) {
      setQuestionCanvases(prev => {
        const current = prev[activeQuestionId] ?? { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } }
        return { ...prev, [activeQuestionId]: { ...current, elements: current.elements.map(el => el.id === updated.id ? updated : el) } }
      })
      return
    }
    pushUndo(lessonContent)
    updateElement(updated)
  }

  function handleAdd(el: CanvasElement) {
    if (activeQuestionId !== null) {
      setQuestionCanvases(prev => {
        const current = prev[activeQuestionId] ?? { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } }
        return { ...prev, [activeQuestionId]: { ...current, elements: [...current.elements, el] } }
      })
      return
    }
    pushUndo(lessonContent)
    addElement(el)
  }

  function handleDelete(id: string) {
    if (activeQuestionId !== null) {
      setQuestionCanvases(prev => {
        const current = prev[activeQuestionId] ?? { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } }
        return { ...prev, [activeQuestionId]: { ...current, elements: current.elements.filter(el => el.id !== id) } }
      })
      return
    }
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
    handleChange({ ...target, props: { ...target.props, accepts: acceptsItemId } })
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  const saveQuestionCanvas = useCallback(async (questionId: number) => {
    if (!token) return
    const canvas = questionCanvases[questionId]
    if (!canvas) return
    try {
      const question = await questionApi.getById(questionId, token)
      await questionApi.update(questionId, {
        contentJson: { ...question.contentJson, canvas }
      }, token)
    } catch (err) {
      console.error('Failed to save question canvas', err)
    }
  }, [token, questionCanvases])

  async function handleSave() {
    save(lessonContent)
    for (const qid of Object.keys(questionCanvases)) {
      await saveQuestionCanvas(Number(qid))
    }
  }

  // ── Select question canvas ───────────────────────────────────────────────

  const handleSelectQuestion = useCallback(async (questionId: number) => {
    setActiveQuestionId(questionId)
    setSelectedId(null)
    if (questionCanvases[questionId]) return
    if (!token) return
    try {
      const question = await questionApi.getById(questionId, token)
      // canvas is already CanvasData — no double nesting
      const canvas = question.contentJson.canvas
      setQuestionCanvases(prev => ({
        ...prev,
        [questionId]: canvas ?? { canvas: { width: 1280, height: 720, background: '#0f1117' }, elements: [] }
      }))
    } catch (err) {
      console.error('Failed to load question canvas', err)
    }
  }, [token, questionCanvases])

  const contextNode = contextMenu
    ? lessonContent.nodes.find(n => n.id === contextMenu.nodeId) ?? null
    : null

  // ── Background color/image — route to question or node canvas ────────────

  function handleBackgroundColor(color: string) {
    if (activeQuestionId !== null) {
      setQuestionCanvases(prev => {
        const current = prev[activeQuestionId] ?? { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } }
        return { ...prev, [activeQuestionId]: { ...current, canvas: { ...current.canvas, background: color } } }
      })
      return
    }
    setBackgroundColor(color)
  }

  function handleBackgroundImage(url: string) {
    if (activeQuestionId !== null) {
      setQuestionCanvases(prev => {
        const current = prev[activeQuestionId] ?? { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } }
        return { ...prev, [activeQuestionId]: { ...current, canvas: { ...current.canvas, backgroundImage: url } } }
      })
      return
    }
    setBackgroundImage(url)
  }

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

      <div className="shrink-0 px-4 py-2 border-b border-white/10">
        <TopToolBar title="Lesson Editor" onSave={handleSave} />
      </div>

      {/* ── Question mode banner ── */}
      {activeQuestionId !== null && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-1.5 bg-[#1a1f2e] border-b border-white/10 text-xs">
          <button
            onClick={() => { setActiveQuestionId(null); setSelectedId(null) }}
            className="text-[#60a5fa] hover:text-white transition-colors cursor-pointer bg-none border-none"
            style={{ background: 'none', border: 'none' }}
          >
            ← Node canvas
          </button>
          <span className="text-[#6b7280]">
            Editing Question #{activeQuestionId}
            {activeQuestionIndex >= 0 && ` · ${activeQuestionIndex + 1} of ${nodeQuestionIds.length}`}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => { const prev = nodeQuestionIds[activeQuestionIndex - 1]; if (prev) handleSelectQuestion(prev) }}
              disabled={activeQuestionIndex <= 0}
              style={{ background: 'none', border: 'none', color: activeQuestionIndex <= 0 ? '#374151' : '#9ca3af', cursor: activeQuestionIndex <= 0 ? 'not-allowed' : 'pointer', fontSize: 16, padding: '0 4px' }}
            >‹</button>
            {nodeQuestionIds.map((qid, i) => (
              <button
                key={qid}
                onClick={() => handleSelectQuestion(qid)}
                style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 11, border: 'none', cursor: 'pointer',
                  background: qid === activeQuestionId ? '#3b82f6' : 'transparent',
                  color: qid === activeQuestionId ? '#fff' : '#6b7280',
                  transition: 'all 0.12s',
                }}
              >
                Q{i + 1}
              </button>
            ))}
            <button
              onClick={() => { const next = nodeQuestionIds[activeQuestionIndex + 1]; if (next) handleSelectQuestion(next) }}
              disabled={activeQuestionIndex >= nodeQuestionIds.length - 1}
              style={{ background: 'none', border: 'none', color: activeQuestionIndex >= nodeQuestionIds.length - 1 ? '#374151' : '#9ca3af', cursor: activeQuestionIndex >= nodeQuestionIds.length - 1 ? 'not-allowed' : 'pointer', fontSize: 16, padding: '0 4px' }}
            >›</button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">

        <div className="shrink-0">
          <ToolStrip
            background={activeCanvas.canvas.background}
            token={token}
            needsQuestion={needsQuestion && activeQuestionId === null}
            onAddElement={handleAdd}
            onAddDragItem={handleAddDragItem}
            onAddDragTarget={handleAddDragTarget}
            onAddMcOption={handleAddMcOption}
            onBackgroundColorChange={handleBackgroundColor}
            onBackgroundImageChange={handleBackgroundImage}
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onSave={handleSave}
            onDone={onDone}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="relative min-w-0 flex-1 overflow-hidden">
              <EditorStage
                canvasData={activeCanvas}
                selectedId={selectedId}
                onLinkTarget={handleLinkTarget}
                onSelect={setSelectedId}
                onChange={handleChange}
              />
              {selectedElement && (
                <FloatingElementPanel
                  element={selectedElement}
                  onChange={handleChange}
                  onDelete={handleDelete}
                  onBringForward={() => bringForward(selectedElement.id)}
                  onSendBackward={() => sendBackward(selectedElement.id)}
                  onClose={() => setSelectedId(null)}
                />
              )}
            </div>
          </div>

          {/* Node timeline — hidden in question mode */}
          {activeQuestionId === null && (
            <div className="shrink-0 border-t border-white/10 bg-[#11131a]">
              <EditorTimeline
                nodes={lessonContent.nodes}
                activeNodeId={activeNodeId}
                onSelectNode={(id) => {
                  setActiveNodeId(id)
                  setActiveQuestionId(null)
                  setSelectedId(null)
                }}
                onNodeContextMenu={openContextMenu}
                onAddNode={addNode}
                onReorderNodes={(newNodes) => {
                  setLessonContent(prev => ({ ...prev, nodes: newNodes }))
                }}
              />
            </div>
          )}

          {contextMenu && contextNode && (
            <NodeSettingsPopover
              ref={contextMenuRef}
              modalRef={modalRef}
              x={contextMenu.x}
              y={contextMenu.y}
              node={contextNode}
              allNodes={lessonContent.nodes}
              canDelete={lessonContent.nodes.length > 1}
              onChangeType={type => changeNodeType(contextNode.id, type)}
              onSetTransition={(condition, targetNodeId) => setTransition(contextNode.id, condition, targetNodeId)}
              onAddQuestionId={addQuestionId}
              onRemoveQuestionId={removeQuestionId}
              onSelectQuestion={handleSelectQuestion}
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