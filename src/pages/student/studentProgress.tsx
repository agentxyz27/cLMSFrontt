import { useAuth } from '../../context/authContext'
import { useProgress } from '../../hooks/useProgress'

export default function StudentProgress() {
  const { token } = useAuth()
  const { data: progress, loading, error } = useProgress(token)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalXP = progress.reduce((sum, p) => sum + p.xpEarned, 0)
  const completedCount = progress.filter(p => p.completed).length

  return (
    <div>
      <h1>My Progress</h1>
      <div>
        <p>Total XP: {totalXP}</p>
        <p>Lessons Completed: {completedCount}</p>
      </div>
      {progress.length === 0 ? (
        <p>No progress yet. Start a lesson!</p>
      ) : (
        <div>
          {progress.map(p => (
            <div key={p.id}>
              <h3>{p.lesson.title}</h3>
              <p>Subject: {p.lesson.classRoom.subject.name}</p>
              <p>Status: {p.completed ? '✅ Completed' : '☐ Not completed'}</p>
              <p>XP Earned: {p.xpEarned}</p>
              {p.score !== null && <p>Score: {p.score}%</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}