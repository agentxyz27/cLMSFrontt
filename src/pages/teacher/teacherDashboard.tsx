import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import { classRoomSlug } from '../../utils/slugify'

interface Grade {
  id: number
  level: number
}

interface Section {
  id: number
  name: string
  grade: Grade
}

interface Subject {
  id: number
  name: string
}

interface ClassRoom {
  id: number
  teacherId: number
  subjectId: number
  sectionId: number
  createdAt: string
  subject: Subject
  section: Section
  _count: { lessons: number }
}

interface SectionOption {
  id: number
  level: number
  sections: { id: number; name: string }[]
}

export default function TeacherDashboard() {
  const { token, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [classRooms, setClassRooms] = useState<ClassRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !token) return
    fetchClassRooms()
  }, [token, authLoading])

  const fetchClassRooms = async () => {
    try {
      const res = await api.get<ClassRoom[]>('/classrooms/mine', token)
      setClassRooms(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load classrooms')
    } finally {
      setLoading(false)
    }
  }

  const openModal = async () => {
    setShowModal(true)
    setCreateError(null)
    setSelectedSubjectId('')
    setSelectedSectionId('')
    try {
      const res = await api.get<SectionOption[]>('/sections', token)
      setSectionOptions(res)
    } catch {
      setCreateError('Failed to load sections')
    }
  }

  const handleCreateClassRoom = async () => {
    if (!selectedSubjectId || !selectedSectionId) {
      setCreateError('Please select both a subject and a section')
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await api.post('/classrooms', { subjectId: selectedSubjectId, sectionId: selectedSectionId }, token)
      setShowModal(false)
      await fetchClassRooms()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create classroom')
    } finally {
      setCreating(false)
    }
  }

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalLessons = classRooms.reduce((sum, c) => sum + c._count.lessons, 0)

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
          {classRooms.map(classRoom => (
            <div key={classRoom.id}>
              <h3>{classRoom.subject.name}</h3>
              <p>Grade {classRoom.section.grade.level} — {classRoom.section.name}</p>
              <p>Lessons: {classRoom._count.lessons}</p>
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

            {/* Subject — only Math is unlocked for now */}
            <label>Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
            >
              <option value=''>Select subject</option>
              <option value='1'>Mathematics</option>
            </select>

            {/* Section — grouped by grade */}
            <label>Section</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
            >
              <option value=''>Select section</option>
              {sectionOptions.map(grade => (
                <optgroup key={grade.id} label={`Grade ${grade.level}`}>
                  {grade.sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </optgroup>
              ))}
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