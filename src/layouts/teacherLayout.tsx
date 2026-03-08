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
        Teacher Sidebar
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}