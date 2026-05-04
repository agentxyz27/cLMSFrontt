import { useAuth } from '@/context/authContext'
import { useClassRooms } from '../hooks/useClassRooms'
import { useSections } from '../hooks/useSections'
import { useCreateClassRoom } from '../hooks/useCreateClassRoom'
import ClassRoomCard from '../components/classroomCard'
import CreateClassRoomModal from '../components/createClassroomModal'
import type { ClassRoom } from '@/shared/types'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
    <div className='flex flex-col min-h-screen gap-4'>
      <h1>Welcome, {user?.name || 'Teacher'}</h1>
        <div className='flex justify-center'>
        <Card className='p-4 w-3/4 '>
          <p>Total Classrooms: {classRooms.length}</p>
          <p>Total Lessons: {totalLessons}</p>
        <Button onClick={modal.openModal}>+ New Classroom</Button>
        </Card>
        </div>

      <h2>My Classrooms</h2>
        {classRooms.length === 0 ? (
          <p>No classrooms yet. Create your first classroom!</p>
        ) : (
          <div className='flex flex-col gap-4'>
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