import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'red' | 'green' | 'yellow' | 'blue'
}

const accentMap = {
  red:    'text-red-500',
  green:  'text-emerald-500',
  yellow: 'text-yellow-500',
  blue:   'text-blue-500'
}

export default function StatCard({ label, value, sub, accent = 'blue' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${accentMap[accent]}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}