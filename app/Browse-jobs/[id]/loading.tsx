import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingJobDetails() {
  return (
    <main
      aria-busy="true"
      className="min-h-screen bg-[#09090b] px-3 py-10 sm:px-6"
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <p role="status" className="text-sm text-zinc-400">
          Loading job details…
        </p>
        <Skeleton className="h-40 rounded-xl bg-white/5" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-28 rounded-xl bg-white/5" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-xl bg-white/5" />
          </div>
          <Skeleton className="h-96 rounded-xl bg-white/5" />
        </div>
      </div>
    </main>
  )
}
