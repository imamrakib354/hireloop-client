"use client"

import { useState, type FormEvent } from "react"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { BrowseCard } from "@/app/components/browseCard"
import { filterJobs, type JobFilters } from "@/lib/browse-jobs"
import type { Job } from "@/lib/types/jobformdata"

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]
const emptyFilters: JobFilters = {
  keyword: "",
  types: [],
  category: "",
  minSalary: "",
  maxSalary: "",
  frequency: "",
}
const inputClass =
  "h-10 border-white/10 bg-[#1b1b1f] text-zinc-100 placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
const selectClass =
  "w-full rounded-lg bg-[#1b1b1f] text-zinc-300 [&_select]:h-10 [&_select]:border-white/10 [&_select]:focus-visible:ring-violet-400/20 [&_option]:bg-[#1b1b1f] [&_option]:text-zinc-200"

export function BrowseJobs({
  jobs,
  error = "",
}: {
  jobs: Job[]
  error?: string
}) {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState(emptyFilters)
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    ...new Set(jobs.map((job) => job.category).filter(Boolean)),
  ].sort()
  const filteredJobs = filterJobs(jobs, filters, sort)
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / 6))
  const visibleJobs = filteredJobs.slice((page - 1) * 6, page * 6)
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4))
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => firstPage + index
  )
  const invalidRange =
    filters.minSalary !== "" &&
    filters.maxSalary !== "" &&
    Number(filters.minSalary) > Number(filters.maxSalary)

  function updateFilters(changes: Partial<JobFilters>) {
    setFilters({ ...filters, ...changes })
    setPage(1)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateFilters({ keyword: search })
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setSearch("")
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
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

      <Card className="mb-6 border border-white/[0.07] bg-[#141416] py-0 ring-0">
        <CardContent className="p-3 sm:p-4">
          <form
            onSubmit={handleSearch}
            role="search"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-zinc-500"
                aria-hidden="true"
              />
              <Label htmlFor="job-search" className="sr-only">
                Search by job title, company, or location
              </Label>
              <Input
                id="job-search"
                type="search"
                placeholder="Search by job title, company, or location…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={`${inputClass} h-11 pl-10 text-sm`}
              />
            </div>
            <Button
              type="submit"
              className="h-11 bg-zinc-100 px-6 text-xs font-semibold text-zinc-950 hover:bg-white"
            >
              Search Jobs
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/5 p-8 text-center"
        >
          <p className="text-sm text-red-300">{error}</p>
          <Button
            nativeButton={false}
            render={<a href="/Browse-jobs" />}
            variant="outline"
            className="mt-4 border-white/10 bg-transparent text-zinc-200 hover:bg-white/5"
          >
            Try again
          </Button>
        </div>
      ) : (
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
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-semibold">Filters</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 px-1 text-[11px] text-zinc-500 hover:bg-transparent hover:text-violet-300"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Reset
                </Button>
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-4 text-xs font-medium text-zinc-200">
                  Job Type
                </legend>
                {jobTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2.5">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={(checked) =>
                        updateFilters({
                          types: checked
                            ? [...filters.types, type]
                            : filters.types.filter((item) => item !== type),
                        })
                      }
                      className="border-white/10 bg-white/5 data-checked:border-violet-400 data-checked:bg-violet-400 data-checked:text-zinc-950"
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="flex flex-1 cursor-pointer justify-between text-xs font-normal text-zinc-400"
                    >
                      {type}
                      <span className="text-[10px] text-zinc-600">
                        {jobs.filter((job) => job.jobType === type).length}
                      </span>
                    </Label>
                  </div>
                ))}
              </fieldset>

              <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
                <Label
                  htmlFor="job-category"
                  className="text-xs font-medium text-zinc-200"
                >
                  Category
                </Label>
                <NativeSelect
                  id="job-category"
                  value={filters.category}
                  onChange={(event) =>
                    updateFilters({ category: event.target.value })
                  }
                  className={selectClass}
                >
                  <NativeSelectOption value="">
                    All categories
                  </NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                      {category}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <fieldset className="mt-6 min-w-0 space-y-4 border-t border-white/[0.06] pt-5">
                <legend className="sr-only">Salary Range (USD)</legend>
                <p
                  className="text-xs font-medium text-zinc-200"
                  aria-hidden="true"
                >
                  Salary Range (USD)
                </p>
                <div className="grid min-w-0 grid-cols-2 gap-3">
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="filter-min"
                      className="text-[11px] whitespace-nowrap text-zinc-500"
                    >
                      Minimum ($)
                    </Label>
                    <Input
                      id="filter-min"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Min"
                      value={filters.minSalary}
                      onChange={(event) =>
                        updateFilters({ minSalary: event.target.value })
                      }
                      aria-invalid={invalidRange}
                      aria-describedby={
                        invalidRange ? "salary-range-error" : undefined
                      }
                      className={`${inputClass} w-full min-w-0`}
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label
                      htmlFor="filter-max"
                      className="text-[11px] whitespace-nowrap text-zinc-500"
                    >
                      Maximum ($)
                    </Label>
                    <Input
                      id="filter-max"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max"
                      value={filters.maxSalary}
                      onChange={(event) =>
                        updateFilters({ maxSalary: event.target.value })
                      }
                      aria-invalid={invalidRange}
                      aria-describedby={
                        invalidRange ? "salary-range-error" : undefined
                      }
                      className={`${inputClass} w-full min-w-0`}
                    />
                  </div>
                </div>
                {invalidRange && (
                  <p
                    id="salary-range-error"
                    role="alert"
                    className="text-xs text-red-400"
                  >
                    Maximum must be at least the minimum.
                  </p>
                )}
                <div className="space-y-2">
                  <Label
                    htmlFor="salary-period"
                    className="text-[11px] text-zinc-500"
                  >
                    Pay period
                  </Label>
                  <NativeSelect
                    id="salary-period"
                    value={filters.frequency}
                    onChange={(event) =>
                      updateFilters({ frequency: event.target.value })
                    }
                    className={selectClass}
                  >
                    <NativeSelectOption value="">
                      All pay periods
                    </NativeSelectOption>
                    <NativeSelectOption value="hourly">
                      Per hour
                    </NativeSelectOption>
                    <NativeSelectOption value="monthly">
                      Per month
                    </NativeSelectOption>
                    <NativeSelectOption value="yearly">
                      Per year
                    </NativeSelectOption>
                  </NativeSelect>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-600">
                  Choose a pay period to compare salaries on the same basis.
                </p>
              </fieldset>
            </aside>
          </div>

          <section aria-label="Job results" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2
                aria-live="polite"
                className="text-sm font-medium sm:text-base"
              >
                Found{" "}
                <span className="font-semibold text-white">
                  {filteredJobs.length.toLocaleString("en-US")}
                </span>{" "}
                {filteredJobs.length === 1
                  ? "Professional Job"
                  : "Professional Jobs"}
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
                  onChange={(event) => {
                    setSort(event.target.value)
                    setPage(1)
                  }}
                  className="rounded-lg bg-[#141416] text-xs text-zinc-300 [&_option]:bg-[#141416] [&_option]:text-zinc-200 [&_select]:border-white/10"
                >
                  <NativeSelectOption value="newest">
                    Most Recent
                  </NativeSelectOption>
                  <NativeSelectOption value="oldest">
                    Oldest First
                  </NativeSelectOption>
                  <NativeSelectOption value="title">
                    Title A–Z
                  </NativeSelectOption>
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
                  {jobs.length ? "No matching jobs" : "No jobs posted yet"}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {jobs.length
                    ? "Try another keyword or adjust your filters."
                    : "Check back soon for new opportunities."}
                </p>
                {jobs.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-4 text-violet-300 hover:bg-violet-400/10 hover:text-violet-200"
                  >
                    Clear search and filters
                  </Button>
                )}
              </div>
            )}

            {filteredJobs.length > 0 && (
              <div className="mt-8 space-y-3">
                <Pagination aria-label="Job results pages">
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Previous page"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                      >
                        <ChevronLeft aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                    {pageNumbers.map((number) => (
                      <PaginationItem key={number}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Page ${number}`}
                          aria-current={page === number ? "page" : undefined}
                          onClick={() => setPage(number)}
                          className={
                            page === number
                              ? "bg-zinc-100 text-zinc-950 hover:bg-white hover:text-zinc-950"
                              : "border border-white/10 text-zinc-500 hover:bg-white/5 hover:text-white"
                          }
                        >
                          {number}
                        </Button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Next page"
                        disabled={page === pageCount}
                        onClick={() => setPage(page + 1)}
                        className="border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
                      >
                        <ChevronRight aria-hidden="true" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <p className="text-center text-[11px] text-zinc-600">
                  Showing {(page - 1) * 6 + 1}–
                  {Math.min(page * 6, filteredJobs.length)} of{" "}
                  {filteredJobs.length} jobs · Page {page} of {pageCount}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
