import { requireDashboardRole } from "@/lib/require-dashboard-role"

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("recruiter")
  return children
}
