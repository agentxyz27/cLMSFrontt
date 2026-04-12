/**
 * teacherLessonEdit.tsx
 *
 * Edit an existing lesson — manage its blocks.
 * Teacher can add new blocks, delete existing blocks, and reorder blocks.
 *
 * Endpoints:
 *   GET    /api/lessons/:subjectId → get lessons with blocks, filter by lessonId
 *   POST   /api/blocks             → add a new block to the lesson
 *   DELETE /api/blocks/:id         → delete a block
 *   PUT    /api/blocks/reorder     → reorder all blocks after move or delete
 *   POST   /api/upload             → upload image or file to Supabase Storage
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { Lesson, LessonBlock, BlockType } from '../../types'

/**
 * Renders a single block with its actual content preview
 * plus move up, move down, and delete controls.
 *
 * Props:
 *   block      — the block to render
 *   index      — current position in the list (0-based)
 *   total      — total number of blocks (used to disable move buttons at edges)
 *   onDelete   — called with block id when delete is clicked
 *   onMoveUp   — called with index when ↑ is clicked
 *   onMoveDown — called with index when ↓ is clicked
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

  /**
   * Renders actual content based on block type.
   * Images show as thumbnails, videos as embeds, files as links.
   */
  const preview = () => {
    switch (block.type) {
      case 'text':
        // Render truncated HTML — full content visible in student view
        return (
          <div dangerouslySetInnerHTML={{
            __html: data.html.slice(0, 100) + (data.html.length > 100 ? '...' : '')
          }} />
        )

      case 'image':
        // Show actual image thumbnail
        return (
          <img
            src={data.url}
            alt={data.alt}
            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover' }}
          />
        )

      case 'video': {
        // Convert YouTube watch URL to embed URL
        // https://youtube.com/watch?v=ID → https://youtube.com/embed/ID
        const embedUrl = data.url
          .replace('watch?v=', 'embed/')
          .replace('youtu.be/', 'youtube.com/embed/')
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="200"
            allowFullScreen
            title={data.title}
          />
        )
      }

      case 'file':
        // Show clickable download link
        return (
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            📎 {data.name} ({data.fileType?.toUpperCase()})
          </a>
        )

      case 'math':
        // Plain text for now — replaced with KaTeX in UI pass
        return <code>{data.expression}</code>

      default:
        return <p>Unknown block type: {block.type}</p>
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
      {/* Block header — type label and reorder/delete controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>#{index + 1} — {block.type.toUpperCase()}</span>
        <div>
          {/* Disabled at first position */}
          <button onClick={() => onMoveUp(index)} disabled={index === 0}>↑</button>
          {/* Disabled at last position */}
          <button onClick={() => onMoveDown(index)} disabled={index === total - 1}>↓</button>
          <button onClick={() => onDelete(block.id)}>Delete</button>
        </div>
      </div>
      {/* Block content preview */}
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

  // Add block form state
  const [blockType, setBlockType] = useState<BlockType>('text')
  const [addingBlock, setAddingBlock] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Block field values — one per block type
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
        // Sort blocks by order on load
        setBlocks(found.blocks?.sort((a, b) => a.order - b.order) || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, id, lessonId])

  /**
   * Deletes a block and recalculates order for remaining blocks.
   * Order is saved to the backend immediately after deletion.
   */
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

  /**
   * Saves the current block order to the backend.
   * Called after every move or delete operation.
   * Recalculates order as 1-based index of the current array.
   */
  async function saveOrder(updated: LessonBlock[]) {
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

  /**
   * Uploads a file to Supabase Storage via the backend upload endpoint.
   * Returns { url, name, fileType } for use in block data.
   * Uses fetch directly instead of api.ts because FormData
   * requires the browser to set Content-Type with the boundary automatically.
   */
  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      // No Content-Type header — browser sets it automatically for FormData
      body: formData
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Upload failed')
    }
    return res.json()
  }

  /**
   * Builds block data payload based on type and calls POST /api/blocks.
   * For image and file types, uploads to Supabase Storage first.
   * Resets all form fields after successful block creation.
   */
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

      // Append new block to end of list
      setBlocks(prev => [...prev, res.block])

      // Reset all form fields
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

      {/* Existing blocks with reorder and delete controls */}
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

      {/* Add block form — fields change based on selected block type */}
      <h2>Add Block</h2>

      {/* Block type selector */}
      <div>
        {(['text', 'image', 'video', 'file', 'quiz'] as BlockType[]).map(type => (
          <button
            key={type}
            onClick={() => setBlockType(type)}
            disabled={blockType === type}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Block input fields — only the selected type's fields are shown */}
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
              placeholder="Alt text (description of image)"
              value={imageAlt}
              onChange={e => setImageAlt(e.target.value)}
            />
          </div>
        )}

        {blockType === 'video' && (
          <div>
            <input
              type="text"
              placeholder="YouTube URL e.g. https://youtube.com/watch?v=..."
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
            placeholder="insert quiz question here"
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