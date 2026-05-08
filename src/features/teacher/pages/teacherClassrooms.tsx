import { useAuth } from '@/context/authContext'
import { useClassRooms } from '../hooks/useClassRooms'
import { useSections } from '../hooks/useSections'
import { useCreateClassRoom } from '../hooks/useCreateClassRoom'
import ClassRoomCard from '../components/classroomCard'
import CreateClassRoomModal from '../components/createClassroomModal'
import StatCard from '@/shared/components/statCard'
import type { ClassRoom } from '@/shared/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function TeacherClassrooms() {
  const { token } = useAuth()
  const { data: classRooms, loading, error, refetch } = useClassRooms(token)
  const modal = useCreateClassRoom(token, refetch)
  const { data: sectionOptions = [], loading: sectionsLoading } = useSections(
    modal.showModal ? token : null
  )

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  )

  if (error) return <p className="text-destructive text-sm">Error: {error}</p>

  const totalLessons = classRooms.reduce((sum, c) => sum + (c._count?.lessons ?? 0), 0)

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <Button onClick={modal.openModal}>+ New Classroom</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Classrooms"
          value={classRooms.length}
          accent="blue"
        />
        <StatCard
          label="Total Lessons"
          value={totalLessons}
          accent="green"
        />
      </div>

      {/* Classrooms grid */}
      {classRooms.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No classrooms yet.</p>
          <Button className="mt-4" onClick={modal.openModal}>
            + Create your first classroom
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            My Classrooms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classRooms.map((classRoom: ClassRoom) => (
              <ClassRoomCard key={classRoom.id} classRoom={classRoom} />
            ))}
          </div>
        </div>
      )}

      {/* Create classroom modal */}
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