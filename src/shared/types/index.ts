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
  | DragItemProps
  | DragTargetProps
  | McOptionProps

export type CanvasElementType = 'text' | 'image' | 'shape' | 'drag-item' | 'drag-target' | 'mc-option'

export interface CanvasElement {
  id: string
  type: CanvasElementType
  x: number
  y: number
  rotation: number
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

// ── Drag Match ─────────────────────────────────────────────────────────────

export interface DragItemProps {
  label: string        // text shown on the draggable card
  color: string        // background color of the card
  textColor: string    // label text color
}

export interface DragTargetProps {
  accepts: string      // id of the drag-item that belongs here
  label: string        // label shown inside the drop zone (e.g. "One Half")
  color: string        // border/background color of the drop zone
}

// ── Multiple Choice Option ─────────────────────────────────────────────────
// Teacher places mc-option elements on canvas freely.
// correctIndex is stored at the node level (existing QuizData).
// Each option element has an index that maps to QuizData.correctIndex.

export interface McOptionProps {
  label: string        // choice text
  index: number        // 0-based index — maps to QuizData.correctIndex
  color: string        // background color
  textColor: string    // text color
}

// ── Grade & Section ────────────────────────────────────────────────────────

export interface Grade {
  id: number
  level: number
}

export interface Section {
  id: number
  name: string
}

export interface SectionWithGrade {
  id: number
  name: string
  grade: Grade
}

export interface GradeWithSections {
  id: number
  level: number
  sections: Section[]
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
  section: SectionWithGrade
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
  questionId?: number
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
  topicId: number           // ← add
  difficulty: number        // ← add
  interactionType: string   // ← add
  isPublic: boolean
  usageCount: number
  teacher?: { id: number; name: string } | null
  createdAt: string
  updatedAt: string
}

export interface TemplateSummary {
  id: number
  title: string
  topicId: number
  difficulty: number
  interactionType: string
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

// ── Topic ──────────────────────────────────────────────────────────────────

export interface Topic {
  id: number
  name: string
  subjectId: number
  prerequisiteTopicId: number | null
}

// ── Question ───────────────────────────────────────────────────────────────
// templateType determines which frontend interaction component renders.
// contentJson holds the full question config including answer key and hints.

export type TemplateType = 'DRAG_MATCH' | 'FILL_STEP' | 'VISUAL_GROUPING' | 'NUMBER_LINE'

export interface Question {
  id: number
  lessonId: number
  topicId: number
  templateType: TemplateType
  contentJson: QuestionContent
  order: number
  createdAt: string
  updatedAt: string
  topic?: { id: number; name: string }
  lesson?: { id: number; title: string }
}

export interface QuestionSummary {
  id: number
  lessonId: number
  topicId: number
  templateType: TemplateType
  order: number
  createdAt: string
  topic?: { id: number; name: string }
}

// contentJson shape for each templateType
// Frontend uses this to render the correct interaction component
export interface QuestionContent {
  prompt: string
  hints?: string[]
  // DRAG_MATCH
  items?: { id: string; label: string }[]
  targets?: { id: string; accepts: string }[]
  // FILL_STEP
  steps?: { id: string; text: string; isMissing?: boolean }[]
  answer?: string
  // VISUAL_GROUPING
  groups?: { id: string; label: string }[]
  // NUMBER_LINE
  min?: number
  max?: number
  correctValue?: number
}

export interface ReorderPayload {
  order: { id: number; order: number }[]
}

// ── QuestionAttemptSession ─────────────────────────────────────────────────
// One row per student per question.
// Created when student opens a question (SESSION_STARTED).
// Finalized when SESSION_FINISHED is recorded.

export interface QuestionAttemptSession {
  id: number
  sessionToken: string
  questionId: number
  studentId: number
  attempts: number
  hintsUsed: number
  isSubmitted: boolean
  correct: boolean | null      // null = not finished yet
  startedAt: string
  submittedAt: string | null
  question?: Question
  events?: QuestionAttemptEvent[]
}

// ── QuestionAttemptEvent ───────────────────────────────────────────────────
// Atomic behavioral log — one row per event.
// Immutable after write.

export type AttemptEventType =
  | 'SESSION_STARTED'
  | 'HINT_OPENED'
  | 'ANSWER_CHANGED'
  | 'ATTEMPT_SUBMITTED'
  | 'SESSION_FINISHED'

export interface QuestionAttemptEvent {
  id: number
  sessionId: number
  eventType: AttemptEventType
  stepNumber: number
  payload: Record<string, unknown> | null
  createdAt: string
}

// ── Start / Submit response shapes ────────────────────────────────────────

export interface StartSessionResponse {
  resumed: boolean
  session: QuestionAttemptSession
}

export interface SubmitAnswerResponse {
  message: string
  correct: boolean
  finished: boolean
  attempts?: number
  session: QuestionAttemptSession
}

export interface UseHintResponse {
  message: string
  hintsUsed: number
}

export interface FinishSessionResponse {
  message: string
  correct: boolean
  finished: boolean
  session: QuestionAttemptSession
}

// ── Snapshots ──────────────────────────────────────────────────────────────
// Immutable MPS records computed at lesson completion.

export interface StudentLessonSnapshot {
  id: number
  studentId: number
  lessonId: number
  totalQuestions: number
  correctCount: number
  mps: number              // (correctCount / totalQuestions) * 100
  avgAttempts: number
  avgHintsUsed: number
  isAtRisk: boolean        // mps < 75
  snapshotAt: string
  student?: { id: number; name: string }
}

export interface ClassLessonSnapshot {
  id: number
  classRoomId: number
  lessonId: number
  triggeredById: number | null
  totalStudents: number
  completedCount: number
  avgMps: number
  lowestMps: number
  highestMps: number
  atRiskCount: number
  snapshotAt: string
}

// ── Detection Engine Types ─────────────────────────────────────────────────

export interface AtRiskStudent {
  studentId: number
  name: string
  mps: number
  avgAttempts: number
  avgHintsUsed: number
  snapshotAt: string
}

export interface WeakTopic {
  topicId: number
  topicName: string
  correctRate: number
  avgAttempts: number
  avgHints: number
  totalStudents: number
}

export interface RegressionAlert {
  studentId: number
  name: string
  previousMps: number
  previousLesson: string
  latestMps: number
  latestLesson: string
  drop: number
  snapshotAt: string
}

export interface AtRiskResult {
  total: number
  students: AtRiskStudent[]
}

export interface WeakTopicsResult {
  total: number
  topics: WeakTopic[]
}

export interface RegressionResult {
  total: number
  regressions: RegressionAlert[]
}

export interface DetectionSummary {
  atRisk: AtRiskResult
  weakTopics: WeakTopicsResult
  regression: RegressionResult
}

// ── Focus Engine Types ─────────────────────────────────────────────────────

export type PriorityTier = 'urgent' | 'watch' | 'good'

export interface PriorityStudent {
  studentId: number
  name: string
  mps: number
  avgAttempts: number
  avgHintsUsed: number
  isAtRisk: boolean
  priority: PriorityTier
  snapshotAt: string
}

export interface PriorityList {
  totalStudents: number
  completed: number
  notStarted: number
  urgent: number
  watch: number
  good: number
  students: PriorityStudent[]
}

export interface WeakSpot {
  topicId: number
  topicName: string
  correctRate: number
  avgAttempts: number
  avgHints: number
}

export interface ClassWeakSpots {
  weakSpots: WeakSpot[]
}

export interface DrillDownQuestion {
  questionId: number
  topicId: number
  topicName: string
  templateType: string
  order: number
  correct: boolean | null
  attempts: number
  hintsUsed: number
  startedAt: string
  submittedAt: string | null
}

export interface StudentDrillDown {
  studentId: number
  name: string
  mps: number | null
  isAtRisk: boolean | null
  snapshotAt: string | null
  questions: DrillDownQuestion[]
}

export interface FocusSummary {
  priorityList: PriorityList
  classWeakSpots: ClassWeakSpots
}

// ── Template Engine / Assignment Types ────────────────────────────────────

export type AssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'

export interface AssignedActivity {
  id: number
  studentId: number
  templateId: number
  assignedById: number | null
  sourceTopicId: number | null
  sourceSnapshotId: number | null
  reason: string | null
  status: AssignmentStatus
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  student?: { id: number; name: string }
  template?: { id: number; title: string; difficulty: number; interactionType?: string }
  sourceTopic?: { id: number; name: string }
  assignedBy?: { id: number; name: string }
}

export interface AssignRemediationPayload {
  studentId: number
  snapshotId: number
  topicId: number
  difficulty?: number
  templateId?: number
  reason?: string
  dueDate?: string
}

export interface StudentAssignments {
  studentId: number
  name: string
  total: number
  activities: AssignedActivity[]
}

export interface ClassroomAssignments {
  total: number
  grouped: {
    ASSIGNED: AssignedActivity[]
    IN_PROGRESS: AssignedActivity[]
    COMPLETED: AssignedActivity[]
    ARCHIVED: AssignedActivity[]
  }
  activities: AssignedActivity[]
}

// ── Progress Engine Types ──────────────────────────────────────────────────

export interface StudentProgressPoint {
  lessonId: number
  lessonTitle: string
  mps: number | null
  isAtRisk: boolean | null
  avgAttempts: number | null
  snapshotAt: string | null
  completed: boolean
}

export interface StudentProgressResult {
  studentId: number
  name: string
  improvement: number | null
  trend: StudentProgressPoint[]
}

export interface ClassProgressPoint {
  snapshotId: number
  avgMps: number
  lowestMps: number
  highestMps: number
  atRiskCount: number
  completedCount: number
  totalStudents: number
  triggeredBy: string
  snapshotAt: string
}

export interface ClassProgressResult {
  total: number
  improvement: number
  trend: ClassProgressPoint[]
}

export interface ImprovementEntry {
  studentId: number
  name: string
  originalMps: number
  originalSnapshotAt: string
  remediationDone: boolean
  followUpMps: number | null
  followUpLesson: number | null
  followUpAt: string | null
  mpsDelta?: number
}

export interface ImprovementReport {
  total: number
  improved: ImprovementEntry[]
  noChange: ImprovementEntry[]
  noData: ImprovementEntry[]
}

export interface HeatmapStudentRow {
  studentId: number
  name: string
  scores: {
    lessonId: number
    lessonTitle: string
    mps: number | null
  }[]
}

export interface HeatmapData {
  lessons: { id: number; title: string }[]
  students: HeatmapStudentRow[]
}

