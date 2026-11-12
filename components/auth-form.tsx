"use client"

import { useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { HoverLift } from "@/components/hover-lift"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import type { AuthFormData } from "@/lib/types/authformdata"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
  onSubmit: (data: AuthFormData) => Promise<void>
}

const roleOptions = [
  { value: "seeker", label: "Job Seeker", icon: UserRound },
  { value: "recruiter", label: "Recruiter", icon: BriefcaseBusiness },
  { value: "admin", label: "Admin", icon: ShieldCheck },
] as const

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const isSignUp = mode === "sign-up"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const submittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const name = String(formData.get("name") ?? "").trim()
    const role = String(formData.get("role") ?? "seeker")

    if (
      isSignUp &&
      role !== "seeker" &&
      role !== "recruiter" &&
      role !== "admin"
    ) {
      toast.add({ title: "Please select a valid role.", type: "error" })
      return
    }

    if (!email || !password || (isSignUp && !name)) {
      toast.add({
        title: "Please complete all required fields.",
        type: "error",
      })
      return
    }
    if (isSignUp && password.length < 8) {
      toast.add({
        title: "Use a password with at least 8 characters.",
        type: "error",
      })
      return
    }
    if (
      isSignUp &&
      password !== String(formData.get("confirmPassword") ?? "")
    ) {
      toast.add({ title: "Passwords do not match.", type: "error" })
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    try {
      await onSubmit({
        email,
        password,
        ...(isSignUp &&
        (role === "seeker" || role === "recruiter" || role === "admin")
          ? { name, role }
          : {}),
      })
    } catch (error) {
      toast.add({
        title: isSignUp ? "Could not create your account" : "Could not sign in",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }
  const inputClassName =
    "h-12 rounded-xl border-white/10 bg-[#100d16] pl-11 text-sm text-white placeholder:text-[#776f83] focus-visible:border-[#8b80f9] focus-visible:ring-[#8b80f9]/20 dark:bg-[#100d16]"

  return (
    <main className="auth-page relative isolate flex min-h-[calc(100svh-170px)] items-center justify-center px-4 py-12 text-[#fff5f5] sm:px-6 sm:py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#120e18]/95 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[radial-gradient(ellipse_at_bottom_left,#49318555,transparent_70%)] p-10 lg:flex">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#8b80f9]/20 bg-[#635bff]/10 px-3 py-1.5 text-xs text-[#bfb4ff]">
              <Sparkles className="size-3.5" aria-hidden="true" /> Your next
              chapter starts here
            </span>
            <h2 className="mt-10 text-4xl leading-tight font-medium tracking-tight">
              Big ambitions.
              <br />
              Better opportunities.
              <br />
              <span className="text-[#a99aff]">One HireLoop.</span>
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#aca1b6]">
              Connect with world-class companies and find a role that feels like
              it was made for you.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-[#d4cbdc]">
              {[
                "Discover opportunities that fit you",
                "Connect with companies you'll love",
                "Take the next step with confidence",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check aria-hidden="true" className="size-4 text-[#a99aff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#635bff]/15 text-[#b6a8ff]">
                <BriefcaseBusiness className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-lg font-semibold">50,000+</p>
                <p className="text-xs text-[#aca1b6]">
                  opportunities. One perfect fit for you.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section
          aria-labelledby="auth-heading"
          className="px-6 py-8 sm:p-10 lg:p-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[#a89db3] transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to home
          </Link>
          <div className="mt-8 flex size-11 items-center justify-center rounded-xl border border-[#8b80f9]/20 bg-[#635bff]/10 text-[#b6a8ff]">
            {isSignUp ? (
              <UserRound className="size-5" aria-hidden="true" />
            ) : (
              <LockKeyhole className="size-5" aria-hidden="true" />
            )}
          </div>
          <h1
            id="auth-heading"
            className="mt-5 text-3xl font-semibold tracking-tight"
          >
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#aca1b6]">
            {isSignUp
              ? "Your next opportunity is closer than you think."
              : "Sign in to take the next step in your career."}
          </p>

          <form
            onSubmit={handleSubmit}
            aria-busy={isSubmitting}
            className="mt-8 space-y-5"
            aria-label={isSignUp ? "Create an account" : "Sign in"}
          >
            {isSignUp && (
              <fieldset disabled={isSubmitting} className="space-y-4">
                <legend className="text-sm font-medium text-[#e0d7e7]">
                  I am joining as
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className="relative cursor-pointer text-center"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        defaultChecked={value === "seeker"}
                        required
                        className="peer sr-only"
                      />
                      <span className="flex flex-col items-center gap-3 rounded-xl border border-transparent px-2 py-4 text-[#a89db3] transition-colors duration-200 peer-checked:border-[#8b80f9]/40 peer-checked:bg-[#635bff]/10 peer-checked:text-[#c4b5fd] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#8b80f9] peer-disabled:pointer-events-none peer-disabled:opacity-50 hover:bg-white/[0.03]">
                        <span className="flex size-14 items-center justify-center rounded-2xl border border-[#8b80f9]/20 bg-[#635bff]/10 text-[#b6a8ff]">
                          <Icon
                            aria-hidden="true"
                            className="size-6"
                            strokeWidth={1.5}
                          />
                        </span>
                        <span className="text-xs font-medium sm:text-sm">
                          {label}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {isSignUp && (
              <div className="space-y-2.5">
                <Label htmlFor="full-name" className="text-[#e0d7e7]">
                  Full name
                </Label>
                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 left-4 z-10 size-4 text-[#8f829e]"
                  />
                  <Input
                    id="full-name"
                    name="name"
                    required
                    disabled={isSubmitting}
                    autoComplete="name"
                    placeholder="Your full name"
                    className={inputClassName}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-[#e0d7e7]">
                Email address
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 left-4 z-10 size-4 text-[#8f829e]"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-[#e0d7e7]">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 left-4 z-10 size-4 text-[#8f829e]"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={isSignUp ? 8 : undefined}
                  disabled={isSubmitting}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder={
                    isSignUp
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  className={`${inputClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  aria-controls="password"
                  className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-lg text-[#a89db3] transition-colors hover:bg-[#635bff]/10 hover:text-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-[#8b80f9] disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-[#91849f]">
                  Use at least 8 characters for a stronger password.
                </p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2.5">
                <Label htmlFor="confirm-password" className="text-[#e0d7e7]">
                  Confirm password
                </Label>
                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 left-4 z-10 size-4 text-[#8f829e]"
                  />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    required
                    disabled={isSubmitting}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    className={`${inputClassName} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    aria-controls="confirm-password"
                    className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-lg text-[#a89db3] transition-colors hover:bg-[#635bff]/10 hover:text-[#c4b5fd] focus-visible:outline-2 focus-visible:outline-[#8b80f9] disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <HoverLift className="w-full pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full gap-2 rounded-xl bg-[#6757ff] text-sm font-medium text-white transition-colors duration-300 group-hover/hover-lift:bg-[#5438d6] hover:bg-[#5438d6] hover:text-white active:translate-y-0"
              >
                {isSubmitting
                  ? isSignUp
                    ? "Creating account…"
                    : "Signing in…"
                  : isSignUp
                    ? "Create account"
                    : "Sign In"}
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
              </Button>
            </HoverLift>
          </form>
          {isSignUp && (
            <p className="mt-5 text-center text-xs leading-6 text-[#91849f]">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-[#b6a8ff] hover:underline">
                Terms &amp; Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#b6a8ff] hover:underline">
                Privacy Guideline
              </Link>
              .
            </p>
          )}
          <p className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#aca1b6]">
            {isSignUp ? "Already have an account?" : "New to HireLoop?"}{" "}
            <Link
              href={isSignUp ? "/sign-in" : "/sign-up"}
              className="font-medium text-[#b6a8ff] underline-offset-4 transition-colors hover:text-[#d4cbff] hover:underline"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
