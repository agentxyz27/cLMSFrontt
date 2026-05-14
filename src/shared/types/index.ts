/**
 * types/index.ts
 *
 * Shared TypeScript types for cLMS frontend.
 * All API response shapes are defined here.
 * Import from here instead of redefining per file.
 *
 * Architecture: Everything is a LessonGraph.
 * CanvasData is a leaf rendering primitive — only inside LessonNode.content.
 *
 * Hierarchy:
 *   LessonGraph (instructional flow)
 *    ├── nodes[]
 *    │     └── LessonNode (pedagogical stage)
 *    │            └── CanvasData (visual leaf) ← only here
 *    └── settings
 *
 * Access pattern:
 *   graph       = lesson.contentJson           (LessonGraph)
 *   node        = graph.nodes[0]              (LessonNode)
 *   canvas      = node.content               (CanvasData)
 *   interaction = fetch Question by node.questionId
 *
 * Ownership rules:
 *   LessonGraph  → instructional flow, traversal, settings
 *   LessonNode   → pedagogical stage, visual content, transitions
 *   CanvasData   → visual rendering only — never educational truth
 *   Question     → interaction config, correctness, hints, topic mapping
 *
 * Changes from previous version:
 * - LessonNodeType replaced: explanation/example/quiz/hint/result
 *                        → hook/teach/practice/mastery/reward
 * - LessonNode.contentJson renamed → content
 * - LessonNode.nextNodeId / hintNodeId removed → transitions[]
 * - LessonNode.quiz (QuizData) removed → Question.contentJson owns this
 * - LessonNode.topicId removed → Question.topicId is source of truth
 * - LessonNode.interaction removed → Question.contentJson owns this
 * - LessonGraph.version + startNodeId added
 * - TransitionCondition added as named type
 * - InteractionDefinition kept for runtime hydration use only (not on LessonNode)
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
// Lives ONLY inside LessonNode.content — never at top level.
// Responsible for: rendering, layout, animation, skins.
// NOT responsible for: correctness, pedagogy, topic mapping.

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

// Transitional: drag-item, drag-target, mc-option remain as CanvasElementTypes
// for now. Long-term direction: canvas = visuals only (text/image/shape/sprite).
// Interaction logic will fully migrate into Question.contentJson.
export type CanvasElementProps =
  | TextElementProps
  | ImageElementProps
  | ShapeElementProps
  | DragItemProps
  | DragTargetProps
  | McOptionProps

export type CanvasElementType =
  | 'text'
  | 'image'
  | 'shape'
  | 'drag-item'    // transitional — move to interaction config long-term
  | 'drag-target'  // transitional — move to interaction config long-term
  | 'mc-option'    // transitional — move to interaction config long-term

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
 * Lives ONLY inside LessonNode.content.
 * Never pass CanvasData directly to a lesson or template field.
 */
export interface CanvasData {
  canvas: CanvasConfig
  elements: CanvasElement[]
}

// ── Drag Match ─────────────────────────────────────────────────────────────
// These props live on CanvasElement temporarily.
// Source of truth for correctness is Question.contentJson (DragMatchConfig).

export interface DragItemProps {
  label: string      // text shown on the draggable card
  color: string      // background color of the card
  textColor: string  // label text color
}

export interface DragTargetProps {
  accepts: string    // transitional: correctness ref — will move to interaction config
  label: string      // label shown inside the drop zone
  color: string      // border/background color of the drop zone
}

// ── Multiple Choice Option ─────────────────────────────────────────────────
// Transitional: correctness lives in Question.contentJson (MultipleChoiceConfig).

export interface McOptionProps {
  label: string      // choice text
  index: number      // 0-based index — maps to MultipleChoiceConfig.correctIndex
  color: string      // background color
  textColor: string  // text color
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
// The four layers:
//
//   LessonGraph  = instructional flow container
//   LessonNode   = pedagogical stage (hook / teach / practice / mastery / reward)
//   CanvasData   = visual rendering layer (lives on node.content)
//   Question     = measurable interaction layer (referenced by node.questionId)
//
// Rule: if it measures learning → it belongs to Question, not LessonNode.

/**
 * Pedagogical stage type.
 *
 * | Type     | Role                        | Needs Question? |
 * |----------|-----------------------------|-----------------|
 * | hook     | grab attention, set context | no              |
 * | teach    | deliver new concept         | no              |
 * | practice | guided skill practice       | yes             |
 * | mastery  | independent assessment      | yes             |
 * | reward   | celebrate completion        | no              |
 */
export type LessonNodeType =
  | 'hook'
  | 'teach'
  | 'practice'
  | 'mastery'
  | 'reward'

/**
 * Runtime transition condition.
 * Controls which path the lesson takes after a node resolves.
 */
export type TransitionCondition =
  | 'always'   // hook, teach, reward — unconditional
  | 'passed'   // node score >= passingScore
  | 'failed'   // retries exhausted without passing

/**
 * A single directed edge in the lesson graph.
 * Nodes may have multiple transitions with different conditions.
 */
export interface Transition {
  targetNodeId: string
  condition: TransitionCondition
}

/**
 * Runtime feedback behavior attached to a node.
 * Separate from Question hints — this is the node-level UX response.
 */
export interface FeedbackDefinition {
  correctMessage?: string
  incorrectMessage?: string
  allowRetry?: boolean
  hints?: string[]
}

/**
 * LessonNode — a single pedagogical stage inside the lesson graph.
 *
 * Owns:
 * - instructional role (type)
 * - visual content (content → CanvasData)
 * - runtime transitions (transitions[])
 * - optional feedback UX (feedback)
 * - reference to measurable interaction (questionId → Question)
 *
 * Does NOT own:
 * - interaction correctness logic   → Question.contentJson
 * - answer validation               → Question.contentJson
 * - topic mastery mapping           → Question.topicId
 * - hint content                    → Question.contentJson.hints
 */
export interface LessonNode {
  id: string
  type: LessonNodeType
  title?: string
  passingScore?: number  // overrides LessonSettings.passingScore for this node
  retryLimit?: number    // overrides LessonSettings.retryLimit for this node

  /**
   * References Question DB records for this stage.
   * practice → 1-3 questions (guided, hints allowed)
   * mastery  → 10+ questions (assessment, scored)
   * hook/teach/reward → always empty
   */
  questionIds?: number[]

  /**
   * Visual rendering layer for this node.
   * Contains canvas layout, elements, and background.
   */
  content: CanvasData

  /**
   * Node-level runtime feedback UX.
   * Separate from Question hints.
   */
  feedback?: FeedbackDefinition

  /**
   * Directed edges to other nodes.
   * Resolved by the runtime engine based on condition.
   * Empty array = end of lesson when all conditions exhausted.
   */
  transitions: Transition[]
}

export interface LessonSettings {
  passingScore: number
  retryLimit: number | null
  badgeId: number | null
}

/**
 * LessonGraph — instructional flow container.
 *
 * Owns:
 * - lesson progression structure
 * - pedagogical node sequence
 * - runtime traversal via startNodeId
 * - global lesson settings
 *
 * Does NOT own:
 * - interaction correctness  → Question records
 * - assessment config        → Question.contentJson
 *
 * Rule: Lessons and Templates both use LessonGraph.
 * Templates are frozen LessonGraph snapshots.
 */
export interface LessonGraph {
  version: number
  startNodeId: string
  nodes: LessonNode[]
  settings: LessonSettings
}

/**
 * NodeMap for O(1) graph traversal.
 * Build with:
 *   const nodeMap = Object.fromEntries(graph.nodes.map(n => [n.id, n]))
 *   const node = nodeMap[someNodeId]
 */
export type LessonGraphNodeMap = Record<string, LessonNode>

// ── Interaction (runtime hydration only) ──────────────────────────────────
// These types are NOT stored on LessonNode.
// They represent the hydrated shape of Question.contentJson after fetch.
// Used by the runtime engine and interaction components after loading a Question.
//
// Flow:
//   node.questionId → fetch Question → hydrate InteractionDefinition → render

export type InteractionType =
  | 'drag-match'
  | 'multiple-choice'
  | 'fill-step'
  | 'number-line'

export interface DragMatchConfig {
  items: { id: string; label: string }[]
  targets: { id: string; accepts: string }[]
}

export interface MultipleChoiceConfig {
  question: string
  choices: string[]
  correctIndex: number
}

export interface FillStepConfig {
  steps: { id: string; text: string; isMissing?: boolean }[]
  answer: string
}

export interface NumberLineConfig {
  min: number
  max: number
  correctValue: number
}

export type InteractionConfig =
  | DragMatchConfig
  | MultipleChoiceConfig
  | FillStepConfig
  | NumberLineConfig

/**
 * Hydrated interaction definition.
 * Produced at runtime from Question.contentJson — never stored on LessonNode.
 */
export interface InteractionDefinition {
  type: InteractionType
  config: InteractionConfig
}

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
//   const canvas = graph?.nodes?.[0]?.content
//   <CanvasPreview canvasData={canvas} />

export interface Template {
  id: number
  title: string
  contentJson: LessonGraph  // never null — templates always have content
  topicId: number
  difficulty: number
  interactionType: string
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
// Question is the source of truth for measurable interactions.
// templateType determines which frontend interaction component renders.
// topicId is the authoritative topic tag — do not duplicate on LessonNode.
// contentJson holds the full interaction config including answer key and hints.

export type TemplateType = 'DRAG_MATCH' | 'FILL_STEP' | 'VISUAL_GROUPING' | 'NUMBER_LINE'

export interface Question {
  id: number
  lessonId: number
  topicId: number           // source of truth for topic — never duplicate on LessonNode
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

/**
 * QuestionContent — full interaction config stored in Question.contentJson.
 * This is what InteractionDefinition hydrates from at runtime.
 * Includes: prompt, answer key, hints, interaction-specific fields.
 */
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
  correct: boolean | null  // null = not yet finished
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
  mps: number          // (correctCount / totalQuestions) * 100
  avgAttempts: number
  avgHintsUsed: number
  isAtRisk: boolean    // mps < 75 (DepEd mastery threshold)
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