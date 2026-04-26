/**
 * login.tsx
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { authApi } from '../../api/authApi'

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
    <div>
      <h1>Login</h1>
      {sessionExpired && <p>Your session has expired. Please log in again.</p>}

      <div>
        <button onClick={() => setRole('student')} disabled={role === 'student'}>Student</button>
        <button onClick={() => setRole('teacher')} disabled={role === 'teacher'}>Teacher</button>
      </div>

      <div>
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
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>

      {error && <p>{error}</p>}
      <p>No account? <a href="/register">Register</a></p>
    </div>
  )
}