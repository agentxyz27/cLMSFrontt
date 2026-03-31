/**
 * teacherLessonEdit.tsx
 *
 * Edit an existing lesson — manage its blocks.
 * Teacher can add, delete, and reorder blocks.
 *
 * Endpoints:
 *   GET    /api/lessons/:subjectId      → get lessons with blocks, filter by lessonId
 *   POST   /api/blocks                  → add a new block
 *   PUT    /api/blocks/:id              → update a block
 *   DELETE /api/blocks/:id              → delete a block
 *   PUT    /api/blocks/reorder          → reorder all blocks
 *   POST   /api/upload                  → upload a file
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Lesson, LessonBlock, BlockType } from '../../types'

/**
 * Renders a preview of a block with delete and move controls.
 */
function BlockItem({
  block,
  index,
  total,
  onDelete,
  onMoveUp,
  onMoveDown
}: {
  block: LessonBlock
  index: number
  total: number
  onDelete: (id: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
}) {
  const data = block.data as Record<string, string>

  const preview = () => {
    switch (block.type) {
      case 'text':
        return <div dangerouslySetInnerHTML={{ __html: data.html }} />
      case 'image':
        return <img src={data.url} alt={data.alt} style={{ maxWidth: '200px' }} />
      case 'video':
        return <p>🎥 {data.title || data.url}</p>
      case 'file':
        return <p>📎 {data.name} ({data.fileType?.toUpperCase()})</p>
      case 'math':
        return <code>{data.expression}</code>
      default:
        return <p>Unknown block</p>
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>#{index + 1} — {block.type.toUpperCase()}</span>
        <div>
          <button onClick={() => onMoveUp(index)} disabled={index === 0}>↑</button>
          <button onClick={() => onMoveDown(index)} disabled={index === total - 1}>↓</button>
          <button onClick={() => onDelete(block.id)}>Delete</button>
        </div>
      </div>
      <div>{preview()}</div>
    </div>
  )
}

export default function TeacherLessonEdit() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [blocks, setBlocks] = useState<LessonBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add block state
  const [blockType, setBlockType] = useState<BlockType>('text')
  const [addingBlock, setAddingBlock] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [textHtml, setTextHtml] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [mathExpression, setMathExpression] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const lessons = await api.get<Lesson[]>(`/lessons/${id}`, token)
        const found = lessons.find(l => l.id === Number(lessonId))
        if (!found) {
          setError('Lesson not found')
          return
        }
        setLesson(found)
        setBlocks(found.blocks?.sort((a, b) => a.order - b.order) || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id, lessonId])

  async function handleDelete(blockId: number) {
    if (!confirm('Delete this block?')) return
    try {
      await api.delete(`/blocks/${blockId}`, token)
      const updated = blocks.filter(b => b.id !== blockId)
      setBlocks(updated)
      await saveOrder(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete block')
    }
  }

  async function saveOrder(updated: LessonBlock[]) {
    // Recalculate order after move or delete
    const reordered = updated.map((b, i) => ({ id: b.id, order: i + 1 }))
    await api.put('/blocks/reorder', { blocks: reordered }, token)
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return
    const updated = [...blocks]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setBlocks(updated)
    await saveOrder(updated)
  }

  async function handleMoveDown(index: number) {
    if (index === blocks.length - 1) return
    const updated = [...blocks]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setBlocks(updated)
    await saveOrder(updated)
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Upload failed')
    }
    return res.json()
  }

  async function handleAddBlock() {
    if (!lesson) return
    setAddingBlock(true)
    setError(null)

    try {
      let data: Record<string, string> = {}

      switch (blockType) {
        case 'text':
          if (!textHtml.trim()) throw new Error('Text content is required')
          data = { html: textHtml }
          break
        case 'image':
          if (!selectedFile) throw new Error('Please select an image')
          setUploading(true)
          const imgUpload = await uploadFile(selectedFile)
          data = { url: imgUpload.url, alt: imageAlt || selectedFile.name }
          setUploading(false)
          break
        case 'video':
          if (!videoUrl.trim()) throw new Error('Video URL is required')
          data = { url: videoUrl, title: videoTitle }
          break
        case 'file':
          if (!selectedFile) throw new Error('Please select a file')
          setUploading(true)
          const fileUpload = await uploadFile(selectedFile)
          data = { url: fileUpload.url, name: fileUpload.name, fileType: fileUpload.fileType }
          setUploading(false)
          break
        case 'math':
          if (!mathExpression.trim()) throw new Error('Math expression is required')
          data = { expression: mathExpression }
          break
      }

      const res = await api.post<{ block: LessonBlock }>(
        '/blocks',
        { lessonId: lesson.id, type: blockType, data },
        token
      )

      setBlocks(prev => [...prev, res.block])

      // Reset fields
      setTextHtml('')
      setImageAlt('')
      setVideoUrl('')
      setVideoTitle('')
      setMathExpression('')
      setSelectedFile(null)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add block')
      setUploading(false)
    } finally {
      setAddingBlock(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!lesson) return <div>Lesson not found</div>

  return (
    <div>
      <button onClick={() => navigate(`/teacher/subjects/${id}`)}>← Back</button>

      <h1>Edit: {lesson.title}</h1>

      {/* Existing blocks */}
      <h2>Blocks ({blocks.length})</h2>
      {blocks.length === 0 ? (
        <p>No blocks yet. Add your first block below.</p>
      ) : (
        <div>
          {blocks.map((block, index) => (
            <BlockItem
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      {/* Add block form */}
      <h2>Add Block</h2>

      <div>
        {(['text', 'image', 'video', 'file', 'math'] as BlockType[]).map(type => (
          <button
            key={type}
            onClick={() => setBlockType(type)}
            disabled={blockType === type}
          >
            {type}
          </button>
        ))}
      </div>

      <div>
        {blockType === 'text' && (
          <textarea
            placeholder="Enter text content (HTML supported)"
            value={textHtml}
            onChange={e => setTextHtml(e.target.value)}
            rows={6}
          />
        )}
        {blockType === 'image' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              placeholder="Alt text"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
            />
          </div>
        )}
        {blockType === 'video' && (
          <div>
            <input
              type="text"
              placeholder="YouTube URL"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="Video title (optional)"
              value={videoTitle}
              onChange={e => setVideoTitle(e.target.value)}
            />
          </div>
        )}
        {blockType === 'file' && (
          <input
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          />
        )}
        {blockType === 'math' && (
          <input
            type="text"
            placeholder="Math expression e.g. 2 + 3 = 5"
            value={mathExpression}
            onChange={e => setMathExpression(e.target.value)}
          />
        )}
      </div>

      <button onClick={handleAddBlock} disabled={addingBlock || uploading}>
        {uploading ? 'Uploading...' : addingBlock ? 'Adding...' : '+ Add Block'}
      </button>

      {error && <p>{error}</p>}
    </div>
  )
}