import { api } from './api'

export interface StudentHealth {
  studentId:        number
  name:             string
  avgMps:           number
  isAtRisk:         boolean
  lessonsCompleted: number
}

export interface LessonTrend {
  lessonId:   number
  title:      string
  avgMps:     number
  snapshotAt: string
}

export interface TopicHealth {
  topicId:     number
  topicName:   string
  correctRate: number
  avgAttempts: number
  avgHints:    number
}

export interface ClassroomHealth {
  classHealthScore:  number | null
  atRiskCount:       number
  atRiskRate:        number
  totalStudents:     number
  totalLessons:      number
  mpsTrend:          LessonTrend[]
  weakestTopic:      TopicHealth | null
  strongestTopic:    TopicHealth | null
  topicHealth:       TopicHealth[]
  studentHealthList: StudentHealth[]
  _cached:           boolean
  _computedAt:       string
}

export const fetchClassroomHealth = (classRoomId: number, token: string) =>
  api.get<ClassroomHealth>(`/classroom-health/${classRoomId}`, token)

export type TrendRange = '24h' | '3days' | '1week' | '1month' | '4months'

export interface TrendPoint {
  label:         string
  avgMps:        number
  snapshotCount: number
}

export interface ClassroomTrend {
  range:  TrendRange
  points: TrendPoint[]
}

export const fetchClassroomTrend = (classRoomId: number, range: TrendRange, token: string) =>
  api.get<ClassroomTrend>(`/classroom-health/${classRoomId}/trend?range=${range}`, token)