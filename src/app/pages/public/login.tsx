/**
 * login.tsx
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { authApi } from '@/shared/api/authApi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className='flex  min-h-screen justify-center'>

      <Card className='flex flex-wrap h-fit w-1/2 p-8 gap-4'>
        <h1 className='text-center text-4xl font-semibold text-blue-500'>Login</h1>
        {sessionExpired && <p>Your session has expired. Please log in again.</p>}

        <div className='flex justify-center gap-8'>
          <Button onClick={() => setRole('student')} disabled={role === 'student'}>Student</Button>
          <Button onClick={() => setRole('teacher')} disabled={role === 'teacher'}>Teacher</Button>
        </div>

        <div className='flex flex-col gap-4'>
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
          <Button className='bg-blue-500' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </div>

        {error && <p>{error}</p>}
        <p className='text-center '>No account? <a className='text-blue-500' href="/register">Register</a></p>

      </Card>
     
    </div>
  )
}