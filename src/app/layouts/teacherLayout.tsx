/**
 * teacherLayout.tsx
 *
 * Responsive layout for all teacher pages.
 * - Desktop: fixed left sidebar with nav links
 * - Mobile: bottom tab bar
 *
 * Navigation:
 *   /teacher/dashboard   → Home / overview
 *   /teacher/classrooms  → Manage classrooms
 *   /teacher/templates   → Browse templates
 *   /teacher/lessons/new → Create new lesson
 *   /teacher/progress    → Student progress
 */

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  School,
  LayoutTemplate,
  Plus,
  BarChart2,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Home',
    icon: LayoutDashboard,
    path: '/teacher/dashboard',
  },
  {
    label: 'Classrooms',
    icon: School,
    path: '/teacher/classrooms',
  },
  {
    label: 'New',
    icon: Plus,
    path: '/teacher/lessons/new',
    isAction: true, // special "create" button style
  },
  {
    label: 'Templates',
    icon: LayoutTemplate,
    path: '/teacher/templates',
  },
  {
    label: 'Progress',
    icon: BarChart2,
    path: '/teacher/progress',
  },
]

export default function TeacherLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'T'

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-56 border-r bg-card z-40">

        {/* Brand */}
        <div className="px-5 py-5 border-b">
          <span className="text-base font-bold tracking-tight text-foreground">
            Teacher Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path, isAction }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors',
                isAction
                  ? 'bg-primary text-primary-foreground hover:bg-blue-500/90 mt-1 mb-1'
                  : isActive(path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn('shrink-0', isAction ? 'size-4' : 'size-4')} />
              {label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground truncate">
              {user?.name ?? 'Teacher'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
          >
            <LogOut className="size-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Desktop Header (top bar for page title slot) ── */}
      <div className="hidden md:flex fixed top-0 left-56 right-0 h-14 border-b bg-background/80 backdrop-blur-sm items-center px-6 z-30">
        <span className="text-sm text-muted-foreground">
          {NAV_ITEMS.find(i => isActive(i.path))?.label ?? 'Teacher Portal'}
        </span>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 md:ml-56 mt-0 md:mt-14 pb-20 md:pb-0 min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t z-40 flex items-end justify-around px-2 pb-safe">
        {NAV_ITEMS.map(({ label, icon: Icon, path, isAction }) => {
          const active = isActive(path)

          if (isAction) {
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center -mt-4 mb-1"
                aria-label="Create new"
              >
                <span className="flex items-center justify-center size-13 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Icon className="size-5" />
                </span>
                <span className="text-[10px] mt-1 text-muted-foreground font-medium">{label}</span>
              </button>
            )
          }

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}