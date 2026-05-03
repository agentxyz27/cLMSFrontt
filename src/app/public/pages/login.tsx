/**
 * login.tsx
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/authContext'
import { authApi } from '../../../shared/api/authApi'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'

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

  const roleButtons = [
    { label: 'Student', value: 'student' },
    { label: 'Teacher', value: 'teacher' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card
      bg="#000000"
      textColor="#ffffff"
      borderColor="#ffffff"
      shadowColor="#000000"
      className="bg-white text-black border-black shadow-black w-full max-w-md">

        <div className='flex w-full justify-center bg-blue-500 text-3xl'>Login</div>
        {sessionExpired && <p>Your session has expired. Please log in again.</p>}

        <div className='flex w-full items-center justify-center bg-amber-800'>
          <div className='flex gap-4 w-60 bg-red-400'>
            {roleButtons.map((button) => (
              <Button
                key={button.value}
                className="flex-1"
                onClick={() => setRole(button.value as 'student' | 'teacher')}
                disabled={role === button.value}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        {error && <p>{error}</p>}
        <p>No account? <a href="/register">Register</a></p>
      </Card>
    </div>
  )
}