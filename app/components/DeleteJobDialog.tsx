"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { deleteJob } from "@/lib/actions/jobs"
import type { Job } from "@/lib/types/jobformdata"

export function DeleteJobDialog({ job }: { job: Pick<Job, "_id" | "title"> }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleDelete() {
    if (isDeleting) return
    setIsDeleting(true)
    setError("")

    try {
      const result = await deleteJob(job._id)
      if (result.deletedCount !== 1) {
        throw new Error("The job could not be deleted. Please try again.")
      }
      setOpen(false)
      toast.add({
        title: "Job deleted",
        description: "The job has been permanently deleted.",
        type: "success",
      })
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete the job. Please try again."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isDeleting) return
        setOpen(nextOpen)
        setError("")
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            aria-label={`Delete ${job.title}`}
            className="size-8 rounded-md bg-[#202023] text-zinc-400 hover:bg-red-400/10 hover:text-red-300"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <AlertDialogContent
        size="sm"
        className="w-[calc(100%-2rem)] border border-white/10 bg-[#141416] text-zinc-100 shadow-2xl ring-0"
        aria-busy={isDeleting}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="size-12 rounded-xl bg-red-500/10 text-red-400">
            <Trash2 className="size-6" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-lg font-semibold">
            Delete job?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1 text-sm leading-relaxed text-zinc-400">
            Are you sure you want to delete{" "}
            <span className="font-medium break-words text-zinc-200">
              “{job.title || "Untitled job"}”
            </span>
            ? This will permanently remove the listing and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-center text-sm text-red-400">
            {error}
          </p>
        )}
        <AlertDialogFooter className="border-white/10 bg-white/[0.02]">
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            {isDeleting ? "Deleting…" : "Delete job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
