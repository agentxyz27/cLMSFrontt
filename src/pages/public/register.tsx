/**
 * register.tsx
 *
 * Public registration page for cLMS.
 * Handles both teacher and student account creation.
 *
 * Flow:
 *   1. User selects role (teacher or student)
 *   2. Fills in the form (student has extra LRN field)
 *   3. POST to /api/auth/register or /api/auth/student/register
 *   4. On success → redirect to /login
 *   5. No auto-login — user must login manually after registering
 *
 * Endpoints:
 *   Teacher → POST /api/auth/register        { name, email, password }
 *   Student → POST /api/auth/student/register { name, email, password, lrn }
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'

export default function Register() {
  const navigate = useNavigate()

  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lrn, setLrn] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    try {
      if (role === 'teacher') {
        await api.post('/auth/register', { name, email, password })
      } else {
        await api.post('/auth/student/register', { name, email, password, lrn })
      }

      // No auto-login — backend returns no token on register
      // Redirect to login so user authenticates fresh
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

        {/* LRN only for students */}
        {role === 'student' && (
          <input
            type="text"
            placeholder="LRN (Learner Reference Number)"
            value={lrn}
            onChange={e => setLrn(e.target.value)}
          />
        )}

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      {/* Error */}
      {error && <p>{error}</p>}

      {/* Login link */}
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  )
}