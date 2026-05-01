import { useAuth } from '../../../context/authContext'
import { useTemplates } from '../hooks/useTemplates'
import { useClassRooms } from '../hooks/useClassRooms'
import { useTemplatePreview } from '../hooks/useTemplatePreview'
import TemplateCard from '../components/templateCard'
import TemplatePreviewModal from '../components/templatePreviewModal'

export default function TeacherTemplateBrowser() {
  const { token } = useAuth()
  const { data: templates = [], loading, error } = useTemplates(token)
  const { data: classRooms = [] } = useClassRooms(token)
  const preview = useTemplatePreview(token)

  if (loading) return <div>Loading templates...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Template Library</h1>
      <p>Browse publicly available templates. Click any card to preview.</p>

      {templates.length === 0 ? (
        <p>No public templates available yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} onClick={preview.openPreview} />
          ))}
        </div>
      )}

      {(preview.selected || preview.previewLoading) && (
        <TemplatePreviewModal
          {...preview}
          classRooms={classRooms}
          onUse={preview.handleUse}
          onClose={preview.closePreview}
        />
      )}
    </div>
  )
}