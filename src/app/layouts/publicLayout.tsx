import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div>
      <nav>Public Nav (logo, login, register)</nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}