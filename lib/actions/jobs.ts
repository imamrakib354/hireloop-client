import type { JobFormData } from "@/lib/types/jobformdata"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export const createJob = async (
  data: JobFormData
): Promise<{ acknowledged: boolean; insertedId?: string }> => {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error("Could not publish the job. Please try again.")
  }
  return res.json()
}

export const deleteJob = async (
  jobId: string
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Could not delete the job. Please try again.")
  }
  return res.json()
}
