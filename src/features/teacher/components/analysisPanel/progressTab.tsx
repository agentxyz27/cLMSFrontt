import { useProgressEngine } from '../../hooks/useProgressEngine'
import { MpsTrendChart } from '../mpsTrendChart'
import StatCard from '@/shared/components/statCard'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface Props {
  classRoomId: number
  lessonId: number
  token: string
}

export default function ProgressTab({ classRoomId, lessonId, token }: Props) {
  const { heatmap, classProgress, improvement, loading } = useProgressEngine(
    classRoomId,
    lessonId,
    token
  )

  if (loading) return <Skeleton className="h-40 w-full" />

  return (
    <div className="space-y-6">

      {/* Class MPS trend chart */}
      {classProgress && (
        <MpsTrendChart data={classProgress} />
      )}

      <Separator />

      {/* Heatmap */}
      {heatmap && heatmap.students.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Student × Lesson Heatmap</h3>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground">Student</th>
                  {heatmap.lessons.map(l => (
                    <th
                      key={l.id}
                      className="p-2 font-medium text-muted-foreground text-center max-w-20 truncate"
                    >
                      {l.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.students.map(row => (
                  <tr key={row.studentId} className="border-t">
                    <td className="p-2 font-medium">{row.name}</td>
                    {row.scores.map(score => (
                      <td key={score.lessonId} className="p-2 text-center">
                        {score.mps === null ? (
                          <span className="inline-block w-10 h-6 rounded bg-muted" />
                        ) : (
                          <span className={`inline-block px-2 py-0.5 rounded text-white text-xs font-medium ${
                            score.mps >= 90 ? 'bg-emerald-500' :
                            score.mps >= 75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                            {score.mps.toFixed(0)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Separator />

      {/* Remediation impact */}
      {improvement && improvement.total > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Remediation Impact</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="Improved"  value={improvement.improved.length}  accent="green" />
            <StatCard label="No Change" value={improvement.noChange.length}  accent="yellow" />
            <StatCard label="No Data"   value={improvement.noData.length}    accent="blue" />
          </div>
          {improvement.improved.length > 0 && (
            <div className="space-y-2">
              {improvement.improved.map(e => (
                <div
                  key={e.studentId}
                  className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50"
                >
                  <p className="font-medium text-sm">{e.name}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{e.originalMps.toFixed(1)}%</span>
                    <span>→</span>
                    <span className="text-emerald-600 font-medium">
                      {e.followUpMps?.toFixed(1)}%
                    </span>
                    <Badge className="bg-emerald-500 text-white">
                      +{e.mpsDelta?.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}