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

// ── Block Types ────────────────────────────────────────────────────────────

/**
 * Union type of all possible block data shapes.
 * Shape depends on the block's type field.
 */
export type BlockData =
  | { html: string }                                          // text
  | { url: string; alt: string }                             // image
  | { url: string; title: string }                           // video
  | { url: string; name: string; fileType: string }          // file
  | { expression: string }                                   // math

export type BlockType = 'text' | 'image' | 'video' | 'file' | 'math'

export interface LessonBlock {
  id: number
  lessonId: number
  order: number
  type: BlockType
  data: BlockData
  createdAt: string
}

// ── Lesson ─────────────────────────────────────────────────────────────────

export interface Lesson {
  id: number
  title: string
  // content removed — replaced by blocks[]
  subjectId: number
  blocks: LessonBlock[] // ordered list of content blocks
  createdAt: string
}

// ── Subject ────────────────────────────────────────────────────────────────

export interface Subject {
  id: number
  title: string
  teacherId: number
  teacher: Teacher
  lessons: Lesson[]
  createdAt: string
}

// ── Progress ───────────────────────────────────────────────────────────────

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

// ── Gamification ───────────────────────────────────────────────────────────

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