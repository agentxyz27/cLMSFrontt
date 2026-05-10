import { useState } from 'react'
import { useFocus } from '../../hooks/useFocus'
import { useProgressEngine } from '../../hooks/useProgressEngine'
import { useSnapshots } from '../../hooks/useSnapshots'
import DrillDownView from './drillDownView'
import AssignRemediationModal from '../assignRemediationModal'
import StatCard from '@/shared/components/statCard'
import MpsBadge from '@/shared/components/mpsBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { StudentProgressResult, PriorityStudent } from '@/shared/types'

interface Props {
  classRoomId: number
  lessonId: number
  token: string
}

const priorityColor = {
  urgent: 'border-red-200 bg-red-50',
  watch:  'border-yellow-200 bg-yellow-50',
  good:   'border-emerald-200 bg-emerald-50'
}

export default function FocusTab({ classRoomId, lessonId, token }: Props) {
  const {
    data,
    drillDown,
    loading,
    drillLoading,
    fetchDrillDown,
    clearDrillDown
  } = useFocus(classRoomId, lessonId, token)

  const { getStudentProgress } = useProgressEngine(classRoomId, lessonId, token)
  const { studentSnapshots } = useSnapshots(classRoomId, lessonId, token)

  const [selectedStudent, setSelectedStudent]   = useState<number | null>(null)
  const [studentProgress, setStudentProgress]   = useState<StudentProgressResult | null>(null)
  const [progressLoading, setProgressLoading]   = useState(false)
  const [assignTarget, setAssignTarget]         = useState<PriorityStudent | null>(null)

  const handleStudentClick = async (studentId: number) => {
    if (selectedStudent === studentId) {
      clearDrillDown()
      setSelectedStudent(null)
      setStudentProgress(null)
      return
    }
    setSelectedStudent(studentId)
    setProgressLoading(true)
    const [, progress] = await Promise.all([
      fetchDrillDown(studentId),
      getStudentProgress(studentId)
    ])
    if (progress) setStudentProgress(progress)
    setProgressLoading(false)
  }

  if (loading) return (
    <div className="space-y-2">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )

  if (!data) return (
    <p className="text-muted-foreground text-sm">No focus data yet.</p>
  )

  return (
    <div className="space-y-6">

      {/* Summary counts */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total"  value={data.priorityList.totalStudents} accent="blue" />
        <StatCard label="Urgent" value={data.priorityList.urgent}        accent="red" />
        <StatCard label="Watch"  value={data.priorityList.watch}         accent="yellow" />
        <StatCard label="Good"   value={data.priorityList.good}          accent="green" />
      </div>

      {/* Priority list */}
      <div>
        <h3 className="font-semibold mb-3">Priority List</h3>
        <div className="space-y-2">
          {data.priorityList.students.map(s => (
            <div
              key={s.studentId}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                ${priorityColor[s.priority]}
                ${selectedStudent === s.studentId ? 'ring-2 ring-primary' : ''}
              `}
              onClick={() => handleStudentClick(s.studentId)}
            >
              <div>
                <p className="font-medium text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.avgAttempts.toFixed(1)} avg attempts · {s.avgHintsUsed.toFixed(1)} avg hints
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">{s.priority}</Badge>
                <MpsBadge mps={s.mps} />
                {s.isAtRisk && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs h-7 px-2"
                    onClick={e => { e.stopPropagation(); setAssignTarget(s) }}
                  >
                    Assign
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drill down panel */}
      {selectedStudent && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Student Breakdown</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDrillDown()
                setSelectedStudent(null)
                setStudentProgress(null)
              }}
            >
              ✕
            </Button>
          </div>
          {drillLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : drillDown ? (
            <DrillDownView
              data={drillDown}
              progress={studentProgress}
              loading={progressLoading}
            />
          ) : null}
        </div>
      )}

      <Separator />

      {/* Class weak spots */}
      <div>
        <h3 className="font-semibold mb-3">Class Weak Spots</h3>
        {data.classWeakSpots.weakSpots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weak spots detected.</p>
        ) : (
          <div className="space-y-2">
            {data.classWeakSpots.weakSpots.map(w => (
              <div
                key={w.topicId}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">{w.topicName}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.avgAttempts.toFixed(1)} avg attempts · {w.avgHints.toFixed(1)} avg hints
                  </p>
                </div>
                <MpsBadge mps={w.correctRate} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Remediation Modal */}
      {assignTarget && (
        <AssignRemediationModal
          student={assignTarget}
          snapshot={studentSnapshots.find(s => s.studentId === assignTarget.studentId) ?? null}
          classRoomId={classRoomId}
          token={token}
          onClose={() => setAssignTarget(null)}
          onAssigned={() => setAssignTarget(null)}
        />
      )}

    </div>
  )
}