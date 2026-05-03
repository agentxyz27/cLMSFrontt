import { useAuth } from '@/context/authContext'
import { useClassRooms } from '../hooks/useClassRooms'
import { useSections } from '../hooks/useSections'
import { useCreateClassRoom } from '../hooks/useCreateClassRoom'
import ClassRoomCard from '../components/classroomCard'
import CreateClassRoomModal from '../components/createClassroomModal'
import type { ClassRoom } from '@/shared/types'

export default function TeacherDashboard() {
  const { token, user } = useAuth()
  const { data: classRooms, loading, error, refetch } = useClassRooms(token)
  const modal = useCreateClassRoom(token, refetch)
  const { data: sectionOptions = [], loading: sectionsLoading } = useSections(
    modal.showModal ? token : null
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalLessons = classRooms.reduce((sum, c) => sum + (c._count?.lessons ?? 0), 0)

  return (
    <div>
      <h1>Welcome, {user?.name || 'Teacher'}</h1>
      <p>Total Classrooms: {classRooms.length}</p>
      <p>Total Lessons: {totalLessons}</p>
      <button onClick={modal.openModal}>+ New Classroom</button>

      <h2>My Classrooms</h2>
      {classRooms.length === 0 ? (
        <p>No classrooms yet. Create your first classroom!</p>
      ) : (
        <div>
          {classRooms.map((classRoom: ClassRoom) => (
            <ClassRoomCard key={classRoom.id} classRoom={classRoom} />
          ))}
        </div>
      )}

      {modal.showModal && (
        <CreateClassRoomModal
          {...modal}
          sectionOptions={sectionOptions}
          sectionsLoading={sectionsLoading}
          onCreate={modal.handleCreate}
          onClose={modal.closeModal}
        />
      )}
    </div>
  )
}