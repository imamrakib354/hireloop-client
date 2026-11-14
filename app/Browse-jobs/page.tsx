import {
  getJobs,
  getJobFilterOptions,
  type JobFilterOptions,
} from "@/lib/api/jobs"
import type { Job } from "@/lib/types/jobformdata"
import { BrowseJobs } from "./_components/browse-jobs"
import {
  readJobSearchParams,
  jobFiltersQuery,
  type RawSearchParams,
} from "@/lib/jobs/search-params"

export default async function BrowseJobsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const filters = readJobSearchParams(await searchParams)
  let jobs: Job[] = []
  let error = ""
  let options: JobFilterOptions = { categories: [], jobTypeCounts: {} }
  let optionsError = ""

  const [jobsResult, optionsResult] = await Promise.allSettled([
    getJobs(jobFiltersQuery(filters)),
    getJobFilterOptions(),
  ])
  if (jobsResult.status === "fulfilled") jobs = jobsResult.value
  else error = "We couldn't load the jobs. Please try again."
  if (optionsResult.status === "fulfilled") options = optionsResult.value
  else optionsError = "We couldn't load filter options. Please try again."

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <BrowseJobs
        jobs={jobs}
        filters={filters}
        options={options}
        error={error}
        optionsError={optionsError}
      />
    </main>
  )
}
