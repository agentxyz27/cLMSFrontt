import { api } from './api'
import type { StudentLessonSnapshot, ClassLessonSnapshot } from '../types'

export const snapshotApi = {
  // Teacher triggers "Generate Report" — writes ClassLessonSnapshot
  generateReport: (classRoomId: number, lessonId: number, token: string) =>
    api.post<{ message: string; snapshot: ClassLessonSnapshot }>(
      `/snapshots/${classRoomId}/${lessonId}`,
      {},
      token
    ),

  // Get all StudentLessonSnapshots for classroom + lesson
  // Feeds Detection Engine, Focus Engine, heatmap, scatter, bar ranking
  getStudentSnapshots: (classRoomId: number, lessonId: number, token: string) =>
    api.get<StudentLessonSnapshot[]>(
      `/snapshots/${classRoomId}/${lessonId}/students`,
      token
    ),

  // Get all ClassLessonSnapshots over time — feeds Progress Engine line chart
  getClassSnapshots: (classRoomId: number, lessonId: number, token: string) =>
    api.get<ClassLessonSnapshot[]>(
      `/snapshots/${classRoomId}/${lessonId}/class`,
      token
    ),

  // Get most recent ClassLessonSnapshot — feeds dashboard stat cards
  getLatestSnapshot: (classRoomId: number, lessonId: number, token: string) =>
    api.get<ClassLessonSnapshot>(
      `/snapshots/${classRoomId}/${lessonId}/latest`,
      token
    ),
}