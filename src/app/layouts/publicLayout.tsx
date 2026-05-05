/**
 * publicLayout.tsx
 *
 * Layout for public-facing pages
 * - Desktop: top navigation bar
 * - Mobile: bottom tab navigation
 */

import { Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  Home,
  BookOpen,
  Info,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Explore", icon: BookOpen, path: "/explore" },
  { label: "About", icon: Info, path: "/about" },
  { label: "Login", icon: LogIn, path: "/login", isAction: true },
]

export default function PublicLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* ── Desktop Top Navigation ── */}
      <header className="hidden md:flex fixed top-0 inset-x-0 h-14 border-b bg-background/80 backdrop-blur-sm z-40 items-center justify-between px-6">

        {/* Brand */}
        <span
          onClick={() => navigate("/")}
          className="font-bold text-foreground cursor-pointer"
        >
          EduForge Solutions
        </span>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {NAV_ITEMS.map(({ label, icon: Icon, path, isAction }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isAction
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : isActive(path)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 mt-0 md:mt-14 pb-20 md:pb-0">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t z-40 flex items-end justify-around px-2 pb-safe">
        {NAV_ITEMS.map(({ label, icon: Icon, path, isAction }) => {
          const active = isActive(path)

          if (isAction) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center -mt-4 mb-1"
              >
                <span className="flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Icon className="size-5" />
                </span>
                <span className="text-[10px] mt-1 text-muted-foreground">
                  {label}
                </span>
              </button>
            )
          }

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px]">{label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}