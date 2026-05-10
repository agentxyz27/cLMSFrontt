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

export interface ClassroomHealth {
  classHealthScore:  number | null
  atRiskCount:       number
  atRiskRate:        number
  totalStudents:     number
  totalLessons:      number
  mpsTrend:          LessonTrend[]
  worstLesson:       LessonTrend | null
  bestLesson:        LessonTrend | null
  studentHealthList: StudentHealth[]
  _cached:           boolean
  _computedAt:       string
}

export const fetchClassroomHealth = (classRoomId: number, token: string) =>
  api.get<ClassroomHealth>(`/classroom-health/${classRoomId}`, token)