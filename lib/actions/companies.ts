import type { CompanyPayload } from "@/lib/types/company"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function createCompany(
  data: CompanyPayload
): Promise<{ acknowledged: boolean; insertedId?: string }> {
  const response = await fetch(`${BASE_URL}/companies`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...data, verificationStatus: "pending" }),
  })
  if (!response.ok)
    throw new Error("Could not create your company. Please try again.")
  return response.json()
}

export async function updateCompany(
  id: string,
  data: CompanyPayload
): Promise<{
  acknowledged: boolean
  matchedCount: number
  modifiedCount: number
}> {
  const response = await fetch(`${BASE_URL}/companies/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok)
    throw new Error("Could not update your company. Please try again.")
  return response.json()
}
