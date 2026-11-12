import type { JobType } from "@/lib/types/jobformdata"

export type CompanyFormData = {
  name: string
  tagline: string
  industry: string
  size: string
  location: string
  website: string
  email: string
  phone: string
  overview: string
  logoUrl: string
  coverUrl: string
  benefits: Record<JobType, string[]>
}

export type Company = CompanyFormData & {
  _id: string
  recruiterId: string
  verificationStatus?: "pending" | "verified" | "rejected"
  createdAt?: string
  updatedAt?: string
}

export type CompanyPayload = CompanyFormData & {
  recruiterId: string
  createdAt?: string
  updatedAt: string
}
