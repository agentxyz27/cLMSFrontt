import { useLocation, useNavigate } from "react-router-dom"
import { teacherNavItems } from "@/shared/nav/teacherNav"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus } from "lucide-react"

export function SiteHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  const current =
    teacherNavItems.find(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    ) ?? teacherNavItems[0]

  return (
    <header className="flex h-[var(--header-height)] items-center gap-3 border-b bg-background/80  backdrop-blur-sm px-4 md:px-6 rounded-t-xl">
      <SidebarTrigger />

      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-sm font-medium">{current.label}</h1>
      </div>

      <Button
        size="sm"
        className="gap-2"
        onClick={() => navigate("/teacher/kahitano")}
      >
        <Plus className="size-4" />
        KahitAno
      </Button>
    </header>
  )
}