import { useState } from 'react'
import { teacherClassroomApi } from '../../../shared/api/teacherClassroomApi'

export function useCreateClassRoom(token: string | null, onSuccess: () => void) {
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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
      await teacherClassroomApi.create({ subjectId: selectedSubjectId, sectionId: selectedSectionId }, token)
      setShowModal(false)
      onSuccess()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  return {
    showModal, openModal, closeModal,
    selectedSubjectId, setSelectedSubjectId,
    selectedSectionId, setSelectedSectionId,
    creating, createError, handleCreate
  }
}