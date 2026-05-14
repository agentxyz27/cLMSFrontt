import { useNavigate } from 'react-router-dom'

interface CompleteResponse {
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

interface Props {
  completing: boolean
  reward: CompleteResponse | null
  completeError: string | null
  correctCount: number
  totalQuestions: number  // ← renamed
  classroomId: string
}

export default function LessonCompleteScreen({ completing, reward, completeError, correctCount, totalQuestions, classroomId }: Props) {
  const navigate = useNavigate()

  return (
    <div>
      <h1>🎉 Lesson Complete!</h1>
      {completing ? <p>Saving your progress...</p> : reward ? (
        <div>
          <p>+{reward.xpEarned} XP earned!</p>
          <p>Total XP: {reward.totalXP}</p>
          <p>Level: {reward.level}</p>
          {totalQuestions > 0 && (
            <p>Score: {Math.round((correctCount / totalQuestions) * 100)}%</p>
          )}
          {reward.newBadges.length > 0 && (
            <div>
              <p>🏅 New badges:</p>
              {reward.newBadges.map(badge => (
                <div key={badge.id}><strong>{badge.name}</strong> — {badge.description}</div>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {completeError && <p style={{ color: 'red' }}>{completeError}</p>}
      <button onClick={() => navigate(`/student/classrooms/${classroomId}`)}>← Back to classroom</button>
    </div>
  )
}
