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
        Student Sidebar
        <button onClick={handleLogout}>Logout</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}