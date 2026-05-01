import CanvasPreview from '../../../shared/components/editor/main/canvasPreview'
import type { Template } from '../../../shared/types'

import { MainCard } from '../../../shared/components/ui/card'
import { Card } from 'pixel-retroui'

interface Props {
  template: Template
  onClick: (template: Template) => void
  isSelected?: boolean
  previewWidth?: number
}

export default function TemplateCard({ template, onClick, isSelected = false, previewWidth = 300 }: Props) {
  const firstNodeCanvas = template.contentJson?.nodes?.[0]?.contentJson
  const height = Math.round(previewWidth * (9 / 16))

  return (
    <MainCard
      onClick={() => onClick(template)}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #eee',
        borderRadius: 8,
        overflow: 'hidden',
        width: previewWidth,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ pointerEvents: 'none' }}>
        {firstNodeCanvas ? (
          <CanvasPreview contentJson={firstNodeCanvas} previewWidth={previewWidth} />
        ) : (
          <div style={{ width: previewWidth, height, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#999' }}>No preview</p>
          </div>
        )}
      </div>
      <Card style={{ padding: '8px 12px' }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>{template.title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>
          By {template.teacher?.name ?? 'Unknown'} · Used {template.usageCount} times
        </p>
      </Card>
    </MainCard>
  )
}