import type { Progress } from '../../../shared/types'

interface Props {
  progress: Progress
}

export default function ProgressCard({ progress: p }: Props) {
  return (
    <div>
      <h3>{p.lesson.title}</h3>
      <p>Subject: {p.lesson.classRoom.subject.name}</p>
      <p>Status: {p.completed ? '✅ Completed' : '☐ Not completed'}</p>
      <p>XP Earned: {p.xpEarned}</p>
      {p.score !== null && <p>Score: {p.score}%</p>}
    </div>
  )
}