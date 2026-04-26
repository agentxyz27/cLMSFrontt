/**
 * types/index.ts
 *
 * Shared TypeScript types for cLMS frontend.
 * All API response shapes are defined here.
 * Import from here instead of redefining per file.
 *
 * Architecture: Everything is a LessonGraph.
 * CanvasData is a leaf rendering primitive — only inside LessonNode.contentJson.
 *
 * Hierarchy:
 *   LessonGraph (flow logic)
 *    ├── nodes[]
 *    │     └── LessonNode
 *    │            └── CanvasData (visual leaf) ← only here
 *    └── settings
 *
 * Access pattern:
 *   graph  = contentJson             (LessonGraph)
 *   node   = graph.nodes[0]         (LessonNode)
 *   canvas = node.contentJson       (CanvasData)
 *
 * Changes from previous version:
 * - LessonContent removed — replaced by LessonGraph everywhere
 * - Template.contentJson → LessonGraph (was CanvasData)
 * - LessonGraphNodeMap added for efficient graph traversal
 * - CanvasData comment updated — leaf primitive, not "internal only"
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
// CanvasData is a leaf-level rendering primitive.
// Used ONLY inside LessonNode.contentJson — never at top level.

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

/**
 * CanvasData — leaf-level rendering primitive.
 * Lives ONLY inside LessonNode.contentJson.
 * Never pass CanvasData directly to a lesson or template field.
 */
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

// ── Lesson Graph System ────────────────────────────────────────────────────

export type LessonNodeType = 'explanation' | 'example' | 'quiz' | 'hint' | 'result'

export interface QuizData {
  question: string
  choices: string[]
  correctIndex: number
}

/**
 * LessonNode — a single behavior unit in the graph.
 * contentJson holds the CanvasData visual layer for this node.
 */
export interface LessonNode {
  id: string
  type: LessonNodeType
  contentJson: CanvasData
  quiz?: QuizData
  nextNodeId: string | null
  hintNodeId?: string | null
}

export interface LessonSettings {
  passingScore: number
  retryLimit: number | null
  badgeId: number | null
}

/**
 * LessonGraph — unified graph type for both lessons and templates.
 * Rule: If it is learning content, it MUST be a LessonGraph.
 *
 * Lessons  = active LessonGraph instance
 * Templates = frozen LessonGraph snapshot
 */
export interface LessonGraph {
  nodes: LessonNode[]
  settings: LessonSettings
}

/**
 * NodeMap for efficient graph traversal.
 * Use instead of .find() when traversing at runtime.
 *
 * Build with:
 *   const nodeMap = Object.fromEntries(graph.nodes.map(n => [n.id, n]))
 *   const node = nodeMap[someNodeId]
 */
export type LessonGraphNodeMap = Record<string, LessonNode>

// ── Lesson ─────────────────────────────────────────────────────────────────

export interface Lesson {
  id: number
  title: string
  classRoomId: number
  contentJson: LessonGraph | null  // null only when lesson has never been saved
  createdAt: string
  updatedAt: string
}

export interface LessonSummary {
  id: number
  title: string
  classRoomId: number
  contentJson: LessonGraph | null  // null only when lesson has never been saved
  createdAt: string
  updatedAt: string
}

// ── Template ───────────────────────────────────────────────────────────────
// Templates are frozen LessonGraph snapshots.
// contentJson is LessonGraph — never CanvasData.
//
// To render a template preview:
//   const graph = template.contentJson
//   const canvas = graph?.nodes?.[0]?.contentJson
//   <CanvasPreview contentJson={canvas} />

export interface Template {
  id: number
  title: string
  contentJson: LessonGraph        // never null — templates always have content
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