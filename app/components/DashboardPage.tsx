export function DashboardPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>
        <p className="text-sm text-zinc-400">{description}</p>
      </header>
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm font-medium text-zinc-300">Coming soon</p>
        <p className="mt-2 text-sm text-zinc-500">
          This page is ready for its features to be connected.
        </p>
      </div>
      {children}
    </section>
  )
}
