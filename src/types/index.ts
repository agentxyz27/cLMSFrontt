/**
 * types/index.ts
 *
 * Shared TypeScript types for cLMS frontend.
 * All API response shapes are defined here.
 * Import from here instead of redefining per file.
 *
 * Changes from previous version:
 * - BlockData, BlockType, LessonBlock removed — block system replaced by canvas JSON
 * - Lesson.blocks removed, Lesson.contentJson and Lesson.updatedAt added
 * - CanvasElement, CanvasData added — canvas JSON shape
 * - Template added — reusable canvas layouts
 * - Subject removed — replaced by ClassRoom
 * - Lesson.subjectId → classRoomId
 * - Admin references removed — admin is now a privilege flag on Teacher
 * - Progress.lesson.subject → classRoom
 * - LessonNode, QuizData, LessonSettings, LessonContent added — node graph system
 * - Lesson.contentJson → LessonContent (node graph) instead of raw CanvasData
 */

// ── Primitives ─────────────────────────────────────────────────────────────

export interface Teacher {
  id: number
  name: string
  isAdmin?: boolean
}

export interface Student {
  id: number
  name: string
  email: string
  lrn: string
  xp: number
  level: number
  sectionId: number
}

// ── Canvas Types ───────────────────────────────────────────────────────────

export interface TextElementProps {
  text: string
  fontSize: number
  color: string
  fontStyle?: 'normal' | 'bold' | 'italic'
  align?: 'left' | 'center' | 'right'
}

export interface ImageElementProps {
  url: string
  alt: string
}

export interface ShapeElementProps {
  fill: string
  stroke: string
  strokeWidth: number
  shape: 'rect' | 'ellipse'
}

export type CanvasElementProps =
  | TextElementProps
  | ImageElementProps
  | ShapeElementProps

export type CanvasElementType = 'text' | 'image' | 'shape'

export interface CanvasElement {
  id: string
  type: CanvasElementType
  x: number
  y: number
  width: number
  height: number
  props: CanvasElementProps
}

export interface CanvasConfig {
  width: number
  height: number
  background: string
  backgroundImage?: string
}

export interface CanvasData {
  canvas: CanvasConfig
  elements: CanvasElement[]
}

// ── Grade & Section ────────────────────────────────────────────────────────

export interface Grade {
  id: number
  level: number
}

export interface Section {
  id: number
  name: string
  grade: Grade
}

// ── Subject ────────────────────────────────────────────────────────────────

export interface Subject {
  id: number
  name: string
  description: string
  isLocked: boolean
}

// ── ClassRoom ──────────────────────────────────────────────────────────────

export interface ClassRoom {
  id: number
  teacherId: number
  subjectId: number
  sectionId: number
  createdAt: string
  subject: Subject
  section: Section
  teacher?: Teacher
  lessons?: LessonSummary[]
  _count?: { lessons: number }
}

// ── Lesson Node System ─────────────────────────────────────────────────────

/**
 * Node types:
 *   explanation → teach a concept (canvas only)
 *   example     → show a solved problem (canvas only)
 *   quiz        → MCQ question with correct answer
 *   hint        → shown when student answers wrong
 *   result      → end of lesson, completion trigger
 */
export type LessonNodeType = 'explanation' | 'example' | 'quiz' | 'hint' | 'result'

/**
 * Quiz data — only present on quiz nodes.
 */
export interface QuizData {
  question: string
  choices: string[]
  correctIndex: number  // index into choices array
}

/**
 * A single node in the lesson graph.
 * contentJson is the free-form canvas — teacher designs how it looks.
 * nextNodeId — where to go by default (correct answer or end of node)
 * hintNodeId — where to go on wrong answer (quiz nodes only)
 */
export interface LessonNode {
  id: string                    // e.g. 'node_1'
  type: LessonNodeType
  contentJson: CanvasData       // free-form canvas for this node
  quiz?: QuizData               // only present on quiz nodes
  nextNodeId: string | null     // null = end of lesson
  hintNodeId?: string | null    // only for quiz nodes
}

/**
 * Lesson-level settings.
 */
export interface LessonSettings {
  passingScore: number          // percentage e.g. 70
  retryLimit: number | null     // null = unlimited retries
  badgeId: number | null        // badge awarded on completion
}

/**
 * Full lesson content stored in Lesson.contentJson.
 * Replaces the old single CanvasData shape.
 */
export interface LessonContent {
  nodes: LessonNode[]
  settings: LessonSettings
}

// ── Lesson ─────────────────────────────────────────────────────────────────

export interface Lesson {
  id: number
  title: string
  classRoomId: number
  contentJson: LessonContent | null
  createdAt: string
  updatedAt: string
}

export interface LessonSummary {
  id: number
  title: string
  classRoomId: number
  contentJson: LessonContent | null
  createdAt: string
  updatedAt: string
}

// ── Template ───────────────────────────────────────────────────────────────

/**
 * Templates still use raw CanvasData — they are single canvas layouts,
 * not full lesson node graphs. A template can be used as the contentJson
 * of a single node inside a lesson.
 */
export interface Template {
  id: number
  title: string
  contentJson: CanvasData
  isPublic: boolean
  usageCount: number
  teacher?: { id: number; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface TemplateSummary {
  id: number
  title: string
  isPublic: boolean
  usageCount: number
  teacher?: { id: number; name: string } | null
  createdAt: string
  updatedAt: string
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
    classRoom: {
      subject: Subject
      section: Section
    }
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