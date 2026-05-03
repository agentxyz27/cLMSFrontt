/**
 * teacherLessonNew.tsx
 *
 * Three-step flow:
 *   Step 1 — Teacher enters a lesson title
 *   Step 2 — Teacher chooses: blank lesson or use a template
 *   Step 3 — Node-based canvas editor opens
 *
 * Templates are now full LessonGraphs — no wrapping needed.
 * They plug directly into the editor as initial content.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { useTemplates } from '../hooks/useTemplates'
import { useNewLessonFlow } from '../hooks/useNewLessonFlow'
import LessonTitleStep from '../components/lessonTitleStep'
import LessonChooseStep from '../components/lessonChooseStep'
import CanvasEditor from '@/shared/components/editor/main/canvasEditor'
import { extractIdFromSlug } from '@/shared/utils/slugify'

export default function TeacherLessonNew() {
  const { token } = useAuth()
  const { id: rawId } = useParams()
  const id = String(extractIdFromSlug(rawId ?? ''))
  const navigate = useNavigate()

  const flow = useNewLessonFlow(id, token)
  const { data: templates = [], loading: templatesLoading } = useTemplates(
    flow.step === 'choose' ? token : null
  )

  if (flow.step === 'title')
    return (
      <LessonTitleStep
        title={flow.title}
        error={flow.error}
        onTitleChange={flow.setTitle}
        onNext={flow.handleTitleNext}
        onBack={() => navigate(`/teacher/classrooms/${id}`)}
      />
    )

  if (flow.step === 'choose')
    return (
      <LessonChooseStep
        title={flow.title}
        templates={templates}
        templatesLoading={templatesLoading}
        selectedTemplateId={flow.selectedTemplateId}
        creating={flow.creating}
        using={flow.using}
        error={flow.error}
        onBack={flow.goBack}
        onBlank={flow.handleBlankLesson}
        onToggleTemplate={flow.toggleTemplate}
        onUseTemplate={flow.handleUseTemplate}
      />
    )

  return (
    <CanvasEditor
      lessonId={flow.lesson!.id}
      initial={flow.initialContent}
      token={token}
      onDone={() => navigate(`/teacher/classrooms/${id}`)}
    />
  )
}