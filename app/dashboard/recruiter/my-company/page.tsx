import { CompanyForm } from "@/app/components/CompanyForm"
import { getCompanies } from "@/lib/api/companies"
import { requireDashboardRole } from "@/lib/require-dashboard-role"

export default async function MyCompanyPage() {
  const user = await requireDashboardRole("recruiter")
  let companies
  try {
    companies = await getCompanies()
  } catch {
    return (
      <section className="space-y-4 rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-zinc-100">
        <h1 className="text-xl font-semibold">My Company</h1>
        <p role="alert" className="text-sm text-red-300">
          We couldn&apos;t load your company. Please try again before creating
          or editing a profile.
        </p>
        <a
          href="/dashboard/recruiter/my-company"
          className="inline-block text-sm text-violet-300 underline underline-offset-4"
        >
          Try again
        </a>
      </section>
    )
  }
  const company =
    companies.find((company) => company.recruiterId === user.id) ?? null

  return <CompanyForm company={company} recruiterId={user.id} />
}
