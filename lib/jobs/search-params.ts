import type { Job } from "@/lib/types/jobformdata"

export const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]

export type JobSearchParams = {
  search: string
  jobTypes: string[]
  category: string
  minSalary: string
  maxSalary: string
  salaryFrequency: string
  isRemote: string
  sort: string
  page: number
}

export type RawSearchParams = Record<string, string | string[] | undefined>

function text(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

function salary(value: string | string[] | undefined) {
  const amount = text(value)
  return amount && Number.isFinite(Number(amount)) && Number(amount) >= 0
    ? amount
    : ""
}

export function readJobSearchParams(raw: RawSearchParams): JobSearchParams {
  const types = Array.isArray(raw.jobType) ? raw.jobType : [raw.jobType]
  const page = Number(text(raw.page))
  const sort = text(raw.sort)
  const frequency = text(raw.salaryFrequency)
  const remote = text(raw.isRemote)

  return {
    search: text(raw.search).slice(0, 200),
    jobTypes: [
      ...new Set(
        types.filter(
          (type): type is string =>
            typeof type === "string" && JOB_TYPES.includes(type)
        )
      ),
    ],
    category: text(raw.category).slice(0, 100),
    minSalary: salary(raw.minSalary),
    maxSalary: salary(raw.maxSalary),
    salaryFrequency: ["hourly", "monthly", "yearly"].includes(frequency)
      ? frequency
      : "",
    isRemote: ["true", "false"].includes(remote) ? remote : "",
    sort: ["newest", "oldest", "title"].includes(sort) ? sort : "newest",
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  }
}

// Only database filters go to Express. Sorting and pagination stay in the UI.
export function jobFiltersQuery(filters: JobSearchParams) {
  const params = new URLSearchParams()
  for (const key of [
    "search",
    "category",
    "minSalary",
    "maxSalary",
    "salaryFrequency",
    "isRemote",
  ] as const) {
    if (filters[key]) params.set(key, filters[key])
  }
  for (const type of filters.jobTypes) params.append("jobType", type)
  return params.toString()
}

export function updateJobQuery(
  current: string,
  changes: Record<string, string | string[]>,
  resetPage = true
) {
  const params = new URLSearchParams(current)
  for (const [key, value] of Object.entries(changes)) {
    params.delete(key)
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item.trim()) params.append(key, item.trim())
    }
  }
  if (resetPage) params.delete("page")
  return params.toString()
}

function postedAt(job: Job) {
  const date = job.createdAt ? Date.parse(job.createdAt) : NaN
  if (Number.isFinite(date)) return date
  return /^[a-f\d]{24}$/i.test(job._id)
    ? parseInt(job._id.slice(0, 8), 16) * 1000
    : 0
}

export function sortJobs(jobs: Job[], sort: string) {
  return [...jobs].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title)
    if (sort === "oldest")
      return postedAt(a) - postedAt(b) || a._id.localeCompare(b._id)
    return postedAt(b) - postedAt(a) || b._id.localeCompare(a._id)
  })
}
