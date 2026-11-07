import Link from "next/link"

import { Button } from "@/components/ui/button"

// Replace these platform URLs with HireLoop's profiles when available.
const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971h-1.513c-1.49 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.1 24 12.073Z",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/",
    path: "M12 0a12 12 0 0 0-4.373 23.178c-.01-.949-.002-2.087.236-3.11l1.544-6.54s-.383-.766-.383-1.898c0-1.778 1.03-3.106 2.315-3.106 1.092 0 1.619.82 1.619 1.803 0 1.098-.7 2.74-1.06 4.263-.3 1.275.64 2.315 1.898 2.315 2.278 0 4.03-2.402 4.03-5.869 0-3.069-2.205-5.215-5.354-5.215-3.647 0-5.788 2.735-5.788 5.562 0 1.102.424 2.284.954 2.927.105.127.12.238.089.368l-.356 1.449c-.057.234-.185.284-.427.171-1.599-.744-2.599-3.08-2.599-4.958 0-4.038 2.934-7.747 8.458-7.747 4.44 0 7.89 3.164 7.89 7.393 0 4.412-2.782 7.964-6.644 7.964-1.297 0-2.517-.674-2.934-1.47l-.797 3.04c-.288 1.113-1.065 2.51-1.585 3.36A12 12 0 1 0 12 0Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z",
  },
] as const

const Footer = () => {
  return (
    <footer className="bg-[#100d10] text-zinc-400">
      <div className="mx-auto flex min-h-[70px] max-w-7xl flex-col items-center justify-between gap-5 px-6 py-5 sm:flex-row sm:gap-6 lg:px-8">
        <nav aria-label="Social media" className="flex items-center gap-2">
          {socialLinks.map(({ label, href, path }) => (
            <Button
              key={label}
              variant="ghost"
              size="icon"
              nativeButton={false}
              render={
                <a href={href} target="_blank" rel="noopener noreferrer" />
              }
              aria-label={`${label} (opens in a new tab)`}
              className={`rounded-lg text-zinc-400 transition-colors hover:bg-[#635bff] hover:text-white focus-visible:ring-[#8b80f9] ${
                label === "Pinterest" ? "bg-[#635bff] text-white" : "bg-white/5"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="size-4"
              >
                <path d={path} />
              </svg>
            </Button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-3 text-center text-xs sm:flex-row sm:gap-5 sm:text-left">
          <p>Copyright 2024 – Programming Hero</p>
          <nav
            aria-label="Legal"
            className="flex flex-wrap justify-center gap-x-1 gap-y-2"
          >
            <Link
              href="/terms"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b80f9]"
            >
              Terms &amp; Policy
            </Link>
            <span aria-hidden="true">-</span>
            <Link
              href="/privacy"
              className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8b80f9]"
            >
              Privacy Guideline
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
