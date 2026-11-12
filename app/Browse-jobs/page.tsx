import { getJobs } from "@/lib/api/jobs"
import type { Job } from "@/lib/types/jobformdata"
import { BrowseJobs } from "@/app/components/BrowseJobs"

export default async function BrowseJobsPage() {
  let jobs: Job[] = []
  let error = ""

  try {
    jobs = await getJobs()
  } catch {
    error = "We couldn't load the jobs. Please try again."
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <BrowseJobs jobs={jobs} error={error} />
    </main>
  )
}
