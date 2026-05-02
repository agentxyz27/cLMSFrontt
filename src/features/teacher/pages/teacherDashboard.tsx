import { useAuth } from '../../../context/authContext'
import { useClassRooms } from '../hooks/useClassRooms'
import { useSections } from '../hooks/useSections'
import { useCreateClassRoom } from '../hooks/useCreateClassRoom'
import ClassRoomCard from '../components/classroomCard'
import CreateClassRoomModal from '../components/createClassroomModal'
import type { ClassRoom } from '../../../shared/types'


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
     <div className="flex-1 p-6 bg-blue-200 min-h-full">

      {/* HEADER */}
      <div className='bg-yellow-500'>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name || 'Teacher'}
          </h1>

        <div className="flex gap-6 text-sm">
          <p><span className="font-bold">{classRooms.length}</span> Classrooms</p>
          <p><span className="font-bold">{totalLessons}</span> Lessons</p>
        </div>

      </div>

      <div className="mb-10"/>

      {/* CONTENT GRID */}
      {classRooms.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          No classrooms yet. Create your first classroom!
        </div>
      ) : (
        
        <div className="flex flex-col gap-4">
          <div className="text-4xl text-center font-semibold ">My Classrooms</div>
          {classRooms.map((classRoom: ClassRoom) => (
            <div key={classRoom.id}>
              <ClassRoomCard classRoom={classRoom} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={modal.openModal}
        className="bg-black text-white px-4 py-2 rounded hover:opacity-80">+ New Classroom
      </button>

      {/* MODAL */}
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