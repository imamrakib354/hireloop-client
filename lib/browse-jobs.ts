import type { Job } from "@/lib/types/jobformdata"

export type JobFilters = {
  keyword: string
  types: string[]
  category: string
  minSalary: string
  maxSalary: string
  frequency: string
}

function postedAt(job: Job) {
  if (job.createdAt) {
    const date = Date.parse(job.createdAt)
    if (Number.isFinite(date)) return date
  }
  // Older jobs have no createdAt; MongoDB IDs contain their creation time.
  return /^[a-f\d]{24}$/i.test(job._id)
    ? parseInt(job._id.slice(0, 8), 16) * 1000
    : 0
}

export function filterJobs(jobs: Job[], filters: JobFilters, sort: string) {
  const keyword = filters.keyword.trim().toLowerCase()
  const filtered = jobs.filter((job) => {
    const text = `${job.title} ${job.companyName} ${job.location}`.toLowerCase()
    return (
      text.includes(keyword) &&
      (!filters.types.length || filters.types.includes(job.jobType)) &&
      (!filters.category || job.category === filters.category) &&
      (!filters.frequency || job.salaryFrequency === filters.frequency) &&
      (!filters.minSalary ||
        (job.minSalary !== "" &&
          Number(job.minSalary) >= Number(filters.minSalary))) &&
      (!filters.maxSalary ||
        (job.maxSalary !== "" &&
          Number(job.maxSalary) <= Number(filters.maxSalary)))
    )
  })

  return filtered.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title)
    if (sort === "oldest")
      return postedAt(a) - postedAt(b) || a._id.localeCompare(b._id)
    return postedAt(b) - postedAt(a) || b._id.localeCompare(a._id)
  })
}
