import Image from "next/image"
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Star,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { HoverLift } from "@/components/hover-lift"
import { Input } from "@/components/ui/input"

const trendingPositions = [
  "Product Designer",
  "AI Engineering",
  "Dev-ops Engineer",
]
const statistics = [
  { value: "50K", label: "Active Jobs", icon: BriefcaseBusiness },
  { value: "12K", label: "Companies", icon: Building2 },
  { value: "2M", label: "Job Seekers", icon: UsersRound },
  { value: "97%", label: "Satisfaction Rate", icon: Star },
]

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:px-8 lg:pt-36"
    >
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mx-auto flex w-fit items-center gap-3 before:hidden before:h-px before:w-16 before:bg-gradient-to-r before:from-transparent before:to-white/15 after:hidden after:h-px after:w-16 after:bg-gradient-to-l after:from-transparent after:to-white/15 sm:before:block sm:after:block">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[10px] shadow-[inset_0_1px_0_#ffffff0d] sm:px-5 sm:text-sm">
            <span aria-hidden="true" className="mr-1 text-base">
              💼
            </span>
            <span className="font-bold text-white">50,000+</span>
            <span className="text-[#a5999c]">NEW JOBS THIS MONTH</span>
          </p>
        </div>

        <h1
          id="hero-heading"
          className="mt-8 text-4xl leading-[1.12] font-semibold tracking-[-0.045em] text-[#fff5f5] sm:text-5xl lg:text-[58px]"
        >
          Find Your Dream Job Today
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 font-normal text-[#b8adb1] sm:text-base sm:leading-7">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster.
        </p>

        <div
          role="search"
          aria-label="Find jobs"
          className="mt-9 flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.055] p-2 text-left shadow-[inset_0_1px_0_#ffffff08] backdrop-blur-sm sm:mt-12 sm:flex-row sm:items-center sm:gap-0"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-3">
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-zinc-200"
              strokeWidth={1.5}
            />
            <Input
              aria-label="Job title, skill or company"
              placeholder="Job title, skill or company"
              className="h-11 rounded-lg border-0 bg-transparent px-0 text-sm text-white shadow-none ring-offset-0 placeholder:text-[#bfb3b7] focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
          <div
            aria-hidden="true"
            className="mx-4 hidden h-6 w-px bg-white/15 sm:block"
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-3 sm:pl-0">
            <MapPin
              aria-hidden="true"
              className="size-5 shrink-0 text-zinc-200"
              strokeWidth={1.5}
            />
            <Input
              aria-label="Location or Remote"
              placeholder="Location or Remote"
              className="h-11 rounded-lg border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-[#bfb3b7] focus-visible:ring-0 dark:bg-transparent"
            />
          </div>
          <HoverLift className="w-full sm:w-auto">
            <Button
              type="button"
              aria-label="Search jobs"
              className="h-11 w-full rounded-xl bg-[#6c50ff] text-white transition-colors duration-300 hover:bg-[#5438d6] hover:text-white group-hover/hover-lift:bg-[#5438d6] focus-visible:ring-[#c4b5fd] active:translate-y-0 sm:size-11"
            >
              <Search aria-hidden="true" className="size-6" strokeWidth={1.5} />
              <span className="sm:hidden">Search jobs</span>
            </Button>
          </HoverLift>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="mr-2 text-[#b5a8ae]">Trending Position</span>
          {trendingPositions.map((position) => (
            <span
              key={position}
              className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[#ded3d8]"
            >
              {position}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-10 pt-36 sm:mt-12 sm:pt-56 lg:pt-64">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 -z-10 h-[620px] w-[800px] max-w-none -translate-x-1/2 sm:-top-28 sm:h-[900px] sm:w-[1160px]"
        >
          <Image
            src="/images/globe.png"
            alt=""
            fill
            sizes="(max-width: 640px) 800px, 1160px"
            className="[mask-image:linear-gradient(to_bottom,transparent_15%,black_35%,black_65%,transparent_95%)] object-fill"
          />
        </div>

        <h2 className="mx-auto max-w-md text-center text-xl leading-snug font-normal tracking-tight text-[#e9e0f4] sm:text-3xl">
          Assisting over <span className="text-white">15,000 job seekers</span>{" "}
          find their dream positions.
        </h2>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
          {statistics.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex min-h-40 flex-col rounded-xl border border-white/10 bg-[#22181d]/70 p-5 shadow-[inset_0_1px_0_#ffffff05] backdrop-blur-xl sm:min-h-48 sm:p-6"
            >
              <Icon
                aria-hidden="true"
                className="size-4 text-[#dfd1da]"
                strokeWidth={1.5}
              />
              <p className="mt-8 text-3xl font-medium tracking-tight sm:text-4xl">
                {value}
              </p>
              <p className="mt-2 text-xs text-[#c7bbc2]">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
