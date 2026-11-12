import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/getUserSession"
import { dashboardHref, isDashboardRole } from "@/lib/dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user || !isDashboardRole(user.role)) redirect("/sign-in")
  redirect(dashboardHref(user.role))
}
