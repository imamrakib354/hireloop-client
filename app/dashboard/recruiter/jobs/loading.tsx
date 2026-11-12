export default function LoadingJobs() {
  return (
    <div role="status" aria-label="Loading jobs" className="space-y-6">
      <p className="text-sm text-zinc-400">Loading jobs…</p>
      <div className="animate-pulse rounded-xl border border-white/10 bg-[#141416] p-4 motion-reduce:animate-none">
        {[1, 2, 3].map((row) => (
          <div key={row} className="my-3 h-14 rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  )
}
