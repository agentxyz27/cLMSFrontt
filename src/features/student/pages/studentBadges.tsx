import { useAuth } from '@/context/authContext'
import { useBadges } from '../hooks/useBadges'
import BadgeCard from '../components/badgeCard'

export default function StudentBadges() {
  const { token } = useAuth()
  const { data: badges, loading, error } = useBadges(token)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>My Badges</h1>
      {badges.length === 0 ? (
        <p>No badges earned yet. Complete lessons to earn badges!</p>
      ) : (
        <div>
          {badges.map(sb => <BadgeCard key={sb.id} studentBadge={sb} />)}
        </div>
      )}
    </div>
  )
}