import { useState, useCallback } from 'react'
import { api } from '@/shared/api/api'
import type { LessonGraph } from '@/shared/types'

export function useSave(lessonId: number, token: string | null) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const save = useCallback(
    async (lessonContent: LessonGraph) => {
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
    },
    [lessonId, token]
  )

  return { saving, saveError, saveSuccess, save }
}