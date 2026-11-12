import {
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CloudCog,
  Code2,
  Globe2,
  Headset,
  MapPin,
  Megaphone,
  PencilRuler,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Job } from "@/lib/types/jobformdata"
import { deadlineDetails, formatCompensation } from "@/lib/job-display"
import { JobActions } from "./job-actions"

const categoryStyles: Record<string, { icon: LucideIcon; color: string }> = {
  "engineering & tech": { icon: Code2, color: "text-[#7964ff]" },
  engineering: { icon: Code2, color: "text-[#7964ff]" },
  "design & creative": { icon: PencilRuler, color: "text-orange-500" },
  design: { icon: PencilRuler, color: "text-orange-500" },
  "marketing & sales": { icon: Megaphone, color: "text-violet-300" },
  marketing: { icon: Megaphone, color: "text-violet-300" },
  "business & finance": {
    icon: ChartNoAxesCombined,
    color: "text-emerald-400",
  },
  "customer support": { icon: Headset, color: "text-pink-400" },
  operations: { icon: Settings2, color: "text-amber-400" },
  infrastructure: { icon: CloudCog, color: "text-sky-400" },
  quality: { icon: BadgeCheck, color: "text-indigo-400" },
}

function JobTitle({ job }: { job: Job }) {
  const { icon: Icon, color } = Object.hasOwn(
    categoryStyles,
    job.category?.trim().toLowerCase() ?? ""
  )
    ? categoryStyles[job.category.trim().toLowerCase()]
    : { icon: BriefcaseBusiness, color: "text-zinc-400" }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#202023] ${color}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="font-medium break-words text-zinc-100">
          {job.title || "Untitled job"}
        </p>
        <p className={`mt-1 text-[11px] break-words ${color}`}>
          {job.category || "—"}
        </p>
      </div>
    </div>
  )
}

function CompanyLocation({ job }: { job: Job }) {
  const Icon = job.isRemote ? Globe2 : MapPin
  return (
    <div className="min-w-0">
      <p className="break-words text-zinc-200">{job.companyName || "—"}</p>
      <p className="mt-1 flex items-start gap-1 text-[11px] text-zinc-500">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="break-words">
          {job.isRemote
            ? job.location
              ? `Remote (${job.location})`
              : "Remote"
            : job.location || "—"}
        </span>
      </p>
    </div>
  )
}

function JobStatus({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${status === "Open" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-500"}`}
    >
      <span
        className={`size-1 rounded-full ${status === "Open" ? "bg-emerald-400" : "bg-zinc-500"}`}
        aria-hidden="true"
      />
      {status}
    </span>
  )
}

export function JobList({ jobs }: { jobs: Job[] }) {
  // Use one server-side timestamp for every row's deadline-based status.
  const now = new Date()
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
        <Table className="min-w-[1060px] text-xs">
          <caption className="sr-only">
            Job listings. Open and expired statuses are based on the application
            deadline. Applicant counts are not available yet.
          </caption>
          <TableHeader className="bg-[#0c0c0e]">
            <TableRow className="border-white/5 hover:bg-transparent">
              {[
                "Job Title & Dept",
                "Company & Location",
                "Type",
                "Compensation",
                "Applicants",
                "Status",
                "Deadline",
                "Actions",
              ].map((heading) => (
                <TableHead
                  key={heading}
                  scope="col"
                  className={`h-12 px-4 text-[10px] font-medium tracking-wider text-zinc-400 uppercase ${heading === "Actions" ? "text-right" : ""}`}
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#141416]">
            {jobs.map((job) => {
              const deadline = deadlineDetails(job.deadline, now)
              return (
                <TableRow
                  key={job._id}
                  className="border-white/5 hover:bg-white/[0.025]"
                >
                  <TableCell className="max-w-64 px-4 py-5 whitespace-normal">
                    <JobTitle job={job} />
                  </TableCell>
                  <TableCell className="max-w-60 px-4 py-5 whitespace-normal">
                    <CompanyLocation job={job} />
                  </TableCell>
                  <TableCell className="px-4 py-5">
                    <span className="inline-flex rounded-full bg-white/5 px-3 py-1.5 text-[10px] text-zinc-300">
                      {job.jobType || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-5 text-zinc-200">
                    {formatCompensation(
                      job.minSalary,
                      job.maxSalary,
                      job.salaryFrequency
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-5">
                    <span
                      className="flex items-center gap-1.5 text-violet-300"
                      aria-label="Applicant count unavailable"
                    >
                      <Users className="size-4" aria-hidden="true" /> —
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-5">
                    <JobStatus status={deadline.status} />
                  </TableCell>
                  <TableCell className="px-4 py-5 text-zinc-200">
                    {deadline.label}
                  </TableCell>
                  <TableCell className="px-4 py-5">
                    <div className="flex justify-end">
                      <JobActions jobId={job._id} title={job.title} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {jobs.map((job) => {
          const deadline = deadlineDetails(job.deadline, now)
          return (
            <article
              key={job._id}
              className="min-w-0 space-y-4 rounded-xl border border-white/10 bg-[#141416] p-4 text-xs"
            >
              <JobTitle job={job} />
              <CompanyLocation job={job} />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-[10px] text-zinc-500 uppercase">Type</dt>
                  <dd className="mt-1 text-zinc-300">{job.jobType || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-zinc-500 uppercase">
                    Compensation
                  </dt>
                  <dd className="mt-1 break-words text-zinc-200">
                    {formatCompensation(
                      job.minSalary,
                      job.maxSalary,
                      job.salaryFrequency
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-zinc-500 uppercase">
                    Applicants
                  </dt>
                  <dd
                    className="mt-1 text-violet-300"
                    aria-label="Applicant count unavailable"
                  >
                    —
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-zinc-500 uppercase">
                    Deadline
                  </dt>
                  <dd className="mt-1 text-zinc-200">{deadline.label}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                <JobStatus status={deadline.status} />
                <JobActions jobId={job._id} title={job.title} />
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
