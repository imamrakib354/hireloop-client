import { getCurrentUser } from "@/lib/getUserSession"
import { validateImage } from "@/lib/uploadImage"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user)
      return Response.json(
        { error: "Please sign in to upload an image." },
        { status: 401 }
      )

    const key = process.env.IMGBB_API_KEY
    if (!key)
      return Response.json(
        {
          error:
            "Image uploads are not configured. Add IMGBB_API_KEY to the server environment.",
        },
        { status: 503 }
      )

    const formData = await request.formData()
    const file = formData.get("image")
    if (!(file instanceof File))
      return Response.json(
        { error: "Choose an image to upload." },
        { status: 400 }
      )
    try {
      validateImage(file)
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Invalid image." },
        { status: 400 }
      )
    }

    const uploadData = new FormData()
    uploadData.append("key", key)
    uploadData.append("image", file)
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: uploadData,
    })
    const result = await response.json()
    if (!response.ok || !result.success || !result.data?.url) {
      return Response.json(
        { error: "Image upload failed. Please try again." },
        { status: 502 }
      )
    }
    return Response.json({ url: result.data.url })
  } catch {
    return Response.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 }
    )
  }
}
