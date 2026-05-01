import { useState } from 'react'
import { lessonApi } from '../../../shared/api/lessonApi'
import { templateApi } from '../../../shared/api/templateApi'
import type { LessonGraph, Template } from '../../../shared/types'

interface CreatedLesson { id: number; title: string }
export type Step = 'title' | 'choose' | 'editor'

export function useNewLessonFlow(classRoomId: string, token: string | null) {
  const [step, setStep] = useState<Step>('title')
  const [title, setTitle] = useState('')
  const [lesson, setLesson] = useState<CreatedLesson | null>(null)
  const [initialContent, setInitialContent] = useState<LessonGraph | null>(null)
  const [creating, setCreating] = useState(false)
  const [using, setUsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)

  const handleTitleNext = () => {
    if (!title.trim()) { setError('Title is required'); return }
    setError(null)
    setStep('choose')
  }

  const handleBlankLesson = async () => {
    if (!token) return
    setCreating(true)
    setError(null)
    try {
      const res = await lessonApi.create({ title, classRoomId: Number(classRoomId) }, token)
      setLesson(res.lesson)
      setInitialContent(null)
      setStep('editor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson')
    } finally {
      setCreating(false)
    }
  }

  const handleUseTemplate = async (selectedTemplate: Template) => {
    if (!token) return
    setUsing(true)
    setError(null)
    try {
      const res = await templateApi.use(
        selectedTemplate.id,
        { classRoomId: Number(classRoomId), title },
        token
      )
      setLesson(res.lesson)
      setInitialContent(selectedTemplate.contentJson ?? null)
      setStep('editor')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson from template')
    } finally {
      setUsing(false)
    }
  }

  const toggleTemplate = (id: number) =>
    setSelectedTemplateId(prev => prev === id ? null : id)

  return {
    step, title, setTitle,
    lesson, initialContent,
    creating, using, error,
    selectedTemplateId, toggleTemplate,
    handleTitleNext, handleBlankLesson, handleUseTemplate,
    goBack: () => setStep('title')
  }
}