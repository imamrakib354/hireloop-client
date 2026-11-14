import type { Job } from "@/lib/types/jobformdata"

type StoredJob = Omit<Job, "minSalary" | "maxSalary" | "salaryFrequency"> & {
  minSalary: string | number
  maxSalary: string | number
  salaryFrequency?: string
  frequency?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

function normalizeJob(job: StoredJob): Job {
  return {
    ...job,
    minSalary: String(job.minSalary ?? ""),
    maxSalary: String(job.maxSalary ?? ""),
    salaryFrequency: job.salaryFrequency || job.frequency || "",
  }
}

export const getJobs = async (query = ""): Promise<Job[]> => {
  const res = await fetch(`${BASE_URL}/jobs${query ? `?${query}` : ""}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error("Could not load jobs. Please try again.")
  const data: StoredJob[] = await res.json()
  if (!Array.isArray(data)) throw new Error("The jobs response is invalid.")

  return data.map(normalizeJob)
}

export type JobFilterOptions = {
  categories: string[]
  jobTypeCounts: Record<string, number>
}

export async function getJobFilterOptions(): Promise<JobFilterOptions> {
  const response = await fetch(`${BASE_URL}/jobs/filters`, {
    cache: "no-store",
  })
  if (!response.ok) throw new Error("Could not load job filter options.")
  const data = await response.json()
  if (
    !data ||
    !Array.isArray(data.categories) ||
    !data.categories.every(
      (category: unknown) => typeof category === "string"
    ) ||
    !data.jobTypeCounts ||
    typeof data.jobTypeCounts !== "object" ||
    Array.isArray(data.jobTypeCounts) ||
    !Object.values(data.jobTypeCounts).every(
      (count) =>
        typeof count === "number" && Number.isInteger(count) && count >= 0
    )
  )
    throw new Error("The job filter options response is invalid.")
  return data
}

export async function getJob(id: string): Promise<Job | null> {
  const response = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  })
  if (response.status === 404) return null
  if (!response.ok)
    throw new Error("Could not load this job. Please try again.")
  const job: StoredJob | null = await response.json()
  if (!job) return null
  if (typeof job._id !== "string")
    throw new Error("The job response is invalid.")
  return normalizeJob(job)
}
