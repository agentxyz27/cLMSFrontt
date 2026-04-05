/**
 * studentLeaderboard.tsx
 *
 * Shows the top 10 students ranked by XP.
 * Motivates students by showing their standing relative to peers.
 *
 * Endpoints:
 *   GET /api/gamification/leaderboard → top 10 students by XP
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

interface LeaderboardEntry {
  id: number
  name: string
  xp: number
  level: number
}

export default function StudentLeaderboard() {
  const { token, user } = useAuth()

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get<LeaderboardEntry[]>('/gamification/leaderboard', token)
        setLeaderboard(res)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>🏆 Leaderboard</h1>
      <p>Top 10 students ranked by XP</p>

      {leaderboard.length === 0 ? (
        <p>No students yet.</p>
      ) : (
        <div>
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              style={{
                // Highlight the logged-in student's row
                fontWeight: String(entry.id) === user?.id ? 'bold' : 'normal'
              }}
            >
              <span>#{index + 1}</span>
              <span>{entry.name}</span>
              <span>Level {entry.level}</span>
              <span>{entry.xp} XP</span>
              {String(entry.id) === user?.id && <span>← You</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}