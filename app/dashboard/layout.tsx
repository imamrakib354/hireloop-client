import type { CSSProperties } from "react"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "../components/DashboardSidebar"
import { getCurrentUser } from "@/lib/getUserSession"
import { isDashboardRole } from "@/lib/dashboard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user || !isDashboardRole(user.role)) redirect("/sign-in")

  return (
    <SidebarProvider
      className="min-h-dvh bg-[#09090b] text-zinc-100"
      style={
        {
          "--sidebar-width": "15rem",
          "--sidebar": "#09090b",
          "--sidebar-foreground": "#a1a1aa",
          "--sidebar-accent": "#232327",
          "--sidebar-accent-foreground": "#fafafa",
          "--sidebar-border": "#232327",
          "--sidebar-ring": "#8b80f9",
        } as CSSProperties
      }
    >
      <DashboardSidebar
        user={{ name: user.name, image: user.image, role: user.role }}
      />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-white/5 bg-[#09090b] px-4">
          <SidebarTrigger className="text-zinc-400 hover:bg-white/10 hover:text-white" />
          <span className="text-sm text-zinc-400">
            {user.role === "admin"
              ? "Admin Console"
              : user.role === "recruiter"
                ? "Recruiter Portal"
                : "Seeker Portal"}
          </span>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
