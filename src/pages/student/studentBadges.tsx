import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'
import type { StudentBadge } from '../../types'

export default function StudentBadges() {
  const { token, loading: authLoading } = useAuth()

  const [badges, setBadges] = useState<StudentBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !token) return

    async function fetchData() {
      try {
        const res = await api.get<StudentBadge[]>('/gamification/badges', token)
        setBadges(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load badges')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, authLoading])

  if (authLoading || loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>My Badges</h1>
      {badges.length === 0 ? (
        <p>No badges earned yet. Complete lessons to earn badges!</p>
      ) : (
        <div>
          {badges.map(sb => (
            <div key={sb.id}>
              <h3>🏅 {sb.badge.name}</h3>
              <p>{sb.badge.description}</p>
              <p>Required XP: {sb.badge.xpRequired}</p>
              <p>Earned: {new Date(sb.earnedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}