import "server-only"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/getUserSession"
import {
  dashboardHref,
  isDashboardRole,
  type DashboardRole,
} from "@/lib/dashboard"

export async function requireDashboardRole(role: DashboardRole) {
  const user = await getCurrentUser()
  if (!user || !isDashboardRole(user.role)) redirect("/sign-in")
  if (user.role !== role) redirect(dashboardHref(user.role))
  return user
}
