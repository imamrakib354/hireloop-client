import Link from "next/link"
import { ChevronRight, Plus } from "lucide-react"
import { getJobs } from "@/lib/api/jobs"
import { getCurrentUser } from "@/lib/getUserSession"
import type { Job } from "@/lib/types/jobformdata"
import { JobList } from "./job-list"

export default async function ManageJobsPage() {
  const user = await getCurrentUser()
  let jobs: Job[] = []
  let error = ""
  try {
    if (user) {
      const allJobs = await getJobs()
      jobs = allJobs.filter((job) => job.recruiterId === user.id)
    }
  } catch {
    error = "We couldn't load your job listings. Please try again."
  }

  return (
    <section className="-m-4 min-h-full space-y-6 bg-[#111113] p-4 sm:-m-6 sm:p-6 lg:py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex items-center gap-1 text-xs text-zinc-500"
          >
            <span>Manage Jobs</span>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span aria-current="page" className="text-violet-300">
              Job Listings &amp; Postings
            </span>
          </nav>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Manage Job Posts
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Review live listings, monitor applicants, and update job details
            across your organization.
          </p>
        </div>
        <Link
          href="/dashboard/recruiter/jobs/new"
          className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-lg bg-[#6757ff] px-4 text-xs font-medium text-white outline-none hover:bg-[#796aff] focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <Plus className="size-4" aria-hidden="true" /> New Job Post
        </Link>
      </header>
      {error ? (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300"
        >
          <p>{error}</p>
          <a
            href="/dashboard/recruiter/jobs"
            className="inline-block rounded-md border border-red-400/20 px-3 py-2 text-xs outline-none hover:bg-red-400/10 focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Try again
          </a>
        </div>
      ) : jobs.length ? (
        <>
          <p className="sr-only">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}. Status is based
            on the application deadline.
          </p>
          <JobList jobs={jobs} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#141416] p-10 text-center">
          <h2 className="text-sm font-medium text-zinc-200">
            No jobs posted yet
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Post your first job to see it here.
          </p>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="mt-4 inline-block text-sm text-violet-300 underline underline-offset-4"
          >
            Create a job listing
          </Link>
        </div>
      )}
    </section>
  )
}
