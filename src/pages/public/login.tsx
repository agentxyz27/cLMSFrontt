/**
 * login.tsx
 *
 * Public login page for cLMS.
 * Handles both teacher and student login.
 *
 * Flow:
 *   1. User selects role (teacher or student)
 *   2. Submits email + password
 *   3. POST to /api/auth/login or /api/auth/student/login
 *   4. On success → decode token via authContext.login()
 *   5. Redirect based on role → /teacher/dashboard or /student/dashboard
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    try {
      const endpoint = role === 'teacher' ? '/auth/login' : '/auth/student/login'
      const res = await api.post<{ token: string }>(endpoint, { email, password })

      // Store token + decode user into context
      login(res.token)

      // Redirect based on role
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

      {/* Error */}
      {error && <p>{error}</p>}

      {/* Register link */}
      <p>No account? <a href="/register">Register</a></p>
    </div>
  )
}