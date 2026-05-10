import { useState, useEffect } from 'react'
import { useTemplateEngine } from '../hooks/useTemplateEngine'
import { templateEngineApi } from '@/shared/api/templateEngineApi'
import MpsBadge from '@/shared/components/mpsBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PriorityStudent,
  StudentLessonSnapshot,
  Template,
  AssignRemediationPayload
} from '@/shared/types'

interface Props {
  student: PriorityStudent
  snapshot: StudentLessonSnapshot | null
  classRoomId: number
  token: string
  onClose: () => void
  onAssigned: () => void
}

export default function AssignRemediationModal({
  student,
  snapshot,
  classRoomId,
  token,
  onClose,
  onAssigned
}: Props) {
  const { assign, assigning, error } = useTemplateEngine(classRoomId, token)

  const [selectedTopicId, setSelectedTopicId]   = useState<number | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1)
  const [templates, setTemplates]               = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [reason, setReason]                     = useState('')
  const [success, setSuccess]                   = useState(false)

  // Weak topics from drill down — for now we surface all topics from the snapshot
  // Teacher picks which topic to remediate
  const weakTopics = snapshot ? [
    // placeholder — ideally passed from drillDown questions
    // for now use topicId from snapshot context
  ] : []

  // Fetch templates when topic or difficulty changes
  useEffect(() => {
    if (!selectedTopicId || !token) return
    setTemplatesLoading(true)
    setSelectedTemplateId(null)
    templateEngineApi.getTemplatesByTopic(selectedTopicId, token)
      .then(res => setTemplates(res.templates))
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false))
  }, [selectedTopicId, token])

  const handleAssign = async () => {
    if (!snapshot || !selectedTopicId) return

    const payload: AssignRemediationPayload = {
      studentId:  student.studentId,
      snapshotId: snapshot.id,
      topicId:    selectedTopicId,
      difficulty: selectedDifficulty,
      ...(selectedTemplateId && { templateId: selectedTemplateId }),
      ...(reason.trim() && { reason: reason.trim() })
    }

    const result = await assign(payload)
    if (result) {
      setSuccess(true)
      setTimeout(() => {
        onAssigned()
        onClose()
      }, 1200)
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border space-y-4 p-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-base">Assign Remediation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              This will create an activity for the student to complete.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <Separator />

        {/* Student info */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
          <div>
            <p className="font-medium text-sm">{student.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{student.priority} priority</p>
          </div>
          <MpsBadge mps={student.mps} />
        </div>

        {/* Topic picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Topic to Remediate
          </label>
          <Select onValueChange={val => setSelectedTopicId(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic..." />
            </SelectTrigger>
            <SelectContent>
              {/* Math topics — seeded in DB */}
              {[
                'Addition', 'Subtraction', 'Multiplication', 'Division',
                'Fractions', 'Decimals', 'Geometry', 'Measurement',
                'Word Problems', 'Patterns', 'Place Value', 'Time',
                'Money', 'Data and Graphs'
              ].map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Difficulty
          </label>
          <Select
            defaultValue="1"
            onValueChange={val => setSelectedDifficulty(Number(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 — Easiest</SelectItem>
              <SelectItem value="2">2 — Easy</SelectItem>
              <SelectItem value="3">3 — Medium</SelectItem>
              <SelectItem value="4">4 — Hard</SelectItem>
              <SelectItem value="5">5 — Hardest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Template picker — appears after topic selected */}
        {selectedTopicId && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Template <span className="normal-case font-normal">(optional — auto-matched if empty)</span>
            </label>
            {templatesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : templates.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No templates for this topic yet. System will auto-assign.
              </p>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {templates.map(t => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer text-sm transition-all
                      ${selectedTemplateId === t.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}
                    `}
                    onClick={() =>
                      setSelectedTemplateId(selectedTemplateId === t.id ? null : t.id)
                    }
                  >
                    <span>{t.title}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">Lvl {t.difficulty}</Badge>
                      {t.isPublic && <Badge variant="outline" className="text-xs">Public</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reason (optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Note <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Add a note for this student..."
            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {success && (
          <p className="text-xs text-emerald-600 font-medium">
            ✓ Remediation assigned successfully!
          </p>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedTopicId || !snapshot || assigning || success}
          >
            {assigning ? 'Assigning...' : 'Assign Remediation'}
          </Button>
        </div>

      </div>
    </div>
  )
}