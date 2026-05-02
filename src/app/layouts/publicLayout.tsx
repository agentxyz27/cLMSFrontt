import { Link, Outlet } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { useTheme } from "@/providers/themeProvider"
import { Card } from "@/shared/components/ui/card"

export default function PublicLayout() {
  const { toggleTheme, setThemeMode } = useTheme()

  const themeButtons = [
    { label: "Pro", onClick: () => setThemeMode("pro") },
    { label: "Pixel", onClick: () => setThemeMode("pixel") },
    { label: "Toggle", onClick: toggleTheme },
  ]

  return (
    <div>
      <Card
        bg="black"
        textColor="white"
        borderColor="white"
        shadowColor="#000000"
        className="fixed top-4 left-4 right-4 z-10 flex items-center justify-between"
      >
        <div className="flex gap-4">
          <Link className="nav-item" to="/">Home</Link>
          <Link className="nav-item" to="/about">About</Link>
        </div>
        <div className="flex gap-4">
          <Link className="nav-item" to="/login">Login</Link>
          <Link className="nav-item" to="/register">Register</Link>
        </div>
      </Card>

      <div className="fixed w-full bottom-2 bg-amber-300">
        {themeButtons.map((btn) => (
            <Button
              key={btn.label}
              bg="black"
              textColor="white"
              borderColor="white"
              shadow="white"
              onClick={btn.onClick}
            >
              {btn.label}
            </Button>
          ))}
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}