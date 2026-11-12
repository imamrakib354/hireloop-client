import type { Company } from "@/lib/types/company"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export async function getCompanies(): Promise<Company[]> {
  const response = await fetch(`${BASE_URL}/companies`, { cache: "no-store" })
  if (!response.ok)
    throw new Error("Could not load your company. Please try again.")
  const companies = await response.json()
  if (!Array.isArray(companies))
    throw new Error("The companies response is invalid.")
  return companies
}
