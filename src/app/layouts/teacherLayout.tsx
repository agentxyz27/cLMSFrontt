import React from "react"
import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/layouts/app-sidebar"
import { SiteHeader } from "@/components/layouts/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function TeacherLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col">
              <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
                <Outlet />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}