import type { StudentBadge } from '../../../shared/types'

interface Props {
  studentBadge: StudentBadge
}

export default function BadgeCard({ studentBadge: sb }: Props) {
  return (
    <div>
      <h3>🏅 {sb.badge.name}</h3>
      <p>{sb.badge.description}</p>
      <p>Required XP: {sb.badge.xpRequired}</p>
      <p>Earned: {new Date(sb.earnedAt).toLocaleDateString()}</p>
    </div>
  )
}