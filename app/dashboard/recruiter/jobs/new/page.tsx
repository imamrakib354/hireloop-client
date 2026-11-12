"use client"

import Link from "next/link"
import { useRef, useState, type FormEvent } from "react"
import { createJob } from "@/lib/actions/jobs"
import type { JobFormData, JobType } from "@/lib/types/jobformdata"
import { salaryUnit } from "@/lib/job-display"
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Globe2,
  Loader2,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const inputClass =
  "h-11 border-transparent bg-[#202023] text-sm text-zinc-200 placeholder:text-zinc-500 focus-visible:border-[#7664ff] focus-visible:ring-[#7664ff]/20"
const textareaClass =
  "h-auto min-h-44 max-w-full resize-none field-sizing-content overflow-hidden border-transparent bg-[#202023] py-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-zinc-200 placeholder:text-zinc-500 focus-visible:border-[#7664ff] focus-visible:ring-[#7664ff]/20 sm:min-h-32"
const sectionClass = "space-y-5 rounded-2xl bg-[#141416] p-5 sm:p-6"
const labelClass = "mb-2 block text-xs font-normal text-zinc-200"
const selectContentClass = "border border-white/10 bg-[#202023] text-zinc-200"
const selectItemClass = "py-2 focus:bg-white/10 focus:text-white"

const categories = [
  "Engineering & Tech",
  "Design & Creative",
  "Marketing & Sales",
  "Business & Finance",
  "Customer Support",
  "Operations",
  "Other",
]

const jobTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Internship"]

export default function AddJobPage() {
  const [isRemote, setIsRemote] = useState(false)
  const [message, setMessage] = useState("")
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [salaryFrequency, setSalaryFrequency] = useState("hourly")
  const submittingRef = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    const formData = new FormData(event.currentTarget)
    const jobType = formData.get("jobType") as JobType
    const jobData: JobFormData = {
      title: String(formData.get("title") || "").trim(),
      companyName: String(formData.get("companyName") || "").trim(),
      category: String(formData.get("category") || ""),
      jobType,
      isRemote,
      location: String(formData.get("location") || "").trim(),
      deadline: String(formData.get("deadline") || ""),
      minSalary: String(formData.get("minSalary") || "").trim(),
      maxSalary: String(formData.get("maxSalary") || "").trim(),
      salaryFrequency: String(formData.get("salaryFrequency") || ""),
      responsibilities: String(formData.get("responsibilities") || "").trim(),
      requirements: String(formData.get("requirements") || "").trim(),
    }

    if (
      !jobData.title ||
      !jobData.companyName ||
      !jobData.category ||
      !jobTypes.includes(jobData.jobType) ||
      (!jobData.isRemote && !jobData.location) ||
      !jobData.deadline ||
      !jobData.salaryFrequency ||
      !jobData.responsibilities ||
      !jobData.requirements
    ) {
      setHasError(true)
      setMessage(
        "Please complete all required fields. Text fields cannot contain only spaces."
      )
      return
    }

    if (
      !jobData.minSalary ||
      !jobData.maxSalary ||
      !Number.isFinite(Number(jobData.minSalary)) ||
      !Number.isFinite(Number(jobData.maxSalary)) ||
      Number(jobData.minSalary) < 0 ||
      Number(jobData.maxSalary) < Number(jobData.minSalary)
    ) {
      setHasError(true)
      setMessage(
        "Enter a valid salary range. Maximum salary must be at least the minimum salary."
      )
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)
    setHasError(false)
    setMessage("")

    try {
      const result = await createJob(jobData)
      if (!result?.acknowledged || !result.insertedId) {
        throw new Error("The job was not saved. Please try again.")
      }
      setIsRemote(false)
      setSalaryFrequency("hourly")
      // Remount the form so inputs, radios, and shadcn selects return to defaults.
      setFormKey((key) => key + 1)
      setMessage(`“${jobData.title}” published successfully!`)
    } catch (error) {
      setHasError(true)
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not publish the job. Please try again."
      )
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#111113] p-4 text-zinc-100 sm:-m-6 sm:p-6 lg:px-8 lg:py-10">
      <form
        key={formKey}
        onSubmit={handleSubmit}
        onChange={() => setMessage("")}
        className="mx-auto max-w-5xl space-y-6 [color-scheme:dark]"
      >
        <header className="flex flex-col justify-between gap-5 pb-2 sm:flex-row sm:items-center">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-2 flex items-center gap-1 text-xs text-zinc-500"
            >
              <Link
                href="/dashboard/recruiter/jobs"
                className="transition-colors hover:text-zinc-200"
              >
                Manage Jobs
              </Link>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span aria-current="page" className="text-violet-300">
                Create New Listing
              </span>
            </nav>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Post a New Job
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500 sm:text-sm">
              Fill in the position specifications to attract qualified talent
              across our network.
            </p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-10 w-fit gap-2 bg-[#6757ff] px-5 text-xs text-white shadow-lg shadow-[#6757ff]/15 hover:bg-[#796aff] focus-visible:ring-violet-400"
          >
            {isSubmitting ? "Publishing…" : "Publish Job"}
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4" aria-hidden="true" />
            )}
          </Button>
        </header>

        <p className="sr-only">Fields marked with an asterisk are required.</p>
        <div
          role={hasError ? "alert" : "status"}
          aria-live="polite"
          className={
            message
              ? `rounded-lg border p-4 text-sm ${hasError ? "border-red-400/20 bg-red-400/5 text-red-300" : "border-violet-400/20 bg-violet-400/5 text-violet-200"}`
              : "sr-only"
          }
        >
          {message}
        </div>

        <section aria-labelledby="basic-information" className={sectionClass}>
          <h2
            id="basic-information"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span
              className="size-1.5 rounded-full bg-[#7864ff]"
              aria-hidden="true"
            />
            1. Basic Information
          </h2>
          <div>
            <Label htmlFor="title" className={labelClass}>
              Job Title <span className="text-violet-400">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Frontend Developer"
              required
              maxLength={150}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="companyName" className={labelClass}>
                Company Name <span className="text-violet-400">*</span>
              </Label>
              <div className="relative">
                <Building2
                  className="pointer-events-none absolute top-3.5 left-3 size-4 text-zinc-500"
                  aria-hidden="true"
                />
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Your company name"
                  required
                  maxLength={150}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category" className={labelClass}>
                Job Category <span className="text-violet-400">*</span>
              </Label>
              <Select
                name="category"
                defaultValue="Engineering & Tech"
                required
              >
                <SelectTrigger id="category" className={`${inputClass} w-full`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className={selectItemClass}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <fieldset>
            <legend className={labelClass}>
              Job Type <span className="text-violet-400">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {jobTypes.map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    value={type}
                    defaultChecked={type === "Full-time"}
                    required
                    className="peer sr-only"
                  />
                  <span className="flex h-11 items-center justify-center rounded-lg border border-transparent bg-[#202023] text-xs text-zinc-500 transition-colors peer-checked:border-[#7864ff]/70 peer-checked:text-zinc-100 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-400 hover:text-zinc-200">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section
          aria-labelledby="location-compensation"
          className={sectionClass}
        >
          <h2
            id="location-compensation"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span
              className="size-1.5 rounded-full bg-[#7864ff]"
              aria-hidden="true"
            />
            2. Location, Compensation &amp; Timeline
          </h2>
          <div className="flex items-center gap-3 rounded-lg bg-[#202023] p-4">
            <Globe2
              className="size-5 shrink-0 text-violet-300"
              aria-hidden="true"
            />
            <div className="flex-1">
              <Label
                htmlFor="isRemote"
                className="text-xs font-normal text-zinc-200"
              >
                Remote Work Allowed
              </Label>
              <p
                id="remote-description"
                className="mt-1 text-[11px] text-zinc-500"
              >
                Enable worldwide or distributed candidate applications
              </p>
            </div>
            <Switch
              id="isRemote"
              name="isRemote"
              checked={isRemote}
              onCheckedChange={setIsRemote}
              aria-describedby="remote-description"
              className="data-checked:bg-[#6757ff] data-unchecked:bg-zinc-600 [&_[data-slot=switch-thumb]]:bg-white"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="location"
                className={`${labelClass} flex items-center justify-between`}
              >
                Job Location{" "}
                <span className="text-[10px] text-zinc-500">
                  {isRemote ? "Optional" : "Required"}
                </span>
              </Label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute top-3.5 left-3 size-4 text-zinc-500"
                  aria-hidden="true"
                />
                <Input
                  id="location"
                  name="location"
                  placeholder="New York, USA"
                  required={!isRemote}
                  maxLength={200}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="deadline" className={labelClass}>
                Application Deadline <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                required
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="minSalary" className={labelClass}>
                Min / {salaryUnit(salaryFrequency)}{" "}
                <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="minSalary"
                name="minSalary"
                type="number"
                min="0"
                step="0.01"
                placeholder="25"
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="maxSalary" className={labelClass}>
                Max / {salaryUnit(salaryFrequency)}{" "}
                <span className="text-violet-400">*</span>
              </Label>
              <Input
                id="maxSalary"
                name="maxSalary"
                type="number"
                min="0"
                step="0.01"
                placeholder="40"
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="salaryFrequency" className={labelClass}>
                Frequency <span className="text-violet-400">*</span>
              </Label>
              <Select
                name="salaryFrequency"
                value={salaryFrequency}
                onValueChange={(value) => setSalaryFrequency(value || "hourly")}
                required
                items={[
                  { label: "per hour", value: "hourly" },
                  { label: "per month", value: "monthly" },
                  { label: "per year", value: "yearly" },
                ]}
              >
                <SelectTrigger
                  id="salaryFrequency"
                  className={`${inputClass} w-full`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="hourly" className={selectItemClass}>
                    per hour
                  </SelectItem>
                  <SelectItem value="monthly" className={selectItemClass}>
                    per month
                  </SelectItem>
                  <SelectItem value="yearly" className={selectItemClass}>
                    per year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="responsibilities-requirements"
          className={sectionClass}
        >
          <h2
            id="responsibilities-requirements"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span
              className="size-1.5 rounded-full bg-[#7864ff]"
              aria-hidden="true"
            />
            3. Responsibilities &amp; Requirements
          </h2>
          <div>
            <Label htmlFor="responsibilities" className={labelClass}>
              Key Responsibilities <span className="text-violet-400">*</span>
            </Label>
            <Textarea
              id="responsibilities"
              name="responsibilities"
              required
              placeholder="Describe the role, day-to-day responsibilities, and the impact this person will make on your team."
              className={textareaClass}
            />
          </div>
          <div>
            <Label htmlFor="requirements" className={labelClass}>
              Qualifications &amp; Requirements{" "}
              <span className="text-violet-400">*</span>
            </Label>
            <Textarea
              id="requirements"
              name="requirements"
              required
              placeholder={
                "• Experience with React, TypeScript, and modern web technologies\n• Strong understanding of responsive design and performance\n• Ability to collaborate with product and design teams"
              }
              className={textareaClass}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
