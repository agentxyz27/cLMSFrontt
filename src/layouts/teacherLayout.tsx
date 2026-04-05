/**
 * teacherLayout.tsx
 *
 * Persistent frame for all teacher pages.
 * Contains the sidebar navigation and logout button.
 * <Outlet /> renders the current child route inside the main area.
 *
 * Navigation links:
 *   /teacher/dashboard  → overview, subjects summary
 *   /teacher/subjects   → manage all subjects and lessons
 */

import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function TeacherLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <aside>
        <p>Teacher Sidebar</p>

        <nav>
          <button onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/teacher/subjects')}>Subjects</button>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  )
}