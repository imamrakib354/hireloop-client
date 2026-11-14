import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { JobDetails } from "./_components/job-details"
import { Button } from "@/components/ui/button"
import { getJob } from "@/lib/api/jobs"
import { getCompanies } from "@/lib/api/companies"
import type { Company } from "@/lib/types/company"
import type { Job } from "@/lib/types/jobformdata"

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let job: Job | null

  try {
    job = await getJob(id)
  } catch {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 py-12 text-zinc-100">
        <div
          role="alert"
          className="mx-auto max-w-xl rounded-xl border border-red-400/20 bg-[#141416] p-8 text-center"
        >
          <h1 className="text-xl font-semibold">
            We couldn&apos;t load this job
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            The service may be temporarily unavailable. Please try again.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<a href={`/Browse-jobs/${encodeURIComponent(id)}`} />}
              className="bg-[#6757ff] text-white hover:bg-[#796aff]"
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/Browse-jobs" />}
              variant="outline"
              className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" />
              Browse Jobs
            </Button>
          </div>
        </div>
      </main>
    )
  }
  if (!job) notFound()

  let company: Company | null = null
  let companyError = false
  if (job.recruiterId) {
    try {
      const companies = await getCompanies()
      company =
        companies.find((company) => company.recruiterId === job.recruiterId) ??
        null
    } catch {
      companyError = true
    }
  }

  return <JobDetails job={job} company={company} companyError={companyError} />
}
