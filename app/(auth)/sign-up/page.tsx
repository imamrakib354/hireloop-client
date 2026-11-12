"use client"

import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import type { AuthFormData } from "@/lib/types/authformdata"

export default function SignUpPage() {
  const router = useRouter()

  async function handleSignUp({
    email,
    password,
    name,
    role = "seeker",
  }: AuthFormData) {
    if (!name?.trim()) throw new Error("Please enter your full name.")

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
      role,
      callbackURL: "/",
    })

    if (error)
      throw new Error(error.message || "Could not create your account.")
    if (!data)
      throw new Error("Could not create your account. Please try again.")

    toast.add({ title: "Account created successfully!", type: "success" })
    router.replace("/")
    router.refresh()
  }

  return <AuthForm mode="sign-up" onSubmit={handleSignUp} />
}
