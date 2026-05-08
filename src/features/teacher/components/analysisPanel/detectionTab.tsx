import { useDetection } from '../../hooks/useDetection'
import { WeakTopicsChart } from '../weakTopicsChart'
import MpsBadge from '@/shared/components/mpsBadge'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface Props {
  classRoomId: number
  lessonId: number
  token: string
}

export default function DetectionTab({ classRoomId, lessonId, token }: Props) {
  const { data, loading } = useDetection(classRoomId, lessonId, token)

  if (loading) return (
    <div className="space-y-2">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )

  if (!data) return (
    <p className="text-muted-foreground text-sm">
      No detection data yet. Generate a report first.
    </p>
  )

  return (
    <div className="space-y-6">

      {/* At-Risk Students */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          At-Risk Students
          <Badge variant="destructive">{data.atRisk.total}</Badge>
        </h3>
        {data.atRisk.students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No at-risk students. 🎉</p>
        ) : (
          <div className="space-y-2">
            {data.atRisk.students.map(s => (
              <div
                key={s.studentId}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.avgAttempts.toFixed(1)} avg attempts · {s.avgHintsUsed.toFixed(1)} avg hints
                  </p>
                </div>
                <MpsBadge mps={s.mps} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Weak Topics */}
      <div>
        <h3 className="font-semibold mb-3">Weak Topics</h3>
        {data.weakTopics.topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weak topics detected.</p>
        ) : (
          <WeakTopicsChart topics={data.weakTopics.topics} />
        )}
      </div>

      <Separator />

      {/* Regression Alerts */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          Regression Alerts
          {data.regression.total > 0 && (
            <Badge variant="destructive">{data.regression.total}</Badge>
          )}
        </h3>
        {data.regression.regressions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No regression detected.</p>
        ) : (
          <div className="space-y-2">
            {data.regression.regressions.map(r => (
              <div
                key={r.studentId}
                className="p-3 rounded-lg border border-red-200 bg-red-50"
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.previousLesson}: {r.previousMps.toFixed(1)}%
                  {' → '}
                  {r.latestLesson}: {r.latestMps.toFixed(1)}%
                  <span className="text-red-500 font-medium ml-1">
                    ↓ {r.drop.toFixed(1)} pts
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}