/**
 * types/index.ts
 *
 * Shared TypeScript types for cLMS frontend.
 * All API response shapes are defined here.
 * Import from here instead of redefining per file.
 */

export interface Teacher {
  id: number
  name: string
}

export interface Lesson {
  id: number
  title: string
  content: string
  subjectId: number
  createdAt: string
}

export interface Subject {
  id: number
  title: string
  teacherId: number
  teacher: Teacher
  lessons: Lesson[]
  createdAt: string
}

export interface Progress {
  id: number
  studentId: number
  lessonId: number
  completed: boolean
  score: number | null
  xpEarned: number
  createdAt: string
  lesson: {
    id: number
    title: string
    subject: Subject
  }
}

export interface Badge {
  id: number
  name: string
  description: string
  xpRequired: number
}

export interface StudentBadge {
  id: number
  badgeId: number
  studentId: number
  earnedAt: string
  badge: Badge
}