import { api } from './api'
import type {
  FocusSummary,
  PriorityList,
  ClassWeakSpots,
  StudentDrillDown,
} from '../types'

export const focusApi = {
  // Priority list + weak spots combined — single dashboard call
  getFocusSummary: (classRoomId: number, lessonId: number, token: string) =>
    api.get<FocusSummary>(
      `/focus/${classRoomId}/${lessonId}/summary`,
      token
    ),

  // Students ranked by urgency — urgent → watch → good
  getPriorityList: (classRoomId: number, lessonId: number, token: string) =>
    api.get<PriorityList>(
      `/focus/${classRoomId}/${lessonId}/priority`,
      token
    ),

  // Top 3 weakest topics for the class
  getClassWeakSpots: (classRoomId: number, lessonId: number, token: string) =>
    api.get<ClassWeakSpots>(
      `/focus/${classRoomId}/${lessonId}/weak-spots`,
      token
    ),

  // Per-question breakdown for a single student
  getStudentDrillDown: (
    classRoomId: number,
    lessonId: number,
    studentId: number,
    token: string
  ) =>
    api.get<StudentDrillDown>(
      `/focus/${classRoomId}/${lessonId}/student/${studentId}`,
      token
    ),
}