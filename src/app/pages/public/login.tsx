/**
 * login.tsx
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/authContext'
import { authApi } from '../../../shared/api/authApi'

import { MainCard } from '../../../shared/components/ui/card'
import { RoleButton } from '../../../shared/components/ui/roleButton'

import { Input, Button } from 'pixel-retroui'


export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [sessionExpired, setSessionExpired] = useState(false)
  useEffect(() => {
    const flag = localStorage.getItem('sessionExpired')
    if (flag === 'true') {
      localStorage.removeItem('sessionExpired')
      setSessionExpired(true)
    }
  }, [])

  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      const res = role === 'teacher'
        ? await authApi.loginTeacher({ email, password })
        : await authApi.loginStudent({ email, password })
      login(res.token)
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center">
      <MainCard
        className="max-w-md mx-auto mt-10 p-4">

          <div className='mb-4 text-center text-4xl font-bold'>Login</div>

          {sessionExpired && <p>Your session has expired. Please log in again.</p>}

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
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <Button
              onClick={handleSubmit} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          {error && <p>{error}</p>}
          <p>No account? <a style={{ color: 'blue' }} href="/register">Register</a></p>
          
      </MainCard>
    </div>
  )
}