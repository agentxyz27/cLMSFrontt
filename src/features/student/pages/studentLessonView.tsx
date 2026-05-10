/**
 * studentLessonView.tsx
 *
 * Node runner engine for student lesson viewing.
 */
import { useParams } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { useLesson } from '../../teacher/hooks/useLesson'
import { useProgress } from '../hooks/useProgress'
import { useLessonRunner } from '../hooks/useLessonRunner'
import LessonReviewMode from '../components/lessonReviewMode'
import LessonCompleteScreen from '../components/lessonCompleteScreen'
import ActiveLessonView from '../components/activeLessonView'

export default function StudentLessonView() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()

  const { data: lesson, loading: lessonLoading, error: lessonError } = useLesson(lessonId, token)
  const { data: progressList, loading: progressLoading, error: progressError } = useProgress(token)
  const runner = useLessonRunner(lesson?.contentJson ?? null, lessonId, token)

  if (lessonLoading || progressLoading) return <div>Loading...</div>
  if (lessonError) return <div>Error: {lessonError}</div>
  if (progressError) return <div>Error: {progressError}</div>
  if (!lesson?.contentJson) return <div>Lesson not found</div>
  if (!runner.currentNode) return <div>No nodes in this lesson.</div>

  const alreadyCompleted = progressList.some(
    p => p.lessonId === Number(lessonId) && p.completed
  )

  if (alreadyCompleted && !runner.lessonDone)
    return (
      <LessonReviewMode
        title={lesson.title}
        graph={lesson.contentJson}
        classroomId={id!}
      />
    )

  if (runner.lessonDone)
    return (
      <LessonCompleteScreen
        completing={runner.completing}
        reward={runner.reward}
        completeError={runner.completeError}
        correctCount={runner.correctCount}
        totalQuizNodes={runner.totalQuizNodes}
        classroomId={id!}
      />
    )

  return (
    <ActiveLessonView
      title={lesson.title}
      graph={lesson.contentJson}
      currentNode={runner.currentNode}
      currentNodeId={runner.currentNodeId!}
      classroomId={id!}

      // legacy multiple choice — kept for quiz nodes without canvas interaction elements
      selectedChoice={null}
      answerFeedback={null}
      onSelectChoice={() => {}}
      onAnswer={() => {}}

      // attempt pipeline
      feedback={runner.feedback}
      hintsUsed={runner.hintsUsed}
      questionFinished={runner.questionFinished}
      submitAnswer={runner.submitAnswer}
      useHint={runner.useHint}
      giveUp={runner.giveUp}

      onNext={runner.goToNode}
    />
  )
}