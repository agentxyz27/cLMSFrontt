import { useTemplateEngine } from '../../hooks/useTemplateEngine'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  classRoomId: number
  token: string
}

const statusColor = {
  ASSIGNED:    'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED:   'bg-emerald-100 text-emerald-700',
  ARCHIVED:    'bg-gray-100 text-gray-500'
}

export default function AssignmentsTab({ classRoomId, token }: Props) {
  const { assignments, loading } = useTemplateEngine(classRoomId, token)

  if (loading) return <Skeleton className="h-40 w-full" />

  if (!assignments || assignments.total === 0) return (
    <p className="text-sm text-muted-foreground">No remediation assigned yet.</p>
  )

  return (
    <div className="space-y-2">
      {assignments.activities.map(a => (
        <div
          key={a.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div>
            <p className="font-medium text-sm">{a.student?.name}</p>
            <p className="text-xs text-muted-foreground">
              {a.sourceTopic?.name} · {a.template?.title}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[a.status]}`}>
            {a.status.replace('_', ' ')}
          </span>
        </div>
      ))}
    </div>
  )
}