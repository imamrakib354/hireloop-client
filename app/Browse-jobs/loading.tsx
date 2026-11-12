import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingJobs() {
  return (
    <main
      aria-label="Loading jobs"
      aria-busy="true"
      className="min-h-screen bg-[#09090b] px-3 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <p role="status" className="text-sm text-zinc-400">
          Loading opportunities…
        </p>
        <Skeleton className="h-20 rounded-xl bg-white/5" />
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Skeleton className="hidden h-96 rounded-xl bg-white/5 lg:block" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-36 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
