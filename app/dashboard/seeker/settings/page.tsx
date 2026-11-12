import { DashboardPage } from "@/app/components/DashboardPage"

export default function SettingsPage() {
  return (
    <DashboardPage
      title="Settings"
      description="Manage your profile and account preferences."
    >
      <section
        id="resume"
        className="scroll-mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6"
      >
        <h2 className="text-lg font-medium text-zinc-100">Resume</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Resume uploads will be available here once the upload feature is
          connected.
        </p>
      </section>
    </DashboardPage>
  )
}
