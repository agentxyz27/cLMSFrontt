interface Props {
  title: string
  error: string | null
  onTitleChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}

export default function LessonTitleStep({ title, error, onTitleChange, onNext, onBack }: Props) {
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>New Lesson</h1>
      <input
        type="text"
        placeholder="Lesson title"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onNext()}
        autoFocus
      />
      <button onClick={onNext}>Next →</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}