import { useState } from 'react'
import { templateApi } from '@/shared/api/templateApi'
import type { Template } from '@/shared/types'

export function useTemplatePreview(token: string | null) {
  const [selected, setSelected] = useState<Template | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [selectedClassRoomId, setSelectedClassRoomId] = useState('')
  const [using, setUsing] = useState(false)
  const [useError, setUseError] = useState<string | null>(null)
  const [useSuccess, setUseSuccess] = useState(false)

  const openPreview = async (template: Template) => {
    if (!token) return
    setPreviewLoading(true)
    setPreviewError(null)
    setUseError(null)
    setUseSuccess(false)
    setSelectedClassRoomId('')
    setLessonTitle(template.title)
    try {
      const res = await templateApi.getById(template.id, token)
      setSelected(res)
    } catch (err: unknown) {
      setPreviewError(err instanceof Error ? err.message : 'Failed to load template preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreview = () => {
    setSelected(null)
    setPreviewError(null)
    setUseError(null)
    setUseSuccess(false)
    setSelectedClassRoomId('')
  }

  const handleUse = async () => {
    if (!selected || !token) return
    if (!selectedClassRoomId) { setUseError('Please select a classroom'); return }
    if (!lessonTitle.trim()) { setUseError('Please enter a lesson title'); return }
    setUsing(true)
    setUseError(null)
    try {
      await templateApi.use(selected.id, { classRoomId: Number(selectedClassRoomId), title: lessonTitle }, token)
      setUseSuccess(true)
    } catch (err: unknown) {
      setUseError(err instanceof Error ? err.message : 'Failed to use template')
    } finally {
      setUsing(false)
    }
  }

  return {
    selected, previewLoading, previewError,
    lessonTitle, setLessonTitle,
    selectedClassRoomId, setSelectedClassRoomId,
    using, useError, useSuccess,
    openPreview, closePreview, handleUse
  }
}