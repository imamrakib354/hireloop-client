import { requireDashboardRole } from "@/lib/require-dashboard-role"

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireDashboardRole("seeker")
  return children
}
