"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, Menu } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { HoverLift } from "@/components/hover-lift"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"
import { dashboardHref, isDashboardRole } from "@/lib/dashboard"

const PUBLIC_NAV_LINKS = [
  { label: "Browse Jobs", href: "/Browse-jobs" },
  { label: "Company", href: "/company" },
  { label: "Pricing", href: "/pricing" },
] as const

type NavbarProps = {
  user: { name: string; role?: string | null } | null
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const signingOutRef = useRef(false)

  const NAV_LINKS = [
    ...PUBLIC_NAV_LINKS,
    ...(user && isDashboardRole(user.role)
      ? [{ label: "Dashboard", href: dashboardHref(user.role) }]
      : []),
  ] as const

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

  const accountControls = () => (
    <>
      {user && (
        <>
          <p className="hidden min-w-0 text-xs leading-snug text-zinc-400 sm:block xl:text-sm">
            Welcome,
            <span
              className="block max-w-28 truncate font-medium text-white"
              title={user.name}
            >
              {user.name}
            </span>
          </p>
          <span
            aria-hidden="true"
            className="hidden h-6 w-px shrink-0 bg-white/15 sm:block"
          />
        </>
      )}
      {user ? (
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <HoverLift>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="inline-flex items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium whitespace-nowrap text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9] disabled:cursor-wait disabled:opacity-60 sm:gap-2 sm:px-2 sm:text-sm"
            >
              {isSigningOut && (
                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
              )}
              <span className="sm:hidden">Sign Out</span>
              <span className="hidden sm:inline">
                {isSigningOut ? "Signing out…" : "Sign Out"}
              </span>
            </button>
          </HoverLift>
        </div>
      ) : (
        <HoverLift>
          <Link
            href="/sign-in"
            className="rounded-lg px-1 py-2 text-[11px] font-medium whitespace-nowrap text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9] sm:px-2 sm:text-sm"
          >
            Sign In
          </Link>
        </HoverLift>
      )}
      <HoverLift>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-[#6757ff] px-2.5 py-2 text-[11px] font-medium whitespace-nowrap text-white transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#5438d6] focus-visible:ring-2 focus-visible:ring-[#c4b5fd] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
        >
          Get Started
        </button>
      </HoverLift>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Main Navigation"
          className="relative flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0e0d16]/85 px-2.5 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl sm:gap-4 sm:px-6 xl:grid xl:h-20 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-5 xl:py-0"
        >
          {/* Left: mobile menu and logo. */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <div className="flex items-center xl:hidden">
              <DropdownMenu>
                <HoverLift>
                  <DropdownMenuTrigger
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/20 group-hover/hover-lift:text-white focus-visible:ring-2 focus-visible:ring-[#635BFF] sm:size-10 sm:rounded-xl"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </DropdownMenuTrigger>
                </HoverLift>

                <DropdownMenuContent
                  align="start"
                  sideOffset={8}
                  className="w-52 rounded-xl border border-white/10 bg-[#151421]/95 p-1.5 text-zinc-200 shadow-2xl backdrop-blur-xl"
                >
                  {user && (
                    <div className="mb-1 border-b border-white/10 px-3 py-2 text-xs text-zinc-400 sm:hidden">
                      Welcome,
                      <p
                        className="mt-1 truncate font-medium text-white"
                        title={user.name}
                      >
                        {user.name}
                      </p>
                    </div>
                  )}
                  {NAV_LINKS.map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(link.href + "/")

                    return (
                      <DropdownMenuItem
                        key={link.href}
                        className={cn(
                          "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[#635bff]/20 hover:text-[#ddd7ff] focus:bg-[#635bff]/20 focus:text-[#ddd7ff]",
                          active &&
                            "bg-[#6757ff]/15 text-[#c4b5fd] ring-1 ring-[#8b80f9]/20 ring-inset"
                        )}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className="w-full"
                        >
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link
              href="/"
              aria-label="HireLoop home"
              className="flex items-center"
            >
              <Image
                src="/logo.png"
                alt="HireLoop"
                width={140}
                height={38}
                priority
                className="h-auto w-[72px] object-contain min-[375px]:w-24 sm:w-32 xl:w-36"
              />
            </Link>
          </div>

          {/* Center: desktop page links, independent of account width. */}
          <ul className="hidden items-center justify-center gap-1 xl:flex">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href + "/")

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#8b80f9]",
                      active
                        ? "bg-[#6757ff]/15 text-[#c4b5fd] ring-1 ring-[#8b80f9]/20 ring-inset"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right: one shared account group at every breakpoint. */}
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3 xl:ml-0 xl:justify-self-end">
            {accountControls()}
          </div>
        </nav>
      </div>
    </header>
  )
}
