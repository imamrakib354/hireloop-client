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
  { label: "Browse Jobs", href: "/jobs" },
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

  const accountControls = (compact = false) => (
    <>
      {user ? (
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <HoverLift>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium whitespace-nowrap text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9] disabled:cursor-wait disabled:opacity-60 sm:px-3 sm:text-sm"
            >
              {isSigningOut && (
                <Loader2 aria-hidden="true" className="size-3 animate-spin" />
              )}
              {isSigningOut ? "Signing out…" : "Sign Out"}
            </button>
          </HoverLift>
        </div>
      ) : (
        <HoverLift>
          <Link
            href="/sign-in"
            className={cn(
              "rounded-lg font-medium text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9]",
              compact
                ? "px-2 py-1.5 text-xs sm:px-3 sm:text-sm"
                : "px-3 py-2 text-sm"
            )}
          >
            Sign In
          </Link>
        </HoverLift>
      )}
      <HoverLift>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center bg-[#6757ff] font-medium whitespace-nowrap text-white transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#5438d6] focus-visible:ring-2 focus-visible:ring-[#c4b5fd]",
            compact
              ? "rounded-lg px-2.5 py-1.5 text-xs sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              : "rounded-xl px-5 py-2.5 text-sm"
          )}
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
          className="relative flex min-h-16 flex-wrap items-center rounded-2xl border border-white/10 bg-[#0e0d16]/85 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all sm:px-6 xl:h-20 xl:flex-nowrap xl:gap-6 xl:py-0"
        >
          {/* ============================================================ */}
          {/* MOBILE & TABLET: Left Burger Menu Dropdown                  */}
          {/* ============================================================ */}
          <div className="flex items-center xl:hidden">
            <DropdownMenu>
              <HoverLift>
                <DropdownMenuTrigger
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/20 group-hover/hover-lift:text-white focus-visible:ring-2 focus-visible:ring-[#635BFF] sm:size-10"
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
                {NAV_LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/")

                  return (
                    <DropdownMenuItem
                      key={link.href}
                      className={cn(
                        "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-[#635bff]/20 hover:text-[#ddd7ff] focus:bg-[#635bff]/20 focus:text-[#ddd7ff]",
                        active && "bg-white/10 font-semibold text-white"
                      )}
                    >
                      <Link href={link.href} className="w-full">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ============================================================ */}
          {/* Logo stays beside the menu on small screens. */}
          {/* ============================================================ */}
          <div className="mr-auto ml-3 shrink-0 xl:mx-0">
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
                className="h-7 w-auto object-contain sm:h-8 xl:h-9"
              />
            </Link>
          </div>

          {/* ============================================================ */}
          {/* Desktop navigation has enough room before switching layouts. */}
          {/* ============================================================ */}
          <div className="hidden min-w-0 flex-1 items-center gap-4 xl:flex">
            <div className="mr-auto flex min-w-0 items-center gap-4">
              {/* Desktop Navigation Links */}
              <ul className="flex shrink-0 items-center gap-4">
                {NAV_LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(link.href + "/")

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-sm font-normal tracking-tight whitespace-nowrap transition-colors duration-150",
                          active
                            ? "font-semibold text-white underline underline-offset-4"
                            : "text-zinc-300 hover:text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              {user && (
                <div
                  aria-hidden="true"
                  className="h-5 w-px shrink-0 bg-white/20"
                />
              )}

              {user && (
                <p className="max-w-40 min-w-0 text-sm text-zinc-300">
                  Welcome,
                  <br />
                  <span
                    className="block truncate font-medium text-white"
                    title={user.name}
                  >
                    {user.name}
                  </span>
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {accountControls()}
            </div>
          </div>

          {/* Keep account details and actions together on the left. */}
          <div className="mt-3 flex w-full min-w-0 flex-col items-start gap-3 border-t border-white/10 pt-3 xl:hidden">
            {user && (
              <p className="w-full min-w-0 text-xs text-zinc-300 sm:text-sm">
                Welcome,{" "}
                <span
                  className="block truncate font-medium text-white"
                  title={user.name}
                >
                  {user.name}
                </span>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-3">
              {accountControls(true)}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
