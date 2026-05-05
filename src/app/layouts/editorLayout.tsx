import { Outlet, useNavigate } from "react-router-dom"
import { Save, Home, Folder } from "lucide-react"

export default function EditorLayout() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* ── Header (Control Bar) ── */}
      <header className="h-14 flex items-center justify-between px-4 border-b bg-background/80 backdrop-blur-sm z-40">

        {/* Left: Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-accent"
          >
            <Home className="size-4" />
            Home
          </button>

          <button
            onClick={() => navigate("/teacher/templates")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-accent"
          >
            <Folder className="size-4" />
            Files
          </button>
        </div>

        {/* Center: Title */}
        <div className="text-sm font-medium text-muted-foreground">
          Lesson Editor
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="size-4" />
            Save
          </button>
        </div>

      </header>

      {/* ── Editor Canvas Area ── */}
     <main className="flex-1 min-h-0 flex overflow-hidden">
        <Outlet />
      </main>

    </div>
  )
}