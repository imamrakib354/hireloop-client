"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { Loader2, LogOut } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { toast } from "@/components/ui/toast"
import { useSidebar } from "@/components/ui/sidebar"
import { type DashboardRole as Role } from "@/lib/dashboard"
import {
  Bookmark,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Users,
  Wallet,
  Settings,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

type MenuItem = {
  id: string
  name: string
  url: string
  icon: LucideIcon
}

// Role-specific dashboard navigation.
const menuItemsByRole: Record<Role, MenuItem[]> = {
  seeker: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/seeker",
      icon: LayoutDashboard,
    },
    {
      id: "jobs",
      name: "Jobs",
      url: "/dashboard/seeker/jobs",
      icon: Briefcase,
    },
    {
      id: "saved-jobs",
      name: "Saved Jobs",
      url: "/dashboard/seeker/saved-jobs",
      icon: Bookmark,
    },
    {
      id: "applications",
      name: "Applications",
      url: "/dashboard/seeker/applications",
      icon: FileText,
    },
    {
      id: "billing",
      name: "Billing",
      url: "/dashboard/seeker/billing",
      icon: Wallet,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/seeker/settings",
      icon: Settings,
    },
  ],
  recruiter: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/recruiter",
      icon: LayoutDashboard,
    },
    {
      id: "my-company",
      name: "My Company",
      url: "/dashboard/recruiter/my-company",
      icon: Building2,
    },
    {
      id: "manage-jobs",
      name: "Manage Jobs",
      url: "/dashboard/recruiter/jobs",
      icon: Briefcase,
    },
    {
      id: "add-job",
      name: "Add Job",
      url: "/dashboard/recruiter/jobs/new",
      icon: PlusCircle,
    },
    {
      id: "applications",
      name: "Applications",
      url: "/dashboard/recruiter/applications",
      icon: FileText,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/recruiter/settings",
      icon: Settings,
    },
  ],
  admin: [
    {
      id: "dashboard",
      name: "Dashboard",
      url: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    { id: "users", name: "Users", url: "/dashboard/admin/users", icon: Users },
    {
      id: "companies",
      name: "Companies",
      url: "/dashboard/admin/companies",
      icon: Building2,
    },
    { id: "jobs", name: "Jobs", url: "/dashboard/admin/jobs", icon: Briefcase },
    {
      id: "payments",
      name: "Payments",
      url: "/dashboard/admin/payments",
      icon: Wallet,
    },
    {
      id: "settings",
      name: "Settings",
      url: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
}

type SidebarUser = {
  name: string
  image?: string | null
  role: Role
}

function ProfileAvatar({ user }: { user: SidebarUser }) {
  return user.image ? (
    <Image
      src={user.image}
      alt=""
      width={32}
      height={32}
      unoptimized
      className="size-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-200"
      aria-hidden="true"
    >
      {user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "HL"}
    </span>
  )
}

export function DashboardSidebar({ user }: { user: SidebarUser }) {
  const { role } = user
  const pathname = usePathname()
  const activeItem = menuItemsByRole[role]
    .filter(
      (item) =>
        pathname === item.url ||
        (item.id !== "dashboard" && pathname.startsWith(item.url + "/"))
    )
    .sort((a, b) => b.url.length - a.url.length)[0]
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const signingOutRef = useRef(false)

  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false)
  }

  async function handleSignOut() {
    if (signingOutRef.current) return
    signingOutRef.current = true
    setIsSigningOut(true)
    try {
      const { error } = await authClient.signOut()
      if (error) throw new Error(error.message || "Please try again.")
      toast.add({ title: "Signed out successfully!", type: "success" })
      router.replace("/")
      router.refresh()
    } catch (error) {
      toast.add({
        title: "Could not sign out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      signingOutRef.current = false
      setIsSigningOut(false)
    }
  }

  return (
    <Sidebar className="border-white/10 bg-[#09090b] text-zinc-400 [&_[data-slot=sidebar-inner]]:bg-[#09090b]">
      <SidebarHeader className="relative shrink-0 gap-5 px-4 pt-6 pb-4">
        <SidebarTrigger className="absolute top-5 right-3 text-zinc-400 hover:bg-white/10 hover:text-white md:hidden" />
        <Link
          href="/"
          aria-label="HireLoop home"
          onClick={closeMobileSidebar}
          className="w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Image
            src="/logo.png"
            alt="HireLoop"
            width={120}
            height={33}
            priority
            className="h-auto w-28"
          />
        </Link>
        {role === "admin" ? (
          <p className="-mt-3 text-xs text-zinc-500">Admin Console</p>
        ) : (
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3">
            <ProfileAvatar user={user} />
            <div className="min-w-0">
              <p
                className="truncate text-xs font-medium text-zinc-100"
                title={user.name}
              >
                {role === "seeker" ? "Seeker Portal" : user.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                {role === "seeker" ? user.name : "Recruiter"}
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-0">
          <nav aria-label={`${role} dashboard navigation`}>
            <SidebarMenu>
              {menuItemsByRole[role].map((item) => {
                const active = item.id === activeItem?.id
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={active}
                      render={
                        <Link
                          href={item.url}
                          aria-current={active ? "page" : undefined}
                          onClick={closeMobileSidebar}
                        />
                      }
                      className="h-9 gap-2.5 rounded-md px-2.5 text-xs text-zinc-400 hover:bg-[#232327] hover:text-zinc-100 data-active:bg-[#232327] data-active:text-zinc-100"
                    >
                      <item.icon className="text-zinc-500" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="shrink-0 gap-2 px-4 pt-4 pb-5">
        {role === "seeker" && (
          <>
            <Link
              href="/dashboard/seeker/settings#resume"
              onClick={closeMobileSidebar}
              className="flex h-9 items-center justify-center rounded-md bg-zinc-50 text-xs font-semibold text-zinc-950 transition-colors outline-none hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              Post Resume
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="flex h-9 items-center gap-2.5 rounded-md px-2 text-xs text-zinc-500 outline-none hover:bg-white/5 hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-violet-400 disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              {isSigningOut ? "Signing out…" : "Logout"}
            </button>
          </>
        )}
        {role === "admin" && (
          <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <ProfileAvatar user={user} />
            <div className="min-w-0">
              <p
                className="truncate text-xs font-medium text-zinc-100"
                title={user.name}
              >
                {user.name}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500">Admin</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
