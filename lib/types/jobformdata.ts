export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship"

export type JobFormData = {
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
