"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"
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
        size="sm"
        onClick={() => comingSoon("Update")}
        aria-label={`Update ${title}`}
        className="h-8 gap-1.5 rounded-md bg-[#282044] px-2.5 text-xs text-[#c4b5fd] hover:bg-[#362b59]"
      >
        <Pencil className="size-3.5" aria-hidden="true" /> Update
      </Button>
      <Button
        type="button"
        size="icon-sm"
        onClick={() => comingSoon("Delete")}
        aria-label={`Delete ${title}`}
        className="size-8 rounded-md bg-[#202023] text-zinc-400 hover:bg-red-400/10 hover:text-red-300"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        onClick={() => comingSoon("More actions")}
        aria-label={`More actions for ${title}`}
        className="size-8 rounded-md bg-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
      >
        <MoreVertical className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
