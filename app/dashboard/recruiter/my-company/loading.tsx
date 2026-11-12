import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingCompany() {
  return (
    <div aria-busy="true" className="space-y-5">
      <p role="status" className="text-sm text-zinc-400">
        Loading your company…
      </p>
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-44 rounded-xl bg-white/5" />
      ))}
    </div>
  )
}
