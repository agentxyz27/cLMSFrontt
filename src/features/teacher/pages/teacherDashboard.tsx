import React from 'react'
import { useAuth } from '@/context/authContext'
import { useClassRooms } from '../hooks/useClassRooms'
import { useClassroomHealth } from '../hooks/useClassHealth'
import { useNavigate } from 'react-router-dom'
import { classRoomSlug } from '@/shared/utils/slugify'
import type { ClassRoom } from '@/shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts'

// ── Per-classroom health fetcher ───────────────────────────────────────────
// Fetches health for one classroom and renders its contribution to
// the parent aggregation via render props pattern.
function ClassroomHealthLoader({
  classRoom,
  onData
}: {
  classRoom: ClassRoom
  onData: (id: number, data: any) => void
}) {
  const { data } = useClassroomHealth(classRoom.id)
  if (data) onData(classRoom.id, data)
  return null
}

const getBarColor = (mps: number) => {
  if (mps >= 85) return '#10b981'
  if (mps >= 75) return '#f59e0b'
  return '#ef4444'
}

const getMpsTextColor = (mps: number) => {
  if (mps >= 85) return 'text-emerald-600'
  if (mps >= 75) return 'text-yellow-500'
  return 'text-red-500'
}

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm space-y-0.5">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        MPS: <span className="font-medium text-foreground">{payload[0].value.toFixed(1)}</span>
      </p>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { data: classRooms, loading } = useClassRooms(token)

  // Collect health data keyed by classRoomId
  const [healthMap, setHealthMap] = React.useState<Record<number, any>>({})

  const handleHealthData = React.useCallback((id: number, data: any) => {
    setHealthMap(prev => {
      if (prev[id] === data) return prev
      return { ...prev, [id]: data }
    })
  }, [])

  // ── Derived data ──────────────────────────────────────────────────────────

  // Bar chart data — one bar per classroom
  const chartData = classRooms
    .map(c => {
      const health = healthMap[c.id]
      return {
        id:       c.id,
        name:     `${c.subject.name} · ${c.section.name}`,
        shortName: `${c.subject.name} Gr.${c.section.grade.level}-${c.section.name}`,
        mps:      health?.classHealthScore ?? null,
        slug:     classRoomSlug(c.id, c.subject.name, c.section.name)
      }
    })
    .filter(d => d.mps !== null)

  // Urgent students — flatten at-risk students across all classrooms
  const urgentStudents = classRooms.flatMap(c => {
    const health = healthMap[c.id]
    if (!health) return []
    return health.studentHealthList
      .filter((s: any) => s.isAtRisk)
      .map((s: any) => ({
        ...s,
        classRoomName: `${c.subject.name} · Gr.${c.section.grade.level} ${c.section.name}`,
        slug:          classRoomSlug(c.id, c.subject.name, c.section.name)
      }))
  }).sort((a, b) => a.avgMps - b.avgMps) // weakest first

  const allHealthLoaded = classRooms.length > 0 &&
    classRooms.every(c => healthMap[c.id] !== undefined)

  return (
    <div className="space-y-6">

      {/* Invisible loaders — one per classroom */}
      {classRooms.map(c => (
        <ClassroomHealthLoader
          key={c.id}
          classRoom={c}
          onData={handleHealthData}
        />
      ))}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {user?.name ?? 'Teacher'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here's how your classrooms are doing.
        </p>
      </div>

      {/* Classroom MPS comparison chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Classroom MPS Comparison</CardTitle>
          <p className="text-xs text-muted-foreground">
            Average MPS across all lessons per classroom
          </p>
        </CardHeader>
        <CardContent>
          {loading || !allHealthLoaded ? (
            <Skeleton className="h-48 w-full" />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No lesson data yet across your classrooms.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
                barCategoryGap="35%"
              >
                <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                <ReferenceLine
                  y={75}
                  stroke="#f59e0b"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: '75 mastery',
                    fontSize: 10,
                    fill: '#f59e0b',
                    position: 'insideTopRight'
                  }}
                />
                <Bar dataKey="mps" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  {chartData.map(entry => (
                    <Cell key={entry.id} fill={getBarColor(entry.mps)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Urgent students */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                Urgent Students
                {urgentStudents.length > 0 && (
                  <Badge variant="destructive">{urgentStudents.length}</Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Students below 75 MPS — sorted weakest first
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading || !allHealthLoaded ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : urgentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No at-risk students across your classrooms.
            </p>
          ) : (
            <div className="space-y-2">
              {urgentStudents.map(s => (
                <div
                  key={`${s.studentId}-${s.classRoomName}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50"
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.classRoomName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-sm font-bold tabular-nums ${getMpsTextColor(s.avgMps)}`}>
                        {s.avgMps.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">avg MPS</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 shrink-0"
                      onClick={() => navigate(`/teacher/classrooms/${s.slug}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}