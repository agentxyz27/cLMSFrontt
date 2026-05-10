import { useClassroomHealth } from '../../hooks/useClassHealth'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Users, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'


interface Props {
  classRoomId: number
}

const MPS_THRESHOLD = 75

const getMpsColor = (mps: number) => {
  if (mps >= 85) return 'text-emerald-600'
  if (mps >= 75) return 'text-yellow-500'
  return 'text-red-500'
}

const getMpsBg = (mps: number) => {
  if (mps >= 85) return 'bg-emerald-50 border-emerald-200'
  if (mps >= 75) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

const HealthScore = ({ score }: { score: number | null }) => {
  if (score === null) return <span className="text-muted-foreground text-sm">No data yet</span>
  return (
    <span className={`text-4xl font-bold tabular-nums ${getMpsColor(score)}`}>
      {score.toFixed(1)}
      <span className="text-base font-normal text-muted-foreground ml-1">MPS</span>
    </span>
  )
}

export const ClassHealthPanel = ({ classRoomId }: Props) => {
  const { data, isLoading, isError } = useClassroomHealth(classRoomId)

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  if (isError || !data) return (
    <div className="flex items-center gap-2 text-red-500 text-sm p-4">
      <AlertTriangle size={16} />
      Failed to load classroom health data.
    </div>
  )

  const {
    classHealthScore,
    atRiskCount,
    atRiskRate,
    totalStudents,
    totalLessons,
    mpsTrend,
    worstLesson,
    bestLesson,
    studentHealthList
  } = data

  return (
    <div className="space-y-4">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <Card className={`border ${classHealthScore !== null ? getMpsBg(classHealthScore) : ''}`}>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Class Health
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <HealthScore score={classHealthScore} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle size={11} /> At Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-4xl font-bold tabular-nums text-red-500">
              {atRiskCount}
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              / {totalStudents}
            </span>
            <div className="text-xs text-muted-foreground mt-0.5">
              {(atRiskRate * 100).toFixed(0)}% of class
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
              <Users size={11} /> Students
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-4xl font-bold tabular-nums">{totalStudents}</span>
            <div className="text-xs text-muted-foreground mt-0.5">with snapshots</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
              <BookOpen size={11} /> Lessons
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-4xl font-bold tabular-nums">{totalLessons}</span>
            <div className="text-xs text-muted-foreground mt-0.5">tracked</div>
          </CardContent>
        </Card>

      </div>

      {/* ── Lesson Alerts ── */}
      {(worstLesson || bestLesson) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {worstLesson && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50">
              <TrendingDown size={18} className="text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Weakest Lesson</div>
                <div className="text-sm font-medium truncate">{worstLesson.title}</div>
              </div>
              <span className="ml-auto text-red-600 font-bold tabular-nums text-sm shrink-0">
                {worstLesson.avgMps.toFixed(1)}
              </span>
            </div>
          )}
          {bestLesson && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50">
              <TrendingUp size={18} className="text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Strongest Lesson</div>
                <div className="text-sm font-medium truncate">{bestLesson.title}</div>
              </div>
              <span className="ml-auto text-emerald-600 font-bold tabular-nums text-sm shrink-0">
                {bestLesson.avgMps.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── MPS Trend Chart ── */}
      {mpsTrend.length > 1 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Class MPS Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Average MPS per lesson over time</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={mpsTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val) => [`${Number(val).toFixed(1)} MPS`,'Avg MPS']} //revised
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <ReferenceLine
                  y={MPS_THRESHOLD}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  label={{ value: '75 (Mastery)', fontSize: 10, fill: '#f59e0b', position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgMps"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#6366f1' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Student Health List ── */}
      {studentHealthList.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">Student Health</CardTitle>
            <p className="text-xs text-muted-foreground">Sorted by average MPS — weakest first</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {studentHealthList.map(s => (
                <div
                  key={s.studentId}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                >
                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{s.name}</span>
                      {s.isAtRisk && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                          At Risk
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.lessonsCompleted} lesson{s.lessonsCompleted !== 1 ? 's' : ''} completed
                    </div>
                  </div>

                  {/* MPS bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.avgMps >= 85 ? 'bg-emerald-500' : s.avgMps >= 75 ? 'bg-yellow-400' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(s.avgMps, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold tabular-nums w-12 text-right ${getMpsColor(s.avgMps)}`}>
                      {s.avgMps.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {studentHealthList.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No lesson snapshots yet for this classroom.
          <br />
          Students need to complete at least one lesson.
        </div>
      )}

    </div>
  )
}