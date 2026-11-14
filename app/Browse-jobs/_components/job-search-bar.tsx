"use client"

import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function JobSearchBar({
  search,
  onSearch,
}: {
  search: string
  onSearch: (value: string) => void
}) {
  const [draft, setDraft] = useState(search)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(draft.trim())
  }

  return (
    <Card className="mb-6 border border-white/[0.07] bg-[#141416] py-0 ring-0">
      <CardContent className="p-3 sm:p-4">
        <form
          onSubmit={handleSubmit}
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
              name="search"
              type="search"
              placeholder="Search by job title, company, or location…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={200}
              className="h-11 border-white/10 bg-[#1b1b1f] pl-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/20"
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
  )
}
