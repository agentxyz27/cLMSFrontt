import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { WeakTopic } from '@/shared/types'

interface Props {
  topics: WeakTopic[]
  title?: string
}

const chartConfig = {
  correctRate: {
    label: 'Correct Rate',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

// Color by correctRate — matches MPS badge color logic
function barColor(rate: number) {
  if (rate >= 90) return 'hsl(142 76% 36%)'  // emerald
  if (rate >= 75) return 'hsl(45 93% 47%)'   // yellow
  return 'hsl(0 84% 60%)'                     // red
}

export function WeakTopicsChart({ topics, title }: Props) {
  if (!topics || topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">No topic data yet.</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = topics.map(t => ({
    name:        t.topicName.length > 12 ? t.topicName.slice(0, 12) + '…' : t.topicName,
    fullName:    t.topicName,
    correctRate: parseFloat(t.correctRate.toFixed(1)),
    avgAttempts: parseFloat(t.avgAttempts.toFixed(1)),
    avgHints:    parseFloat(t.avgHints.toFixed(1)),
    students:    t.totalStudents,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title ?? 'Topic Performance'}</CardTitle>
        <CardDescription>Correct rate per topic — sorted weakest first</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            barSize={32}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
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
              stroke="hsl(0 84% 60%)"
              strokeDasharray="4 4"
              label={{ value: '75%', position: 'right', fontSize: 10, fill: 'hsl(0 84% 60%)' }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
                  formatter={(value, name, props) => [
                    <>
                      <span className="font-medium">{value}% correct</span>
                      <br />
                      <span className="text-muted-foreground text-xs">
                        {props.payload.avgAttempts} avg attempts · {props.payload.avgHints} avg hints
                      </span>
                    </>,
                    ''
                  ]}
                />
              }
            />
            <Bar dataKey="correctRate" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.correctRate)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}