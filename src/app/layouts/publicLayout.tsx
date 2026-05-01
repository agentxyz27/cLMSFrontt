import { Outlet } from 'react-router-dom'

import { useNavigate } from 'react-router-dom'
import { Button } from 'pixel-retroui'

export default function PublicLayout() {
  const navigate = useNavigate()

  return (
    <div>
      <nav className="p-4 border-b bg-yellow-200 flex items-center justify-between">
        <img
          src="/clmsFav.svg"
          alt="CLMS Logo"
          className="w-24"
        />

        <div className="flex gap-2">
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}