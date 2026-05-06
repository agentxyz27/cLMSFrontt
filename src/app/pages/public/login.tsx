/**
 * login.tsx
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { authApi } from '@/shared/api/authApi'
import { LoginForm } from '@/components/login-form'

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

  const [role, setRole] = useState<'teacher' | 'student'>('teacher')
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
     <div className="flex min-h-screen justify-center items-center">
      <LoginForm
        className="w-full max-w-md"
        role={role}
        setRole={setRole}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        sessionExpired={sessionExpired}
      />
    </div>
  )
}