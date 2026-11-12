export type JobType =
  "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance"

export type JobFormData = {
  recruiterId: string
  createdAt?: string
  title: string
  companyName: string
  category: string
  jobType: JobType
  isRemote: boolean
  location: string
  deadline: string
  minSalary: string
  maxSalary: string
  salaryFrequency: string
  responsibilities: string
  requirements: string
}

export type Job = JobFormData & { _id: string }
