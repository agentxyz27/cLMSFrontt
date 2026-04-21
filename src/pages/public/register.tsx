/**
 * register.tsx
 *
 * Public registration page for cLMS.
 * Handles both teacher and student account creation.
 *
 * Flow:
 *   1. User selects role (teacher or student)
 *   2. Fills in the form
 *      - Student: extra LRN field + section dropdown (grade → section)
 *   3. POST to /api/auth/register/teacher or /api/auth/register/student
 *   4. On success → redirect to /login
 *   5. No auto-login — user must login manually after registering
 *
 * Endpoints:
 *   Teacher → POST /api/auth/register/teacher { name, email, password }
 *   Student → POST /api/auth/register/student { name, email, password, lrn, sectionId }
 *   Public  → GET  /api/sections              { id, level, sections: [{ id, name }] }
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'

interface SectionOption {
  id: number
  name: string
}

interface GradeOption {
  id: number
  level: number
  sections: SectionOption[]
}

export default function Register() {
  const navigate = useNavigate()

  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lrn, setLrn] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [grades, setGrades] = useState<GradeOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sectionsLoading, setSectionsLoading] = useState(false)

  // Fetch sections when student role is selected
  useEffect(() => {
    if (role !== 'student') return
    setSectionsLoading(true)
    api.get<GradeOption[]>('/sections')
      .then(res => setGrades(res))
      .catch(() => setError('Failed to load sections'))
      .finally(() => setSectionsLoading(false))
  }, [role])

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      if (role === 'teacher') {
        await api.post('/auth/register/teacher', { name, email, password })
      } else {
        if (!sectionId) {
          setError('Please select a section')
          setLoading(false)
          return
        }
       await api.post('/auth/register/student', { name, email, password, lrn, sectionId })
      }
      navigate('/login')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Register</h1>

      {/* Role selector */}
      <div>
        <button onClick={() => setRole('student')} disabled={role === 'student'}>
          Student
        </button>
        <button onClick={() => setRole('teacher')} disabled={role === 'teacher'}>
          Teacher
        </button>
      </div>

      {/* Form */}
      <div>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {/* Student-only fields */}
        {role === 'student' && (
          <>
            <input
              type="text"
              placeholder="LRN (12-digit Learner Reference Number)"
              value={lrn}
              onChange={e => setLrn(e.target.value)}
              maxLength={12}
            />

            {/* Section dropdown grouped by grade */}
            {sectionsLoading ? (
              <p>Loading sections...</p>
            ) : (
              <select
                value={sectionId}
                onChange={e => setSectionId(e.target.value)}
              >
                <option value=''>Select your section</option>
                {grades.map(grade => (
                  <optgroup key={grade.id} label={`Grade ${grade.level}`}>
                    {grade.sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </>
        )}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      {error && <p>{error}</p>}

      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  )
}