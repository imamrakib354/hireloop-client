export type UserRole = "seeker" | "recruiter" | "admin"

export type AuthFormData = {
  email: string
  password: string
  name?: string
  role?: UserRole
}
