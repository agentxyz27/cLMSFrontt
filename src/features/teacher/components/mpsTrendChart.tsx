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
import type { ClassProgressResult } from '@/shared/types'

interface Props {
  data: ClassProgressResult
  lessonTitle?: string
}

const chartConfig = {
  avgMps: {
    label: 'Class MPS',
    color: 'var(--primary)',
  },
  lowestMps: {
    label: 'Lowest',
    color: 'var(--destructive)',
  },
  highestMps: {
    label: 'Highest',
    color: 'hsl(142 76% 36%)',
  },
} satisfies ChartConfig

export function MpsTrendChart({ data, lessonTitle }: Props) {
  if (!data || data.trend.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">
            No trend data yet. Generate multiple reports over time.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.trend.map((point, i) => ({
    label:     `Report ${i + 1}`,
    date:      new Date(point.snapshotAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avgMps:    parseFloat(point.avgMps.toFixed(1)),
    lowestMps: parseFloat(point.lowestMps.toFixed(1)),
    highestMps: parseFloat(point.highestMps.toFixed(1)),
    atRisk:    point.atRiskCount,
    completed: point.completedCount,
  }))

  const improved = data.improvement > 0
  const unchanged = data.improvement === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Class MPS Trend</CardTitle>
            {lessonTitle && (
              <CardDescription>{lessonTitle}</CardDescription>
            )}
          </div>
          {data.trend.length >= 2 && (
            <Badge className={
              improved ? 'bg-emerald-500 text-white' :
              unchanged ? 'bg-muted text-muted-foreground' :
              'bg-red-500 text-white'
            }>
              {improved ? '+' : ''}{data.improvement.toFixed(1)} pts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
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
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                  formatter={(value, name) => [
                    `${value}%`,
                    chartConfig[name as keyof typeof chartConfig]?.label ?? name
                  ]}
                />
              }
            />
            <Line
              dataKey="highestMps"
              stroke="var(--color-highestMps)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              dataKey="avgMps"
              stroke="var(--color-avgMps)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-avgMps)' }}
              activeDot={{ r: 6 }}
            />
            <Line
              dataKey="lowestMps"
              stroke="var(--color-lowestMps)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-emerald-500" /> Highest
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-primary" /> Avg MPS
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-destructive" /> Lowest
          </span>
        </div>
      </CardContent>
    </Card>
  )
}