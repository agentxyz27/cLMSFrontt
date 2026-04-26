import { useAuth } from '../../context/authContext'
import { useLeaderboard } from '../../hooks/useLeaderboard'

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
            <div key={entry.id} style={{ fontWeight: String(entry.id) === user?.id ? 'bold' : 'normal' }}>
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