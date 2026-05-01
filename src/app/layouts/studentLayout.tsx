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
import { useAuth } from '../../context/authContext'

import { Card, Button } from 'pixel-retroui'

export default function StudentLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Card className="p-4">
        <p>{user?.name}</p>

        <nav className="flex flex-col gap-2 mt-4">
          <Button onClick={() => navigate('/student/dashboard')}>Dashboard</Button>
          <Button onClick={() => navigate('/student/progress')}>Progress</Button>
          <Button onClick={() => navigate('/student/badges')}>Badges</Button>
          <Button onClick={() => navigate('/student/leaderboard')}>Leaderboard</Button>
        </nav>

        <Button onClick={handleLogout}>Logout</Button>
      </Card>

      <main>
        <Outlet />
      </main>
    </div>
  )
}