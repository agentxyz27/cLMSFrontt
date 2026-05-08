import { Badge } from '@/components/ui/badge'

interface MpsBadgeProps {
  mps: number
}

export default function MpsBadge({ mps }: MpsBadgeProps) {
  if (mps >= 90) return <Badge className="bg-emerald-500 text-white">{mps.toFixed(1)}%</Badge>
  if (mps >= 75) return <Badge className="bg-yellow-500 text-white">{mps.toFixed(1)}%</Badge>
  return <Badge className="bg-red-500 text-white">{mps.toFixed(1)}%</Badge>
}