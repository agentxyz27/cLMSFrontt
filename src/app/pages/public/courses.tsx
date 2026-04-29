/**
 * courses.tsx
 *
 * Redirects unauthenticated users to /login.
 * Authenticated users will be redirected to their
 * role-specific courses page in Phase 5.
 *
 * This is a temporary stub — will be replaced in Phase 5
 * with /student/courses and /teacher/subjects.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

export default function Courses() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    // Redirect to role-specific courses page
    if (user?.role === 'teacher') navigate('/teacher/subjects')
    if (user?.role === 'student') navigate('/student/courses')
  }, [token, user, navigate])

  return null // renders nothing — just redirects
}