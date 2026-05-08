import { api } from './api'
import type {
  StudentProgressResult,
  ClassProgressResult,
  ImprovementReport,
  HeatmapData,
} from '../types'

export const progressEngineApi = {
  // MPS over time for a single student — feeds student line chart
  getStudentProgress: (classRoomId: number, studentId: number, token: string) =>
    api.get<StudentProgressResult>(
      `/progress-engine/${classRoomId}/student/${studentId}`,
      token
    ),

  // Class avgMps over time — feeds class line chart
  getClassProgress: (classRoomId: number, lessonId: number, token: string) =>
    api.get<ClassProgressResult>(
      `/progress-engine/${classRoomId}/${lessonId}/class`,
      token
    ),

  // Before/after remediation comparison — did it work?
  getImprovementReport: (classRoomId: number, lessonId: number, token: string) =>
    api.get<ImprovementReport>(
      `/progress-engine/${classRoomId}/${lessonId}/improvement`,
      token
    ),

  // Student × lesson MPS grid — feeds heatmap chart
  getHeatmap: (classRoomId: number, token: string) =>
    api.get<HeatmapData>(
      `/progress-engine/${classRoomId}/heatmap`,
      token
    ),
}