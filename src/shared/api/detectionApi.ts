import { api } from './api'
import type {
  DetectionSummary,
  AtRiskResult,
  WeakTopicsResult,
  RegressionResult,
} from '../types'

export const detectionApi = {
  // All three combined — single call for the dashboard detection panel
  getClassSummary: (classRoomId: number, lessonId: number, token: string) =>
    api.get<DetectionSummary>(
      `/detection/${classRoomId}/${lessonId}/summary`,
      token
    ),

  // Students with isAtRisk = true — sorted weakest first
  getAtRiskStudents: (classRoomId: number, lessonId: number, token: string) =>
    api.get<AtRiskResult>(
      `/detection/${classRoomId}/${lessonId}/at-risk`,
      token
    ),

  // Topics ranked by correctRate ascending — weakest topic first
  getWeakTopics: (classRoomId: number, lessonId: number, token: string) =>
    api.get<WeakTopicsResult>(
      `/detection/${classRoomId}/${lessonId}/weak-topics`,
      token
    ),

  // Students whose MPS dropped between last two snapshots
  getRegressionAlerts: (classRoomId: number, lessonId: number, token: string) =>
    api.get<RegressionResult>(
      `/detection/${classRoomId}/${lessonId}/regression`,
      token
    ),
}