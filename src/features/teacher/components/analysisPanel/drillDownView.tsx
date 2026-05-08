import { StudentTrendChart } from '../studentTrendChart'
import MpsBadge from '@/shared/components/mpsBadge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { StudentDrillDown, StudentProgressResult } from '@/shared/types'

interface Props {
  data: StudentDrillDown
  progress: StudentProgressResult | null
  loading: boolean
}

export default function DrillDownView({ data, progress, loading }: Props) {
  return (
    <div className="space-y-4">
      {/* Student header */}
      <div className="flex items-center gap-2">
        <p className="font-medium">{data.name}</p>
        {data.mps !== null && <MpsBadge mps={data.mps} />}
        {data.isAtRisk && <Badge variant="destructive">At Risk</Badge>}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-1">
        {data.questions.map(q => (
          <div
            key={q.questionId}
            className="flex items-center justify-between text-sm p-2 rounded border"
          >
            <div className="flex items-center gap-2">
              <span className={q.correct ? 'text-emerald-500' : 'text-red-500'}>
                {q.correct ? '✓' : '✗'}
              </span>
              <span className="text-muted-foreground">Q{q.order}</span>
              <span>{q.topicName}</span>
            </div>
            <div className="text-xs text-muted-foreground flex gap-3">
              <span>{q.attempts} attempts</span>
              <span>{q.hintsUsed} hints</span>
            </div>
          </div>
        ))}
      </div>

      {/* Student MPS trend chart */}
      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : progress ? (
        <StudentTrendChart data={progress} />
      ) : null}
    </div>
  )
}