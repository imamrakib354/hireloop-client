"use client"

import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import type { AuthFormData } from "@/lib/types/authformdata"

export default function SignInPage() {
  const router = useRouter()

  async function handleSignIn({ email, password }: AuthFormData) {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    })

    if (error)
      throw new Error(error.message || "Please check your email and password.")
    if (!data) throw new Error("Could not sign in. Please try again.")

    toast.add({ title: "Signed in successfully!", type: "success" })
    router.replace("/")
    router.refresh()
  }

  return <AuthForm mode="sign-in" onSubmit={handleSignIn} />
}
