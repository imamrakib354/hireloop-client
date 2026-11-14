import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { Job } from "@/lib/types/jobformdata"
import { BrowseCard } from "./job-card"
import { JobPagination } from "./job-pagination"

export function JobResults({
  jobs,
  page,
  sort,
  hasFilters,
  onSort,
  onPage,
  onReset,
}: {
  jobs: Job[]
  page: number
  sort: string
  hasFilters: boolean
  onSort: (value: string) => void
  onPage: (page: number) => void
  onReset: () => void
}) {
  const visibleJobs = jobs.slice((page - 1) * 6, page * 6)
  return (
    <section aria-label="Job results" className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 aria-live="polite" className="text-sm font-medium sm:text-base">
          Found{" "}
          <span className="font-semibold text-white">
            {jobs.length.toLocaleString("en-US")}
          </span>{" "}
          {jobs.length === 1 ? "Professional Job" : "Professional Jobs"}
        </h2>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="job-sort"
            className="text-[11px] font-normal text-zinc-500"
          >
            Sort by:
          </Label>
          <NativeSelect
            id="job-sort"
            value={sort}
            onChange={(event) => onSort(event.target.value)}
            className="rounded-lg bg-[#141416] text-xs text-zinc-300 [&_option]:bg-[#141416] [&_option]:text-zinc-200 [&_select]:border-white/10"
          >
            <NativeSelectOption value="newest">Most Recent</NativeSelectOption>
            <NativeSelectOption value="oldest">Oldest First</NativeSelectOption>
            <NativeSelectOption value="title">Title A–Z</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
      {visibleJobs.length ? (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <BrowseCard key={job._id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#141416] px-5 py-16 text-center">
          <SearchX
            className="mx-auto mb-4 size-8 text-zinc-600"
            aria-hidden="true"
          />
          <h3 className="font-medium">
            {hasFilters ? "No matching jobs" : "No jobs posted yet"}
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            {hasFilters
              ? "Try another keyword or adjust your filters."
              : "Check back soon for new opportunities."}
          </p>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="mt-4 text-violet-300 hover:bg-violet-400/10 hover:text-violet-200"
            >
              Clear search and filters
            </Button>
          )}
        </div>
      )}
      {jobs.length > 0 && (
        <JobPagination page={page} total={jobs.length} onPage={onPage} />
      )}
    </section>
  )
}
