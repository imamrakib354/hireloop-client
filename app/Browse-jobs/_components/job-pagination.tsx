import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"

export function JobPagination({
  page,
  total,
  onPage,
}: {
  page: number
  total: number
  onPage: (page: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / 6))
  const firstPage = Math.max(1, Math.min(page - 2, pageCount - 4))
  const pageNumbers = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => firstPage + index
  )

  return (
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
              onClick={() => onPage(page - 1)}
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
                onClick={() => onPage(number)}
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
              onClick={() => onPage(page + 1)}
              className="border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-center text-[11px] text-zinc-600">
        Showing {(page - 1) * 6 + 1}–{Math.min(page * 6, total)} of {total} jobs
        · Page {page} of {pageCount}
      </p>
    </div>
  )
}
