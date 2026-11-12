"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { Building2, ImagePlus, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/lib/uploadImage"

type CompanyImageUploadProps = {
  label: string
  imageUrl: string
  disabled: boolean
  cover?: boolean
  onChange: (url: string) => void
  onUploadingChange: (uploading: boolean) => void
}

export function CompanyImageUpload({
  label,
  imageUrl,
  disabled,
  cover = false,
  onChange,
  onUploadingChange,
}: CompanyImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  async function handleUpload(file?: File) {
    if (!file || disabled || isUploading) return
    setIsUploading(true)
    onUploadingChange(true)
    setError("")
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try again."
      )
    } finally {
      setIsUploading(false)
      onUploadingChange(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs font-medium text-zinc-200">{label}</p>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled && !isUploading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void handleUpload(event.dataTransfer.files[0])
        }}
        className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed p-3 transition-colors ${cover ? "min-h-44 sm:min-h-52" : "min-h-36"} ${isDragging ? "border-violet-400 bg-violet-400/10" : "border-white/15 bg-[#111114]"}`}
        aria-busy={isUploading}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            unoptimized
            sizes={cover ? "(max-width: 768px) 100vw, 900px" : "160px"}
            className={cover ? "object-cover" : "object-contain p-3"}
          />
        ) : (
          <>
            {cover ? (
              <ImagePlus className="size-7 text-zinc-600" aria-hidden="true" />
            ) : (
              <Building2 className="size-8 text-zinc-600" aria-hidden="true" />
            )}
            <p className="text-center text-[11px] text-zinc-500">
              {disabled ? "No image added" : "Upload or drag an image here"}
            </p>
          </>
        )}
        {isUploading && (
          <div
            role="status"
            className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/75 text-xs text-zinc-200"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Uploading…
          </div>
        )}
        {!disabled && (
          <div
            className={`z-10 flex gap-2 ${imageUrl ? "mt-auto rounded-lg bg-black/70 p-1.5" : ""}`}
          >
            <Button
              type="button"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
            >
              <Upload className="size-3.5" aria-hidden="true" />
              {imageUrl ? "Replace" : "Upload file"}
            </Button>
            {imageUrl && (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`Remove ${label.toLowerCase()}`}
                disabled={isUploading}
                onClick={() => {
                  onChange("")
                  setError("")
                }}
                className="text-zinc-300 hover:bg-red-400/10 hover:text-red-300"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={`Upload ${label.toLowerCase()}`}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => void handleUpload(event.target.files?.[0])}
        />
      </div>
      <p className="text-[10px] text-zinc-600">JPG, PNG or WebP · Up to 5 MB</p>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
