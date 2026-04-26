import { api } from './api'
import type { Progress, StudentBadge } from '../types'

interface LeaderboardEntry {
  id: number
  name: string
  xp: number
  level: number
}

interface CompleteResponse {
  message: string
  xpEarned: number
  totalXP: number
  level: number
  newBadges: { id: number; name: string; description: string }[]
}

export const progressApi = {
  getMyProgress: (token: string) =>
    api.get<Progress[]>('/progress', token),

  completeLesson: (data: { lessonId: number; score: number }, token: string) =>
    api.post<CompleteResponse>('/gamification/complete', data, token),

  getMyBadges: (token: string) =>
    api.get<StudentBadge[]>('/gamification/badges', token),

  getLeaderboard: (token: string) =>
    api.get<LeaderboardEntry[]>('/gamification/leaderboard', token),
}