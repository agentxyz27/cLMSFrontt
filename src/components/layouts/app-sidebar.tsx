import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/authContext"
import { teacherNavItems } from "@/shared/nav/teacherNav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LogOut } from "lucide-react"

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  function handleLogout() {
    logout()
    navigate("/login")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T"

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Teacher Portal</span>
            <span className="truncate text-xs text-muted-foreground">
              Lesson workspace
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
          {teacherNavItems.map(({ label, icon: Icon, path, isAction }) => {
            const active = isActive(path)

            return (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton
                  onClick={() => navigate(path)}
                  isActive={active}
                  tooltip={label}
                  className={
                    isAction
                      ? "justify-start bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                      : "justify-start"
                  }
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? "Teacher"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.role ?? "teacher"}
            </p>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}