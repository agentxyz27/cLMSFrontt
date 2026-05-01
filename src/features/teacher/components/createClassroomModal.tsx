import { Popup, Button } from "pixel-retroui"
import type { GradeWithSections } from '../../../shared/types'

interface Props {
  isOpen: boolean
  onClose: () => void

  selectedSubjectId: string
  setSelectedSubjectId: (v: string) => void

  selectedSectionId: string
  setSelectedSectionId: (v: string) => void

  sectionOptions: GradeWithSections[]
  sectionsLoading: boolean

  creating: boolean
  createError: string | null
  onCreate: () => void
}

export default function CreateClassRoomModal({
  isOpen,
  onClose,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSectionId,
  setSelectedSectionId,
  sectionOptions,
  sectionsLoading,
  creating,
  createError,
  onCreate
}: Props) {

  return (
    <Popup
      bg="#fefcd0"
      baseBg="#c381b5"
      textColor="black"
      borderColor="black"
  
    isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-3 p-2">

        <h2 className="text-lg font-bold">Create Classroom</h2>

        <label>Subject</label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="">Select subject</option>
          <option value="1">Mathematics</option>
        </select>

        <label>Section</label>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
        >
          <option value="">Select section</option>

          {sectionsLoading ? (
            <option disabled>Loading...</option>
          ) : (
            sectionOptions.map((grade) => (
              <optgroup key={grade.id} label={`Grade ${grade.level}`}>
                {grade.sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>

        {createError && (
          <p className="text-red-600">{createError}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onCreate} disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </div>
      </div>
    </Popup>
  )
}