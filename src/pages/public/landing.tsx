/**
 * landing.tsx
 *
 * Public landing page for cLMS.
 * Static page — no API calls.
 * Describes cLMS and Dolores Central School.
 *
 * Links:
 *   /login    → for existing users
 *   /register → for new users
 */

import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>cLMS</h1>
      <h2>Central Learning Management System</h2>
      <p>
        A digital Mathematics learning tool for Grade 4–6 students
        at Dolores Central School.
      </p>
      <p>
        Designed to help teachers manage lessons and track student
        progress, and help students learn at their own pace.
      </p>

      <div>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  )
}