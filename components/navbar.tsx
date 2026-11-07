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

// Navigation links matching the design
const NAV_LINKS = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/companies" },
  { label: "Pricing", href: "/pricing" },
] as const

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-3 z-50 w-full px-3 sm:top-5 sm:px-6 lg:px-8">
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
              <DropdownMenuTrigger
                className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#635BFF] sm:size-10"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </DropdownMenuTrigger>

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
                        "cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white",
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
              <button
                type="button"
                className="text-sm font-medium text-[#8B80F9] transition-colors hover:text-[#A79DFF]"
              >
                Sign In
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5C53FE] to-[#7165FF] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(92,83,254,0.4)] transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* MOBILE & TABLET: Visual auth buttons only */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:hidden">
            <button
              type="button"
              className="px-2 py-1.5 text-xs font-medium text-[#8B80F9] transition-colors hover:text-[#A79DFF] sm:px-3 sm:text-sm"
            >
              Sign In
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#5C53FE] to-[#7165FF] px-2.5 py-1.5 text-xs font-medium text-white shadow-[0_0_16px_rgba(92,83,254,0.35)] transition-all hover:brightness-110 active:scale-[0.98] sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
