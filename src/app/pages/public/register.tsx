/**
 * register.tsx
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/authContext'
import { authApi } from '../../../shared/api/authApi'
import { useSections } from '../../../features/teacher/hooks/useSections'

import { MainCard } from '../../../shared/components/ui/card'
import { RoleButton } from '../../../shared/components/ui/roleButton'

import { Input, Button, } from 'pixel-retroui'




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
    <div className="min-h-screen flex items-center justify-center">
      <MainCard
        className="max-w-md mx-auto mt-10 p-4">

        <div className='mb-4 text-center text-4xl font-bold'>Register</div>

        {/* Role selector */}
        <div className="flex gap-4 align-center justify-center mb-4">
          <RoleButton
            active={role === 'student'}
            onClick={() => setRole('student')}
          >
            Student
          </RoleButton>

          <RoleButton
            active={role === 'teacher'}
            onClick={() => setRole('teacher')}
          >
            Teacher
          </RoleButton>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {role === 'student' && (
            <>
              <Input
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
          
          <div className="flex flex-col gap-4 mb-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>

        </div>

        {error && <p>{error}</p>}
        <p>Already have an account? <a style={{ color: 'blue' }} href="/login">Login</a></p>
      </MainCard>
    </div>
  )
}