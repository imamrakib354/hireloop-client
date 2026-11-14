"use client"

import { useState, type FocusEvent, type KeyboardEvent } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { JOB_TYPES, type JobSearchParams } from "@/lib/jobs/search-params"
import type { JobFilterOptions } from "@/lib/api/jobs"

const inputClass =
  "h-10 border-white/10 bg-[#1b1b1f] text-zinc-100 placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
const selectClass =
  "w-full rounded-lg bg-[#1b1b1f] text-zinc-300 [&_select]:h-10 [&_select]:border-white/10 [&_select]:focus-visible:ring-violet-400/20 [&_option]:bg-[#1b1b1f] [&_option]:text-zinc-200"

export function JobFiltersPanel({
  filters,
  options,
  optionsError,
  onChange,
  onReset,
}: {
  filters: JobSearchParams
  options: JobFilterOptions
  optionsError: string
  onChange: (changes: Record<string, string | string[]>) => void
  onReset: () => void
}) {
  const [minSalary, setMinSalary] = useState(filters.minSalary)
  const [maxSalary, setMaxSalary] = useState(filters.maxSalary)
  const invalidRange =
    (minSalary !== "" &&
      (!Number.isFinite(Number(minSalary)) || Number(minSalary) < 0)) ||
    (maxSalary !== "" &&
      (!Number.isFinite(Number(maxSalary)) || Number(maxSalary) < 0)) ||
    (minSalary !== "" &&
      maxSalary !== "" &&
      Number(minSalary) > Number(maxSalary))
  // Keep a bookmarked category visible even if it no longer has any jobs.
  const categories = [
    ...new Set([...options.categories, filters.category].filter(Boolean)),
  ].sort()

  function applySalary() {
    if (invalidRange) return
    if (minSalary !== filters.minSalary || maxSalary !== filters.maxSalary) {
      onChange({ minSalary, maxSalary })
    }
  }

  function handleSalaryBlur(event: FocusEvent<HTMLDivElement>) {
    // Moving between Minimum and Maximum should not submit an unfinished range.
    if (!event.currentTarget.contains(event.relatedTarget)) applySalary()
  }

  function handleSalaryKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      applySalary()
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-7 px-1 text-[11px] text-zinc-500 hover:bg-transparent hover:text-violet-300"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Reset
        </Button>
      </div>
      {optionsError && (
        <p role="alert" className="mb-4 text-xs text-red-300">
          {optionsError}
        </p>
      )}
      <fieldset className="space-y-3">
        <legend className="mb-4 text-xs font-medium text-zinc-200">
          Job Type
        </legend>
        {JOB_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2.5">
            <Checkbox
              id={`type-${type}`}
              checked={filters.jobTypes.includes(type)}
              onCheckedChange={(checked) =>
                onChange({
                  jobType: checked
                    ? [...filters.jobTypes, type]
                    : filters.jobTypes.filter((item) => item !== type),
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
                {optionsError ? "—" : (options.jobTypeCounts[type] ?? 0)}
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
          onChange={(event) => onChange({ category: event.target.value })}
          className={selectClass}
          disabled={Boolean(optionsError)}
        >
          <NativeSelectOption value="">All categories</NativeSelectOption>
          {categories.map((category) => (
            <NativeSelectOption key={category} value={category}>
              {category}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <fieldset className="mt-6 min-w-0 space-y-4 border-t border-white/[0.06] pt-5">
        <legend className="sr-only">Salary Range (USD)</legend>
        <p className="text-xs font-medium text-zinc-200" aria-hidden="true">
          Salary Range (USD)
        </p>
        <div
          className="grid min-w-0 grid-cols-2 gap-3"
          onBlur={handleSalaryBlur}
          onKeyDown={handleSalaryKey}
        >
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
              value={minSalary}
              onChange={(event) => setMinSalary(event.target.value)}
              aria-invalid={invalidRange}
              aria-describedby={invalidRange ? "salary-range-error" : undefined}
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
              value={maxSalary}
              onChange={(event) => setMaxSalary(event.target.value)}
              aria-invalid={invalidRange}
              aria-describedby={invalidRange ? "salary-range-error" : undefined}
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
            Enter a valid range. Maximum must be at least the minimum.
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="salary-period" className="text-[11px] text-zinc-500">
            Pay period
          </Label>
          <NativeSelect
            id="salary-period"
            value={filters.salaryFrequency}
            onChange={(event) =>
              onChange({ salaryFrequency: event.target.value })
            }
            className={selectClass}
          >
            <NativeSelectOption value="">All pay periods</NativeSelectOption>
            <NativeSelectOption value="hourly">Per hour</NativeSelectOption>
            <NativeSelectOption value="monthly">Per month</NativeSelectOption>
            <NativeSelectOption value="yearly">Per year</NativeSelectOption>
          </NativeSelect>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600">
          Choose a pay period to compare salaries on the same basis.
        </p>
      </fieldset>
    </>
  )
}
