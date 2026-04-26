import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useClassRooms } from '../../hooks/useClassRooms'
import { useSections } from '../../hooks/useSections'
import { teacherClassroomApi } from '../../api/teacherClassroomApi'
import { classRoomSlug } from '../../utils/slugify'
import type { ClassRoom } from '../../types'

export default function TeacherDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const { data: classRooms, loading, error, refetch } = useClassRooms(token)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const { data: sectionOptions, loading: sectionsLoading } = useSections(showModal ? token : null)

  const openModal = () => {
    setShowModal(true)
    setCreateError(null)
    setSelectedSubjectId('')
    setSelectedSectionId('')
  }

  const handleCreateClassRoom = async () => {
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
      await refetch()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalLessons = classRooms.reduce((sum, c) => sum + (c._count?.lessons ?? 0), 0)

  return (
    <div>
      <h1>Welcome, {user?.name || 'Teacher'}</h1>
      <p>Total Classrooms: {classRooms.length}</p>
      <p>Total Lessons: {totalLessons}</p>
      <button onClick={openModal}>+ New Classroom</button>

      <h2>My Classrooms</h2>
      {classRooms.length === 0 ? (
        <p>No classrooms yet. Create your first classroom!</p>
      ) : (
        <div>
          {classRooms.map((classRoom: ClassRoom) => (
            <div key={classRoom.id}>
              <h3>{classRoom.subject.name}</h3>
              <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>
              <p>Lessons: {classRoom._count?.lessons ?? 0}</p>
              <button onClick={() => navigate(`/teacher/classrooms/${classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)}`)}>
                Manage
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Classroom Modal */}
      {showModal && (
        <div>
          <div>
            <h2>Create Classroom</h2>

            <label>Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              <option value=''>Select subject</option>
              <option value='1'>Mathematics</option>
            </select>

            <label>Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
            >
              <option value=''>Select section</option>
              {sectionsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                sectionOptions.map(grade => (
                  <optgroup key={grade.id} label={`Grade ${grade.level}`}>
                    {grade.sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>

            {createError && <p>{createError}</p>}

            <button onClick={() => setShowModal(false)}>Cancel</button>
            <button onClick={handleCreateClassRoom} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}