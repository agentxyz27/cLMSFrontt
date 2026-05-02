import { Link, Outlet } from 'react-router-dom'

import { PixelNavbar } from '../../shared/components/ui/pixelNavBar'
import { Button } from 'pixel-retroui'
import { useTheme } from '../../providers/themeProvider'

export default function PublicLayout() {
  const { toggleTheme, setThemeMode } = useTheme()

  return (
    <div>

      <PixelNavbar>

        <div className="flex gap-4">
          <Link className="nav-item" to="/">Home</Link>
          <Link className="nav-item" to="/about">About</Link>
        </div>

        <div className="flex gap-4">
          <Link className="nav-item" to="/login">Login</Link>
          <Link className="nav-item" to="/register">Register</Link>
        </div>

        <div>
          <Button onClick={() => setThemeMode("pro")}>Pro</Button>
          <Button onClick={() => setThemeMode("pixel")}>Pixel</Button>
          <Button onClick={toggleTheme}>Toggle</Button>
        </div>

      </PixelNavbar>

      <main>
        <Outlet />
      </main>

    </div>
  )
}