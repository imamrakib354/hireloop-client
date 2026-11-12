import type { Job } from "@/lib/types/jobformdata"

type StoredJob = Omit<Job, "minSalary" | "maxSalary" | "salaryFrequency"> & {
  minSalary: string | number
  maxSalary: string | number
  salaryFrequency?: string
  frequency?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export const getJobs = async (): Promise<Job[]> => {
  const res = await fetch(`${BASE_URL}/jobs`, { cache: "no-store" })
  if (!res.ok) throw new Error("Could not load jobs. Please try again.")
  const data: StoredJob[] = await res.json()
  if (!Array.isArray(data)) throw new Error("The jobs response is invalid.")

  return data.map((job) => ({
    ...job,
    minSalary: String(job.minSalary ?? ""),
    maxSalary: String(job.maxSalary ?? ""),
    salaryFrequency: job.salaryFrequency || job.frequency || "",
  }))
}
