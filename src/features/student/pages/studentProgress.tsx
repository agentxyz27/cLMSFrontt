import { useAuth } from '@/context/authContext'
import { useProgress } from '../hooks/useProgress'
import ProgressCard from '../components/progressCard'

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
          {progress.map(p => <ProgressCard key={p.id} progress={p} />)}
        </div>
      )}
    </div>
  )
}