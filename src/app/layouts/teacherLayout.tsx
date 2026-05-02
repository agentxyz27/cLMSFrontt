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
      <aside className='bg-red-200'>
          <p>{user?.name}</p>

          <nav className="flex flex-col gap-2 mt-4">
            <button onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
            <button onClick={() => navigate('/teacher/templates')}>Templates</button>
            <button onClick={handleLogout}>Logout</button>
          </nav>
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