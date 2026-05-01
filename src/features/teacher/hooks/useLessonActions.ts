import { useState } from 'react'
import { lessonApi } from '../../../shared/api/lessonApi'
import { templateApi } from '../../../shared/api/templateApi'
import type { LessonSummary } from '../../../shared/types'

export function useLessonActions(token: string | null, onSuccess: () => void) {
  const [publishingId, setPublishingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const deleteLesson = async (lessonId: number) => {
    if (!confirm('Delete this lesson? This cannot be undone.') || !token) return
    try {
      await lessonApi.delete(lessonId, token)
      onSuccess()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete lesson')
    }
  }

  const renameLesson = async (lessonId: number, title: string) => {
    if (!title.trim() || !token) return
    try {
      await lessonApi.update(lessonId, { title }, token)
      onSuccess()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to rename lesson')
    }
  }

  const publishLesson = async (lesson: LessonSummary) => {
    if (!lesson.contentJson?.nodes?.length) {
      alert('This lesson has no content to publish.')
      return
    }
    if (!confirm(`Publish "${lesson.title}" to the template library?`) || !token) return
    setPublishingId(lesson.id)
    try {
      await templateApi.create(
        { title: lesson.title, contentJson: lesson.contentJson, isPublic: true },
        token
      )
      alert(`"${lesson.title}" has been published to the template library.`)
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to publish lesson')
    } finally {
      setPublishingId(null)
    }
  }

  return { deleteLesson, renameLesson, publishingId, actionError, publishLesson}
}