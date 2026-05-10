import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Save, Home, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"

type TopToolBarProps = {
  title?: string
  onSave?: () => void
  homePath?: string
  filesPath?: string
  rightAction?: ReactNode
}

export default function TopToolBar({
  title = "Lesson Editor",
  onSave,
  homePath = "/teacher/dashboard",
  filesPath = "/teacher/templates",
  rightAction,
}: TopToolBarProps) {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => navigate(homePath)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <Home className="size-4" />
          Home
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate(filesPath)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white"
        >
          <Folder className="size-4" />
          Files
        </Button>
      </div>

      <div className="text-sm font-medium text-muted-foreground">
        {title}
      </div>

      <div className="flex items-center gap-2">
        {rightAction ?? (
          <Button
            variant="ghost"
            onClick={onSave}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <Save className="size-4" />
            Save
          </Button>
        )}
      </div>
    </header>
  )
}