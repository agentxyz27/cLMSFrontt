import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudentProgressResult } from '@/shared/types'

interface Props {
  data: StudentProgressResult
}

const chartConfig = {
  mps: {
    label: 'MPS',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

export function StudentTrendChart({ data }: Props) {
  const completed = data.trend.filter(t => t.completed)

  if (completed.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">
            {data.name} hasn't completed any lessons yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.trend.map(point => ({
    lesson: point.lessonTitle.length > 14
      ? point.lessonTitle.slice(0, 14) + '…'
      : point.lessonTitle,
    fullTitle:   point.lessonTitle,
    mps:         point.completed ? parseFloat((point.mps ?? 0).toFixed(1)) : null,
    isAtRisk:    point.isAtRisk,
    avgAttempts: point.avgAttempts,
    completed:   point.completed,
  }))

  const improved   = data.improvement !== null && data.improvement > 0
  const regressed  = data.improvement !== null && data.improvement < 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{data.name}</CardTitle>
            <CardDescription>MPS across lessons</CardDescription>
          </div>
          {data.improvement !== null && completed.length >= 2 && (
            <Badge className={
              improved  ? 'bg-emerald-500 text-white' :
              regressed ? 'bg-red-500 text-white' :
              'bg-muted text-muted-foreground'
            }>
              {improved ? '+' : ''}{data.improvement.toFixed(1)} pts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="lesson"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={v => `${v}%`}
            />
            {/* DepEd mastery threshold */}
            <ReferenceLine
              y={75}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{ value: '75%', position: 'right', fontSize: 10, fill: 'var(--destructive)' }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTitle ?? ''}
                  formatter={(value, _name, props) => {
                    if (!props.payload.completed) return ['Not completed', '']
                    return [
                      <>
                        <span className="font-medium">{value}% MPS</span>
                        {props.payload.isAtRisk && (
                          <span className="ml-1 text-red-500 text-xs">At Risk</span>
                        )}
                        <br />
                        <span className="text-muted-foreground text-xs">
                          {props.payload.avgAttempts?.toFixed(1)} avg attempts
                        </span>
                      </>,
                      ''
                    ]
                  }}
                />
              }
            />
            <Line
              dataKey="mps"
              stroke="var(--color-mps)"
              strokeWidth={2.5}
              dot={({ cx, cy, payload }) => {
                if (!payload.completed) return <g key={`dot-${cx}`} />
                const color = payload.isAtRisk
                  ? 'hsl(0 84% 60%)'
                  : payload.mps >= 90
                    ? 'hsl(142 76% 36%)'
                    : 'hsl(45 93% 47%)'
                return (
                  <circle
                    key={`dot-${cx}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                  />
                )
              }}
              connectNulls={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}