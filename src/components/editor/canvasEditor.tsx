/**
 * CanvasEditor.tsx
 *
 * Main canvas editor component — now supports lesson node graph editing.
 *
 * Layout:
 *   Left   — Node panel (list of nodes, add/delete, mini thumbnails)
 *   Center — Canvas stage (active node's canvas)
 *   Right  — Properties panel (element props or quiz/node settings)
 *
 * State:
 *   lessonContent  — full node graph + lesson settings
 *   activeNodeId   — which node is currently being edited
 *   selectedId     — which canvas element is selected on active node
 *
 * Save sends the full LessonContent to the backend.
 * CanvasStage and PropertiesPanel are unchanged — they still work on CanvasData.
 */
import { useState, useCallback, useEffect } from 'react'
import { api } from '../../api/api'
import EditorToolbar from './editorToolbar'
import CanvasStage from './canvasStage'
import PropertiesPanel from './propertiesPanel'
import CanvasPreview from './canvasPreview'
import type {
  CanvasData,
  CanvasElement,
  LessonContent,
  LessonNode,
  LessonNodeType,
  QuizData
} from '../../types'

// ── Defaults ───────────────────────────────────────────────────────────────

const BLANK_CANVAS: CanvasData = {
  canvas: { width: 1280, height: 720, background: '#ffffff' },
  elements: []
}

const BLANK_LESSON: LessonContent = {
  nodes: [
    {
      id: 'node_1',
      type: 'explanation',
      contentJson: { ...BLANK_CANVAS },
      nextNodeId: null,
      hintNodeId: null
    }
  ],
  settings: {
    passingScore: 70,
    retryLimit: null,
    badgeId: null
  }
}

// ── ID generators ──────────────────────────────────────────────────────────

let _elCounter = 0
function generateElementId(): string {
  _elCounter += 1
  return `el_${Date.now()}_${_elCounter}`
}

let _nodeCounter = 0
function generateNodeId(): string {
  _nodeCounter += 1
  return `node_${Date.now()}_${_nodeCounter}`
}

// ── Element factories ──────────────────────────────────────────────────────

function makeTextElement(): CanvasElement {
  return {
    id: generateElementId(), type: 'text', x: 100, y: 100, width: 300, height: 60,
    props: { text: 'Text here', fontSize: 24, color: '#111111', fontStyle: 'normal', align: 'left' }
  }
}

function makeImageElement(url: string): CanvasElement {
  return {
    id: generateElementId(), type: 'image', x: 100, y: 100, width: 300, height: 200,
    props: { url, alt: 'Image' }
  }
}

function makeShapeElement(): CanvasElement {
  return {
    id: generateElementId(), type: 'shape', x: 100, y: 100, width: 200, height: 120,
    props: { fill: '#4A90D9', stroke: '#2c5f8a', strokeWidth: 2, shape: 'rect' }
  }
}

// ── Node type colors ───────────────────────────────────────────────────────

const NODE_TYPE_COLOR: Record<LessonNodeType, string> = {
  explanation: '#3b82f6',
  example: '#8b5cf6',
  quiz: '#f59e0b',
  hint: '#10b981',
  result: '#ef4444'
}

const NODE_TYPE_LABEL: Record<LessonNodeType, string> = {
  explanation: 'Explanation',
  example: 'Example',
  quiz: 'Quiz',
  hint: 'Hint',
  result: 'Result'
}

// ── Props ──────────────────────────────────────────────────────────────────

interface CanvasEditorProps {
  lessonId: number
  initial: LessonContent | null
  token: string | null
  onDone: () => void
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CanvasEditor({ lessonId, initial, token, onDone }: CanvasEditorProps) {
  const [lessonContent, setLessonContent] = useState<LessonContent>(initial ?? BLANK_LESSON)
  const [activeNodeId, setActiveNodeId] = useState<string>(
    (initial ?? BLANK_LESSON).nodes[0].id
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ── Derived ────────────────────────────────────────────────────────────
  const activeNode = lessonContent.nodes.find(n => n.id === activeNodeId)
    ?? lessonContent.nodes[0]
  const activeCanvas = activeNode.contentJson
  const selectedElement = activeCanvas.elements.find(el => el.id === selectedId) ?? null

  // ── Update helpers ─────────────────────────────────────────────────────

  const updateActiveCanvas = useCallback((updater: (prev: CanvasData) => CanvasData) => {
    setLessonContent(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === activeNodeId
          ? { ...n, contentJson: updater(n.contentJson) }
          : n
      )
    }))
  }, [activeNodeId])

  const updateNode = useCallback((nodeId: string, updater: (prev: LessonNode) => LessonNode) => {
    setLessonContent(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? updater(n) : n)
    }))
  }, [])

  // ── Element handlers ───────────────────────────────────────────────────

  const addElement = useCallback((element: CanvasElement) => {
    updateActiveCanvas(prev => ({ ...prev, elements: [...prev.elements, element] }))
    setSelectedId(element.id)
  }, [updateActiveCanvas])

  const updateElement = useCallback((updated: CanvasElement) => {
    updateActiveCanvas(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === updated.id ? updated : el)
    }))
  }, [updateActiveCanvas])

  const deleteElement = useCallback((id: string) => {
    updateActiveCanvas(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }))
    setSelectedId(null)
  }, [updateActiveCanvas])

  // ── Keyboard delete ────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteElement(selectedId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, deleteElement])

  // ── Background handlers ────────────────────────────────────────────────

  const handleBackgroundColorChange = useCallback((color: string) => {
    updateActiveCanvas(prev => ({ ...prev, canvas: { ...prev.canvas, background: color } }))
  }, [updateActiveCanvas])

  const handleBackgroundImageChange = useCallback((url: string) => {
    updateActiveCanvas(prev => ({ ...prev, canvas: { ...prev.canvas, backgroundImage: url } }))
  }, [updateActiveCanvas])

  // ── Add element handlers ───────────────────────────────────────────────

  function handleAddText() { addElement(makeTextElement()) }
  function handleAddImage() {
    const url = window.prompt('Enter image URL:')
    if (!url?.trim()) return
    addElement(makeImageElement(url.trim()))
  }
  function handleAddShape() { addElement(makeShapeElement()) }

  // ── Node handlers ──────────────────────────────────────────────────────

  function handleAddNode() {
    const newNode: LessonNode = {
      id: generateNodeId(),
      type: 'explanation',
      contentJson: { ...BLANK_CANVAS, canvas: { ...BLANK_CANVAS.canvas } },
      nextNodeId: null,
      hintNodeId: null
    }
    setLessonContent(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
    setActiveNodeId(newNode.id)
    setSelectedId(null)
  }

  function handleDeleteNode(nodeId: string) {
    if (lessonContent.nodes.length === 1) return // always keep at least one node
    const remaining = lessonContent.nodes.filter(n => n.id !== nodeId)
    setLessonContent(prev => ({ ...prev, nodes: remaining }))
    // Switch to adjacent node
    const deletedIndex = lessonContent.nodes.findIndex(n => n.id === nodeId)
    const nextActive = remaining[Math.max(0, deletedIndex - 1)]
    setActiveNodeId(nextActive.id)
    setSelectedId(null)
  }

  function handleChangeNodeType(nodeId: string, type: LessonNodeType) {
    updateNode(nodeId, prev => ({
      ...prev,
      type,
      quiz: type === 'quiz'
        ? (prev.quiz ?? { question: '', choices: ['', '', '', ''], correctIndex: 0 })
        : undefined
    }))
  }

  function handleChangeNextNode(nodeId: string, nextNodeId: string | null) {
    updateNode(nodeId, prev => ({ ...prev, nextNodeId }))
  }

  function handleChangeHintNode(nodeId: string, hintNodeId: string | null) {
    updateNode(nodeId, prev => ({ ...prev, hintNodeId }))
  }

  function handleUpdateQuiz(nodeId: string, quiz: QuizData) {
    updateNode(nodeId, prev => ({ ...prev, quiz }))
  }

  // ── Save ───────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      await api.put(`/lessons/${lessonId}`, { contentJson: lessonContent }, token)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Toolbar */}
      <EditorToolbar
        saving={saving}
        background={activeCanvas.canvas.background}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onAddShape={handleAddShape}
        onBackgroundColorChange={handleBackgroundColorChange}
        onBackgroundImageChange={handleBackgroundImageChange}
        onSave={handleSave}
        onDone={onDone}
      />

      {saveError && (
        <div style={{ background: '#fee', color: '#c00', padding: '6px 12px', fontSize: 13 }}>
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div style={{ background: '#efe', color: '#060', padding: '6px 12px', fontSize: 13 }}>
          Saved successfully
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left — Node Panel ── */}
        <div style={{
          width: 180,
          borderRight: '1px solid #ddd',
          background: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #ddd', fontSize: 12, fontWeight: 'bold', color: '#555' }}>
            NODES
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lessonContent.nodes.map((node, index) => (
              <div
                key={node.id}
                onClick={() => { setActiveNodeId(node.id); setSelectedId(null) }}
                style={{
                  border: node.id === activeNodeId ? '2px solid #3b82f6' : '1px solid #ddd',
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#fff',
                  boxShadow: node.id === activeNodeId ? '0 0 0 2px #bfdbfe' : 'none'
                }}
              >
                {/* Mini thumbnail */}
                <div style={{ pointerEvents: 'none' }}>
                  <CanvasPreview contentJson={node.contentJson} previewWidth={156} />
                </div>

                {/* Node label */}
                <div style={{ padding: '4px 6px', borderTop: '1px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: NODE_TYPE_COLOR[node.type],
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>
                      {index + 1}. {NODE_TYPE_LABEL[node.type]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add node button */}
          <div style={{ padding: 8, borderTop: '1px solid #ddd' }}>
            <button
              onClick={handleAddNode}
              style={{ width: '100%', padding: '6px 0', fontSize: 12, cursor: 'pointer' }}
            >
              + Add Node
            </button>
          </div>
        </div>

        {/* ── Center — Canvas Stage ── */}
        <CanvasStage
          canvasData={activeCanvas}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={updateElement}
        />

        {/* ── Right — Properties / Node Settings ── */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 260, borderLeft: '1px solid #ddd', overflow: 'hidden' }}>

          {/* Node settings */}
          <div style={{ padding: 12, borderBottom: '1px solid #ddd', background: '#fafafa' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 8 }}>
              NODE SETTINGS
            </div>

            {/* Node type */}
            <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              Type
              <select
                value={activeNode.type}
                onChange={e => handleChangeNodeType(activeNode.id, e.target.value as LessonNodeType)}
                style={{ width: '100%', marginTop: 2, fontSize: 12 }}
              >
                <option value="explanation">Explanation</option>
                <option value="example">Example</option>
                <option value="quiz">Quiz</option>
                <option value="hint">Hint</option>
                <option value="result">Result</option>
              </select>
            </label>

            {/* Next node */}
            <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              Next node
              <select
                value={activeNode.nextNodeId ?? ''}
                onChange={e => handleChangeNextNode(activeNode.id, e.target.value || null)}
                style={{ width: '100%', marginTop: 2, fontSize: 12 }}
              >
                <option value=''>— End of lesson —</option>
                {lessonContent.nodes
                  .filter(n => n.id !== activeNode.id)
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {lessonContent.nodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                    </option>
                  ))}
              </select>
            </label>

            {/* Hint node — only for quiz nodes */}
            {activeNode.type === 'quiz' && (
              <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                On wrong answer
                <select
                  value={activeNode.hintNodeId ?? ''}
                  onChange={e => handleChangeHintNode(activeNode.id, e.target.value || null)}
                  style={{ width: '100%', marginTop: 2, fontSize: 12 }}
                >
                  <option value=''>— Stay on quiz —</option>
                  {lessonContent.nodes
                    .filter(n => n.id !== activeNode.id)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {lessonContent.nodes.indexOf(n) + 1}. {NODE_TYPE_LABEL[n.type]}
                      </option>
                    ))}
                </select>
              </label>
            )}

            {/* Quiz data editor */}
            {activeNode.type === 'quiz' && (
              <div style={{ marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#555', marginBottom: 6 }}>
                  QUIZ
                </div>

                <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  Question
                  <textarea
                    value={activeNode.quiz?.question ?? ''}
                    onChange={e => handleUpdateQuiz(activeNode.id, {
                      ...activeNode.quiz!,
                      question: e.target.value
                    })}
                    rows={3}
                    style={{ width: '100%', marginTop: 2, fontSize: 12, resize: 'vertical' }}
                  />
                </label>

                {(activeNode.quiz?.choices ?? ['', '', '', '']).map((choice, i) => (
                  <label key={i} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="radio"
                        name={`correct_${activeNode.id}`}
                        checked={activeNode.quiz?.correctIndex === i}
                        onChange={() => handleUpdateQuiz(activeNode.id, {
                          ...activeNode.quiz!,
                          correctIndex: i
                        })}
                      />
                      <span>Choice {i + 1} {activeNode.quiz?.correctIndex === i ? '✓' : ''}</span>
                    </div>
                    <input
                      type="text"
                      value={choice}
                      onChange={e => {
                        const choices = [...(activeNode.quiz?.choices ?? ['', '', '', ''])]
                        choices[i] = e.target.value
                        handleUpdateQuiz(activeNode.id, { ...activeNode.quiz!, choices })
                      }}
                      style={{ width: '100%', marginTop: 2, fontSize: 12 }}
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Delete node button */}
            <button
              onClick={() => handleDeleteNode(activeNode.id)}
              disabled={lessonContent.nodes.length === 1}
              style={{
                width: '100%', marginTop: 8, padding: '4px 0',
                fontSize: 12, color: 'red', background: 'none',
                border: '1px solid red', borderRadius: 4, cursor: 'pointer'
              }}
            >
              Delete node
            </button>
          </div>

          {/* Element properties */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <PropertiesPanel
              element={selectedElement}
              onChange={updateElement}
              onDelete={deleteElement}
            />
          </div>
        </div>

      </div>
    </div>
  )
}