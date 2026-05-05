import type { GradeWithSections, Subject } from '@/shared/types'

interface Props {
  selectedSubjectId: string
  setSelectedSubjectId: (v: string) => void

  selectedSectionId: string
  setSelectedSectionId: (v: string) => void

  sectionOptions: GradeWithSections[]
  sectionsLoading: boolean

  subjectOptions: Subject[]
  subjectsLoading: boolean

  creating: boolean
  createError: string | null

  onCreate: () => void
  onClose: () => void
}

export default function CreateClassRoomModal({
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSectionId,
  setSelectedSectionId,
  sectionOptions,
  sectionsLoading,
  subjectOptions,
  subjectsLoading,
  creating,
  createError,
  onCreate,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 24,
          maxWidth: 400,
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Create Classroom</h2>

        <label>Subject</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          disabled={subjectsLoading}
          style={{
            display: 'block',
            width: '100%',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #ddd',
            marginBottom: 12,
          }}
        >
          <option value="">Select subject</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={String(subject.id)}>
              {subject.name}
            </option>
          ))}
        </select>

        <label>Section</label>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          disabled={sectionsLoading}
          style={{
            display: 'block',
            width: '100%',
            padding: '6px 10px',
            borderRadius: 4,
            border: '1px solid #ddd',
            marginBottom: 12,
          }}
        >
          <option value="">Select section</option>
          {sectionOptions.map((grade) => (
            <optgroup key={grade.id} label={`Grade ${grade.level}`}>
              {grade.sections.map((section) => (
                <option key={section.id} value={String(section.id)}>
                  {section.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {createError && (
          <p style={{ color: 'red', margin: '0 0 12px' }}>
            {createError}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}