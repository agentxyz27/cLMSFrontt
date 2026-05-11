import { useSnapshots } from '../../hooks/useSnapshots'
import DetectionTab from './detectionTab'
import FocusTab from './focusTab'
import ProgressTab from './progressTab'
import AssignmentsTab from './assignmentsTab'
import StatCard from '@/shared/components/statCard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LessonSummary } from '@/shared/types'

interface Props {
  lesson: LessonSummary
  classRoomId: number
  token: string
  onClose: () => void
}

export default function AnalysisPanel({ lesson, classRoomId, token }: Props) {
  const { latest, generating, generateReport } = useSnapshots(classRoomId, lesson.id, token)

  return (
    <div className="border rounded-xl p-12 space-y-5 bg-card">

      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{lesson.title}</h2>
          <p className="text-xs text-muted-foreground">Intelligence Analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={generateReport} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {latest ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Class MPS"   value={`${latest.avgMps.toFixed(1)}%`}                        accent="blue" />
          <StatCard label="At Risk"     value={latest.atRiskCount}                                    accent="red" />
          <StatCard label="Completed"   value={`${latest.completedCount}/${latest.totalStudents}`}    accent="green" />
          <StatCard label="Highest MPS" value={`${latest.highestMps.toFixed(1)}%`}                   accent="yellow" />
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">
            No report generated yet. Click "Generate Report" to analyze this lesson.
          </p>
        </div>
      )}

      {/* Intelligence tabs */}
      <Tabs defaultValue="detection">
        <TabsList className="w-full">
          <TabsTrigger value="detection"   className="flex-1">Detection</TabsTrigger>
          <TabsTrigger value="focus"       className="flex-1">Focus</TabsTrigger>
          <TabsTrigger value="progress"    className="flex-1">Progress</TabsTrigger>
          <TabsTrigger value="assignments" className="flex-1">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="mt-4">
          <DetectionTab classRoomId={classRoomId} lessonId={lesson.id} token={token} />
        </TabsContent>

        <TabsContent value="focus" className="mt-4">
          <FocusTab classRoomId={classRoomId} lessonId={lesson.id} token={token} />
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <ProgressTab classRoomId={classRoomId} lessonId={lesson.id} token={token} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <AssignmentsTab classRoomId={classRoomId} token={token} />
        </TabsContent>
      </Tabs>

    </div>
  )
}