import { useState } from 'react'
import { teacherClassroomApi } from '../../../shared/api/teacherClassroomApi'

export function useCreateClassRoom(token: string | null, onSuccess: () => void) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const openModal = () => {
    setIsOpen(true)
    setCreateError(null)
    setSelectedSubjectId('')
    setSelectedSectionId('')
  }

  const closeModal = () => setIsOpen(false)

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
      setIsOpen(false)
      onSuccess()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  return {
    isOpen, openModal, closeModal,
    selectedSubjectId, setSelectedSubjectId,
    selectedSectionId, setSelectedSectionId,
    creating, createError, handleCreate
  }
}