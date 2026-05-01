interface Entry {
  id: number
  name: string
  level: number
  xp: number
}

interface Props {
  entry: Entry
  rank: number
  isCurrentUser: boolean
}

export default function LeaderboardRow({ entry, rank, isCurrentUser }: Props) {
  return (
    <div style={{ fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
      <span>#{rank}</span>
      <span>{entry.name}</span>
      <span>Level {entry.level}</span>
      <span>{entry.xp} XP</span>
      {isCurrentUser && <span>← You</span>}
    </div>
  )
}