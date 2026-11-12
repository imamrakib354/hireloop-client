import { requireDashboardRole } from "@/lib/require-dashboard-role"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("admin")
  return children
}
