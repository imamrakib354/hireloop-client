import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function JobNotFound() {
  return (
    <main className="min-h-[65vh] bg-[#09090b] px-4 py-20 text-zinc-100">
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[#141416] p-8 text-center">
        <SearchX
          className="mx-auto mb-4 size-10 text-violet-400"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold">Job not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          This listing may have been removed or the link may be incorrect.
          Browse the latest opportunities instead.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/Browse-jobs" />}
          className="mt-6 bg-[#6757ff] text-white hover:bg-[#796aff]"
        >
          Browse Jobs
        </Button>
      </div>
    </main>
  )
}
