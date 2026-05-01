/**
 * teacherLayout.tsx
 *
 * Persistent frame for all teacher pages.
 * Contains the sidebar navigation and logout button.
 * <Outlet /> renders the current child route inside the main area.
 *
 * Navigation links:
 *   /teacher/dashboard  → overview, subjects summary
 *   /teacher/Templates   → manage all templates, create new template
 */

import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext'

import { Card, Button } from 'pixel-retroui'

export default function TeacherLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside>
        <Card className="p-4 w-64 h-full flex flex-col">
          <img
            src="/clmsFav.svg"
            alt="CLMS Logo"
            className="w-48 mb-4"
          />

          <p>{user?.name}</p>

          <nav className="flex flex-col gap-2 mt-4">
            <Button onClick={() => navigate('/teacher/dashboard')}>Dashboard</Button>
            <Button onClick={() => navigate('/teacher/templates')}>Templates</Button>
            <Button onClick={handleLogout}>Logout</Button>
          </nav>
        </Card>
      </aside>

      {/* RIGHT SIDE (header + content stacked) */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="p-4 border-b bg-yellow-200">
          <h1 className="text-2xl font-bold">Teacher Portal</h1>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex">
          <Outlet />
        </main>

      </div>

    </div>
  )
}