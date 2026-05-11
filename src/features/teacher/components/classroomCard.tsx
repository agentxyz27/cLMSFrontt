import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '@/shared/utils/slugify'
import { useClassroomHealth } from '../hooks/useClassHealth'
import { useClassroomTrend } from '../hooks/useClassTrend'
import type { ClassRoom } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface Props {
  classRoom: ClassRoom
}

const getTrend = (mpsTrend: { avgMps: number }[]) => {
  if (mpsTrend.length < 2) return null
  const last     = mpsTrend[mpsTrend.length - 1].avgMps
  const previous = mpsTrend[mpsTrend.length - 2].avgMps
  const delta    = last - previous
  if (delta > 2)  return { label: 'Improving', color: '#10b981', arrow: '↑' }
  if (delta < -2) return { label: 'Declining', color: '#ef4444', arrow: '↓' }
  return           { label: 'Stable',    color: '#f59e0b', arrow: '→' }
}

const getMpsTextColor = (mps: number) => {
  if (mps >= 85) return 'text-emerald-600'
  if (mps >= 75) return 'text-yellow-500'
  return 'text-red-500'
}

const getLineColor = (mps: number) => {
  if (mps >= 85) return '#10b981'
  if (mps >= 75) return '#f59e0b'
  return '#ef4444'
}

const SparkTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-background px-2 py-1 text-xs shadow-sm">
      <span className="font-medium">{payload[0].value.toFixed(1)} MPS</span>
    </div>
  )
}

export default function ClassRoomCard({ classRoom }: Props) {
  const navigate    = useNavigate()
  const slug        = classRoomSlug(classRoom.id, classRoom.subject.name, classRoom.section.name)
  const lessonCount = classRoom._count?.lessons ?? 0

  const { data: health, isLoading } = useClassroomHealth(classRoom.id)
  const { data: trend }               = useClassroomTrend(classRoom.id, '1month')

  const trendDir   = health ? getTrend(health.mpsTrend) : null
  const chartData  = trend?.points.map((p, i) => ({ i, mps: p.avgMps })) ?? []

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold leading-tight">
              {classRoom.subject.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Grade {classRoom.section.grade.level} — {classRoom.section.name}
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs">
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3 flex-1">

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : health && health.classHealthScore !== null ? (
          <>
            {/* Score + at-risk row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Class MPS</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold tabular-nums ${getMpsTextColor(health.classHealthScore)}`}>
                    {health.classHealthScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                  {trendDir && (
                    <span className="text-sm font-medium" style={{ color: trendDir.color }}>
                      {trendDir.arrow} {trendDir.label}
                    </span>
                  )}
                </div>
              </div>

              {health.atRiskCount > 0 ? (
                <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded-md px-2 py-1">
                  <span className="text-red-600 font-bold text-sm tabular-nums">
                    {health.atRiskCount}
                  </span>
                  <span className="text-red-500 text-xs">at risk</span>
                </div>
              ) : health.totalStudents > 0 ? (
                <span className="text-xs text-emerald-600 font-medium">All passing</span>
              ) : null}
            </div>

            {/* Sparkline */}
            {chartData.length >= 2 ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1">MPS trend</p>
                <ResponsiveContainer width="100%" height={48}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <Tooltip content={<SparkTooltip />} />
                    <ReferenceLine
                      y={75}
                      stroke="#f59e0b"
                      strokeDasharray="3 2"
                      strokeWidth={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="mps"
                      stroke={getLineColor(health.classHealthScore)}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5 px-1">
                  <span>30 days ago</span>
                  <span className="text-yellow-500">— mastery 75</span>
                  <span>Today</span>
                </div>
              </div>
            ) : chartData.length === 1 ? (
              <p className="text-xs text-muted-foreground italic">
                1 lesson completed — trend available after more lessons
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">No lesson data yet</p>
        )}

        <div className="flex-1" />

        <Button
          size="sm"
          className="w-full"
          onClick={() => navigate(`/teacher/classrooms/${slug}`)}
        >
          Manage
        </Button>

      </CardContent>
    </Card>
  )
}