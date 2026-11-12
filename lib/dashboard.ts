export type DashboardRole = "seeker" | "recruiter" | "admin"

export function isDashboardRole(role: unknown): role is DashboardRole {
  return role === "seeker" || role === "recruiter" || role === "admin"
}

export function dashboardHref(role: DashboardRole) {
  return `/dashboard/${role}`
}
