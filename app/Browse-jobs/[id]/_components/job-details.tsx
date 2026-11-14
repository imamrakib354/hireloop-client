import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Gift,
  MapPin,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { JobCompanyOverview } from "./company-overview"
import { deadlineDetails, formatCompensation } from "@/lib/job-display"
import type { Company } from "@/lib/types/company"
import type { Job } from "@/lib/types/jobformdata"

export function JobDetails({
  job,
  company,
  companyError = false,
}: {
  job: Job
  company: Company | null
  companyError?: boolean
}) {
  const deadline = deadlineDetails(job.deadline)
  const benefits = company?.benefits?.[job.jobType] ?? []
  const companyName =
    company?.name || job.companyName || "Company not specified"
  const location = job.isRemote
    ? job.location
      ? `${job.location} (Remote)`
      : "Worldwide (Remote)"
    : job.location || "Not specified"

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl space-y-5 px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-2 text-xs text-zinc-500"
        >
          <Link
            href="/Browse-jobs"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm outline-none hover:text-violet-300 focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Browse Jobs
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden="true" />
          <span aria-current="page" className="truncate text-zinc-400">
            {job.title || "Job Details"}
          </span>
        </nav>

        <Card className="border border-white/[0.07] bg-[#141416] py-0 text-zinc-100 ring-0">
          <CardContent className="flex flex-col justify-between gap-6 p-5 sm:p-7 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#202023] sm:size-16">
                {company?.logoUrl ? (
                  <Image
                    src={company.logoUrl}
                    alt={`${companyName} logo`}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-contain p-2"
                  />
                ) : (
                  <Building2
                    className="size-7 text-violet-400"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl leading-snug font-semibold tracking-tight break-words sm:text-2xl">
                  {job.title || "Untitled job"}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-400">
                  <span className="break-words">{companyName}</span>
                  {company?.verificationStatus === "verified" && (
                    <Badge
                      variant="outline"
                      className="gap-1 rounded-md border-emerald-400/15 bg-emerald-400/5 text-[10px] font-normal text-emerald-400"
                    >
                      <BadgeCheck aria-hidden="true" />
                      Verified Employer
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.category && (
                    <Badge
                      variant="outline"
                      className="h-auto max-w-full rounded-md border-violet-400/15 bg-violet-400/5 py-1 text-[10px] font-normal whitespace-normal text-violet-300"
                    >
                      {job.category}
                    </Badge>
                  )}
                  {deadline.status !== "—" && (
                    <Badge
                      variant="outline"
                      className={
                        deadline.status === "Open"
                          ? "h-auto rounded-md border-emerald-400/15 bg-emerald-400/5 py-1 text-[10px] font-normal text-emerald-400"
                          : "h-auto rounded-md border-white/10 bg-white/5 py-1 text-[10px] font-normal text-zinc-500"
                      }
                    >
                      {deadline.status === "Open"
                        ? "Open position"
                        : "Applications closed"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="shrink-0 space-y-2 lg:text-right">
              <div className="flex gap-2 lg:justify-end">
                <Button
                  type="button"
                  disabled
                  size="icon"
                  aria-label="Bookmark job (coming soon)"
                  aria-describedby="job-actions-note"
                  className="size-10 border border-white/10 bg-[#252529] text-zinc-300 disabled:opacity-60"
                >
                  <Bookmark className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  disabled
                  aria-describedby="job-actions-note"
                  className="h-10 bg-[#6757ff] px-6 text-xs text-white disabled:opacity-60"
                >
                  Apply Now
                </Button>
              </div>
              <p id="job-actions-note" className="text-[10px] text-zinc-600">
                Applications and bookmarks are coming soon.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-5">
            <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Salary range",
                  value: formatCompensation(
                    job.minSalary,
                    job.maxSalary,
                    job.salaryFrequency
                  ),
                  icon: Banknote,
                },
                { label: "Location", value: location, icon: MapPin },
                {
                  label: "Job type",
                  value: job.jobType || "Not specified",
                  icon: BriefcaseBusiness,
                },
                {
                  label: "Apply before",
                  value: deadline.label,
                  icon: CalendarDays,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.07] bg-[#141416] p-4"
                >
                  <Icon
                    className="mb-2.5 size-4 text-violet-300"
                    aria-hidden="true"
                  />
                  <dt className="text-[9px] tracking-wider text-zinc-500 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-xs leading-relaxed font-medium break-words text-zinc-200">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <Card className="border border-white/[0.07] bg-[#141416] py-0 text-zinc-100 ring-0">
              <CardContent className="divide-y divide-white/[0.07] px-5 sm:px-7">
                <section className="py-6">
                  <h2 className="text-base font-semibold">About the Role</h2>
                  <p className="mt-3 text-sm leading-7 break-words text-zinc-400">
                    {companyName} is hiring for the {job.title || "advertised"}{" "}
                    position. Review the responsibilities and requirements below
                    to learn more about this opportunity.
                  </p>
                </section>
                <section className="py-6">
                  <h2 className="text-base font-semibold">Responsibilities</h2>
                  <p className="mt-4 text-sm leading-7 break-words whitespace-pre-wrap text-zinc-400">
                    {job.responsibilities ||
                      "The employer has not provided responsibilities for this role."}
                  </p>
                </section>
                <section className="py-6">
                  <h2 className="text-base font-semibold">Requirements</h2>
                  <p className="mt-4 text-sm leading-7 break-words whitespace-pre-wrap text-zinc-400">
                    {job.requirements ||
                      "The employer has not provided additional requirements."}
                  </p>
                </section>
                <section className="py-6">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Gift
                      className="size-4 text-violet-400"
                      aria-hidden="true"
                    />
                    Employee Benefits
                  </h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    Benefits for {job.jobType || "this employment type"}
                  </p>
                  {benefits.length ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex min-w-0 items-start gap-3 rounded-lg border border-white/5 bg-white/[0.015] p-3"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-400/10 text-violet-300">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                          <span className="pt-1 text-xs leading-relaxed break-words text-zinc-300">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-zinc-500">
                      {companyError
                        ? "Company benefits are temporarily unavailable."
                        : "The employer has not listed benefits for this employment type yet."}
                    </p>
                  )}
                </section>
              </CardContent>
            </Card>
          </div>
          <aside
            aria-label="About the employer"
            className="min-w-0 lg:sticky lg:top-28"
          >
            <JobCompanyOverview
              company={company}
              companyName={companyName}
              unavailable={companyError}
            />
          </aside>
        </div>
      </div>
    </main>
  )
}
