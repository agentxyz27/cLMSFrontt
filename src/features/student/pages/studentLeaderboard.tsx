import { useAuth } from '@/context/authContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import LeaderboardRow from '../components/leaderboardRow'

export default function StudentLeaderboard() {
  const { token, user } = useAuth()
  const { data: leaderboard, loading, error } = useLeaderboard(token)

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
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              isCurrentUser={String(entry.id) === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}