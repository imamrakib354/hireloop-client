"use client"

import { useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Job } from "@/lib/types/jobformdata"
import type { JobFilterOptions } from "@/lib/api/jobs"
import {
  jobFiltersQuery,
  sortJobs,
  updateJobQuery,
  type JobSearchParams,
} from "@/lib/jobs/search-params"
import { JobSearchBar } from "./job-search-bar"
import { JobFiltersPanel } from "./job-filters-panel"
import { JobResults } from "./job-results"

export function BrowseJobs({
  jobs,
  filters,
  options,
  error = "",
  optionsError = "",
}: {
  jobs: Job[]
  filters: JobSearchParams
  options: JobFilterOptions
  error?: string
  optionsError?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const sortedJobs = sortJobs(jobs, filters.sort)
  const page = Math.min(filters.page, Math.max(1, Math.ceil(jobs.length / 6)))

  function navigate(query: string) {
    if (isPending) return
    startTransition(() =>
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    )
  }

  function updateFilters(
    changes: Record<string, string | string[]>,
    resetPage = true
  ) {
    navigate(updateJobQuery(searchParams.toString(), changes, resetPage))
  }

  function resetFilters() {
    // Also discard drafts that have not been submitted to the URL yet.
    setResetKey((key) => key + 1)
    // Keep the selected sort, but clear every search/filter and the page.
    navigate(filters.sort === "newest" ? "" : `sort=${filters.sort}`)
  }

  return (
    <div
      className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8"
      aria-busy={isPending}
    >
      <header className="mb-6">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] text-violet-400 uppercase">
          Find your next opportunity
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Browse Jobs
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Discover a role that fits your skills, ambitions, and next chapter.
        </p>
      </header>
      <p role="status" className="sr-only">
        {isPending ? "Updating jobs…" : ""}
      </p>
      <fieldset disabled={isPending} className="m-0 min-w-0 border-0 p-0">
        <legend className="sr-only">Search and browse jobs</legend>
        <JobSearchBar
          key={`${resetKey}:${filters.search}`}
          search={filters.search}
          onSearch={(search) => updateFilters({ search })}
        />
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 p-8 text-center"
          >
            <p className="text-sm text-red-300">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => startTransition(() => router.refresh())}
              className="mt-4 border-white/10 bg-transparent text-zinc-200 hover:bg-white/5"
            >
              Try again
            </Button>
          </div>
        )}
        <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
          <div>
            <Button
              type="button"
              variant="outline"
              aria-expanded={showFilters}
              aria-controls="job-filters"
              onClick={() => setShowFilters(!showFilters)}
              className="mb-3 w-full justify-between border-white/10 bg-[#141416] text-zinc-200 hover:bg-white/5 lg:hidden"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </span>
              {showFilters ? "Hide" : "Show"}
            </Button>
            <aside
              id="job-filters"
              aria-label="Filter jobs"
              className={`${showFilters ? "block" : "hidden"} rounded-xl border border-white/[0.07] bg-[#141416] p-5 lg:block`}
            >
              <JobFiltersPanel
                key={`${resetKey}:${filters.minSalary}:${filters.maxSalary}`}
                filters={filters}
                options={options}
                optionsError={optionsError}
                onChange={updateFilters}
                onReset={resetFilters}
              />
              {optionsError && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => startTransition(() => router.refresh())}
                  className="mt-3 text-xs text-violet-300"
                >
                  Retry filter options
                </Button>
              )}
            </aside>
          </div>
          {!error && (
            <JobResults
              jobs={sortedJobs}
              page={page}
              sort={filters.sort}
              hasFilters={Boolean(jobFiltersQuery(filters))}
              onSort={(sort) => updateFilters({ sort })}
              onPage={(page) => updateFilters({ page: String(page) }, false)}
              onReset={resetFilters}
            />
          )}
        </div>
      </fieldset>
    </div>
  )
}
