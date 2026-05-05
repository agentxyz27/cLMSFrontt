import { useEffect, useState } from 'react'
import { teacherClassroomApi } from '@/shared/api/teacherClassroomApi'
import { subjectApi } from '@/shared/api/subjectApi'
import type { Subject } from '@/shared/types'

export function useCreateClassRoom(token: string | null, onSuccess: () => void) {
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setSubjectsLoading(true)

    subjectApi
      .getAll(token)
      .then(setSubjectOptions)
      .catch(() => setSubjectOptions([]))
      .finally(() => setSubjectsLoading(false))
  }, [token])

  const openModal = () => {
    setShowModal(true)
    setCreateError(null)
    setSelectedSubjectId('')
    setSelectedSectionId('')
  }

  const closeModal = () => setShowModal(false)

  const handleCreate = async () => {
    if (!selectedSubjectId || !selectedSectionId) {
      setCreateError('Please select both a subject and a section')
      return
    }
    if (!token) return

    setCreating(true)
    setCreateError(null)

    try {
      await teacherClassroomApi.create(
        {
          subjectId: Number(selectedSubjectId),
          sectionId: Number(selectedSectionId),
        },
        token
      )
      setShowModal(false)
      onSuccess()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  return {
    showModal,
    openModal,
    closeModal,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedSectionId,
    setSelectedSectionId,
    creating,
    createError,
    handleCreate,
    subjectOptions,
    subjectsLoading,
  }
}