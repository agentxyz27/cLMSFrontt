import TemplateCard from './templateCard'
import type { Template } from '@/shared/types'

interface Props {
  title: string
  templates: Template[]
  templatesLoading: boolean
  selectedTemplateId: number | null
  creating: boolean
  using: boolean
  error: string | null
  onBack: () => void
  onBlank: () => void
  onToggleTemplate: (id: number) => void
  onUseTemplate: (template: Template) => void
}

export default function LessonChooseStep({
  title, templates, templatesLoading,
  selectedTemplateId, creating, using, error,
  onBack, onBlank, onToggleTemplate, onUseTemplate
}: Props) {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) ?? null

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>Choose a starting point</h1>
      <p>Creating: <strong>{title}</strong></p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginBottom: 24 }}>
        <button onClick={onBlank} disabled={creating}>
          {creating ? 'Creating...' : '+ Start with blank lesson'}
        </button>
      </div>

      <h2>Or choose a template</h2>
      {templatesLoading ? (
        <p>Loading templates...</p>
      ) : templates.length === 0 ? (
        <p>No public templates available yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={t => onToggleTemplate(t.id)}
              isSelected={selectedTemplateId === template.id}
              previewWidth={260}
            />
          ))}
        </div>
      )}

      {selectedTemplate && (
        <div style={{ marginTop: 24 }}>
          <p>Using: <strong>{selectedTemplate.title}</strong></p>
          <button onClick={() => onUseTemplate(selectedTemplate)} disabled={using}>
            {using ? 'Creating...' : 'Use this template →'}
          </button>
        </div>
      )}
    </div>
  )
}