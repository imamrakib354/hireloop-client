"use client"

import Link from "next/link"
import { Eye, Pencil } from "lucide-react"
import { DeleteJobDialog } from "@/app/components/DeleteJobDialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

export function JobActions({ jobId, title }: { jobId: string; title: string }) {
  function comingSoon(action: string) {
    toast.add({
      title: `${action} is coming soon`,
      description: `Actions for “${title}” are not connected yet.`,
      type: "info",
    })
  }

  return (
    <div className="flex items-center gap-1.5" data-job-id={jobId}>
      <Button
        type="button"
        size="icon-sm"
        onClick={() => comingSoon("Update")}
        aria-label={`Update ${title}`}
        title="Update job"
        className="size-8 rounded-md bg-[#282044] text-[#c4b5fd] hover:bg-[#362b59]"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </Button>
      <DeleteJobDialog job={{ _id: jobId, title }} />
      <Link
        href={`/Browse-jobs/${jobId}`}
        aria-label={`View details for ${title}`}
        title="View job details"
        className="inline-flex size-8 items-center justify-center rounded-md bg-[#202023] text-sky-400 transition-colors outline-none hover:bg-sky-400/10 hover:text-sky-300 focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <Eye className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
