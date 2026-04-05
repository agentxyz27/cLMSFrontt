/**
 * studentLayout.tsx
 *
 * Persistent frame for all student pages.
 * Contains the sidebar navigation and logout button.
 * <Outlet /> renders the current child route inside the main area.
 *
 * Navigation links:
 *   /student/dashboard    → overview, enrolled subjects, XP
 *   /student/courses      → browse all subjects
 *   /student/progress     → completed lessons and scores
 *   /student/badges       → earned badges
 *   /student/leaderboard  → top 10 students by XP
 */

import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function StudentLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <aside>
        <p>Student Sidebar</p>

        <nav>
          <button onClick={() => navigate('/student/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/student/courses')}>Courses</button>
          <button onClick={() => navigate('/student/progress')}>Progress</button>
          <button onClick={() => navigate('/student/badges')}>Badges</button>
          <button onClick={() => navigate('/student/leaderboard')}>Leaderboard</button>
        </nav>

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  )
}