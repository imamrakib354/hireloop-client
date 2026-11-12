import Link from "next/link"
import {
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Code2,
  Headset,
  MapPin,
  Megaphone,
  PencilRuler,
  Settings2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCompensation } from "@/lib/job-display"
import type { Job } from "@/lib/types/jobformdata"

const categoryIcons = [
  { category: "Engineering & Tech", icon: Code2, color: "text-violet-400" },
  {
    category: "Design & Creative",
    icon: PencilRuler,
    color: "text-orange-400",
  },
  { category: "Marketing & Sales", icon: Megaphone, color: "text-purple-300" },
  {
    category: "Business & Finance",
    icon: ChartNoAxesCombined,
    color: "text-emerald-400",
  },
  { category: "Customer Support", icon: Headset, color: "text-pink-400" },
  { category: "Operations", icon: Settings2, color: "text-amber-400" },
]

export function BrowseCard({ job }: { job: Job }) {
  const category = categoryIcons.find((item) => item.category === job.category)
  const Icon = category?.icon ?? BriefcaseBusiness

  return (
    <Card className="group border border-white/[0.07] bg-[#141416] py-0 text-zinc-100 ring-0 transition-colors hover:border-violet-400/30 hover:bg-[#18181c]">
      <CardContent className="flex items-start gap-3 p-4 sm:gap-5 sm:p-6">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-[#222226] sm:size-14 ${category?.color ?? "text-zinc-400"}`}
        >
          <Icon className="size-5 sm:size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold break-words sm:text-lg">
            <Link
              href={`/jobs/${job._id}`}
              className="rounded-sm transition-colors outline-none hover:text-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {job.title || "Untitled job"}
            </Link>
          </h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 sm:text-sm">
            <span className="break-words">
              {job.companyName || "Company not specified"}
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              •
            </span>
            <span className="inline-flex min-w-0 items-start gap-1">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words">
                {job.location || (job.isRemote ? "Worldwide" : "Not specified")}
                {job.isRemote && " (Remote)"}
              </span>
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="h-auto max-w-full rounded-md border-white/10 bg-white/[0.025] px-2 py-1 text-[11px] font-normal whitespace-normal text-zinc-200"
            >
              <Banknote aria-hidden="true" />
              {formatCompensation(
                job.minSalary,
                job.maxSalary,
                job.salaryFrequency
              )}
            </Badge>
            <Badge
              variant="outline"
              className="h-auto rounded-md border-white/10 bg-white/[0.025] px-2 py-1 text-[11px] font-normal text-zinc-300"
            >
              <BriefcaseBusiness aria-hidden="true" />{" "}
              {job.jobType || "Not specified"}
            </Badge>
            {job.category && (
              <Badge
                variant="outline"
                className="h-auto max-w-full rounded-md border-violet-400/15 bg-violet-400/5 px-2 py-1 text-[11px] font-normal break-words whitespace-normal text-violet-300"
              >
                {job.category}
              </Badge>
            )}
          </div>
        </div>
        <Link
          href={`/jobs/${job._id}`}
          aria-label={`View details for ${job.title}`}
          className="hidden size-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors outline-none hover:bg-violet-400/10 hover:text-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400 sm:flex"
        >
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
