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
 *
 * Session Expiry:
 *   If redirected here due to a 401 (expired token),
 *   a session expired message is shown above the form.
 *   AuthProvider sets localStorage.sessionExpired = 'true' before redirecting.
 *   useState lazy initializer reads and clears the flag on first mount.
 *   This ensures the flag is only read once and never persists.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { api } from '../../api/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  /**
   * Lazy initializer — runs once on component mount.
   * Reads sessionExpired flag from localStorage and immediately clears it.
   * This prevents the message from showing on subsequent visits to /login.
   */
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

      {/* Session expiry message — only shown when redirected from 401 */}
      {sessionExpired && (
        <p>Your session has expired. Please log in again.</p>
      )}

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