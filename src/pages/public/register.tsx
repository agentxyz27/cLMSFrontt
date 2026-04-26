/**
 * register.tsx
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { authApi } from '../../api/authApi'
import { useSections } from '../../hooks/useSections'

export default function Register() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lrn, setLrn] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Only fetch sections when student role is selected
  const { data: grades, loading: sectionsLoading } = useSections(
    role === 'student' ? token : null
  )

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      if (role === 'teacher') {
        await authApi.registerTeacher({ name, email, password })
      } else {
        if (!sectionId) {
          setError('Please select a section')
          setLoading(false)
          return
        }
        await authApi.registerStudent({ name, email, password, lrn, sectionId })
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

      <div>
        <button onClick={() => setRole('student')} disabled={role === 'student'}>Student</button>
        <button onClick={() => setRole('teacher')} disabled={role === 'teacher'}>Teacher</button>
      </div>

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

        {role === 'student' && (
          <>
            <input
              type="text"
              placeholder="LRN (12-digit Learner Reference Number)"
              value={lrn}
              onChange={e => setLrn(e.target.value)}
              maxLength={12}
            />
            {sectionsLoading ? (
              <p>Loading sections...</p>
            ) : (
              <select value={sectionId} onChange={e => setSectionId(e.target.value)}>
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