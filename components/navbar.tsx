"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { HoverLift } from "@/components/hover-lift"

// Navigation links matching the design
const NAV_LINKS = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/companies" },
  { label: "Pricing", href: "/pricing" },
] as const

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Main Navigation"
          className="relative flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-[#0e0d16]/85 px-4 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all sm:h-20 sm:px-6"
        >
          {/* ============================================================ */}
          {/* MOBILE & TABLET: Left Burger Menu Dropdown                  */}
          {/* ============================================================ */}
          <div className="flex items-center lg:hidden">
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
          {/* LOGO: Center on Mobile/Tablet, Left-aligned on Desktop       */}
          {/* ============================================================ */}
          <div className="absolute left-1/2 shrink-0 -translate-x-1/2 lg:static lg:translate-x-0">
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
                className="h-7 w-auto object-contain sm:h-8 lg:h-9"
              />
            </Link>
          </div>

          {/* ============================================================ */}
          {/* DESKTOP (lg+): Navigation, divider, and visual auth buttons */}
          {/* ============================================================ */}
          <div className="hidden items-center gap-6 lg:flex">
            {/* Desktop Navigation Links */}
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(link.href + "/")

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm font-normal tracking-tight transition-colors duration-150",
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

            <div aria-hidden="true" className="h-5 w-px bg-white/20" />

            <div className="flex items-center gap-4">
              <HoverLift>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9]"
                >
                  Sign In
                </Link>
              </HoverLift>
              <HoverLift>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl bg-[#6757ff] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#5438d6] focus-visible:ring-2 focus-visible:ring-[#c4b5fd]"
                >
                  Get Started
                </button>
              </HoverLift>
            </div>
          </div>

          {/* MOBILE & TABLET: Sign in and separate Get Started button */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:hidden">
            <HoverLift>
              <Link
                href="/sign-in"
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-[#8B80F9] transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#635bff]/15 group-hover/hover-lift:text-[#d5ceff] focus-visible:ring-2 focus-visible:ring-[#8b80f9] sm:px-3 sm:text-sm"
              >
                Sign In
              </Link>
            </HoverLift>
            <HoverLift>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-[#6757ff] px-2.5 py-1.5 text-xs font-medium text-white transition-colors duration-300 outline-none group-hover/hover-lift:bg-[#5438d6] focus-visible:ring-2 focus-visible:ring-[#c4b5fd] sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                Get Started
              </button>
            </HoverLift>
          </div>
        </nav>
      </div>
    </header>
  )
}
