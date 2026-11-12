export function validateImage(file: File) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024 ||
    file.size === 0
  ) {
    throw new Error("Choose a JPG, PNG or WebP image no larger than 5 MB.")
  }
}

export async function uploadImage(file: File): Promise<string> {
  validateImage(file)
  const formData = new FormData()
  formData.append("image", file)

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  })
  const result = await response.json()
  if (!response.ok || !result.url) {
    throw new Error(result.error || "Image upload failed. Please try again.")
  }
  return result.url
}
