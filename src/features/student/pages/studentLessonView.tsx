import { useParams } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { useLesson } from '../../teacher/hooks/useLesson'
import { useProgress } from '../hooks/useProgress'
import { useLessonRunner } from '../hooks/useLessonRunner'
import { normalizeLessonGraph } from '@/shared/utils/normalizeLessonGraph'
import LessonReviewMode from '../components/lessonReviewMode'
import LessonCompleteScreen from '../components/lessonCompleteScreen'
import ActiveLessonView from '../components/activeLessonView'

export default function StudentLessonView() {
  const { token } = useAuth()
  const { id, lessonId } = useParams()

  const { data: lesson, loading: lessonLoading, error: lessonError } = useLesson(lessonId, token)
  const { data: progressList, loading: progressLoading, error: progressError } = useProgress(token)

  const graph = lesson?.contentJson ? normalizeLessonGraph(lesson.contentJson) : null
  const runner = useLessonRunner(graph, lessonId, token)

  if (lessonLoading || progressLoading) return <div>Loading...</div>
  if (lessonError)   return <div>Error: {lessonError}</div>
  if (progressError) return <div>Error: {progressError}</div>
  if (!graph)        return <div>Lesson not found</div>
  if (!runner.currentNode) return <div>No nodes in this lesson.</div>

  const alreadyCompleted = progressList.some(
    p => p.lessonId === Number(lessonId) && p.completed
  )

  if (alreadyCompleted && !runner.lessonDone)
    return (
      <LessonReviewMode
        title={lesson!.title}
        graph={graph}
        classroomId={id!}
      />
    )

  if (runner.lessonDone)
    return (
      <LessonCompleteScreen
        completing={runner.completing}
        reward={runner.reward}
        completeError={runner.completeError}
        correctCount={runner.lessonCorrectCount}
        totalQuestions={runner.lessonTotalQuestions}
        classroomId={id!}
      />
    )

  return (
    <ActiveLessonView
      title={lesson!.title}
      graph={graph}
      currentNode={runner.currentNode}
      currentNodeId={runner.currentNodeId!}
      classroomId={id!}

      isInteractiveNode={runner.isInteractiveNode}
      currentQuestionId={runner.currentQuestionId}
      questionIndex={runner.questionIndex}
      nodeQuestionCount={runner.nodeQuestionCount}
      nodeCorrectCount={runner.nodeCorrectCount}
      nodeRetries={runner.nodeRetries}

      feedback={runner.feedback}
      hintsUsed={runner.hintsUsed}
      attempts={runner.attempts}
      questionFinished={runner.questionFinished}
      attemptLoading={runner.attemptLoading}
      attemptError={runner.attemptError}

      submitAnswer={runner.submitAnswer}
      useHint={runner.useHint}
      giveUp={runner.giveUp}
      advanceQuestion={runner.advanceQuestion}
      advanceAlways={runner.advanceAlways}
    />
  )
}