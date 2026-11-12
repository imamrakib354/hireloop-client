"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  Clock3,
  Gift,
  Loader2,
  Pencil,
  Plus,
  Save,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { CompanyImageUpload } from "@/app/components/CompanyImageUpload"
import { createCompany, updateCompany } from "@/lib/actions/companies"
import type { Company, CompanyFormData } from "@/lib/types/company"
import type { JobType } from "@/lib/types/jobformdata"

const jobTypes: JobType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]
const benefitOptions = [
  "Health Insurance",
  "Paid Annual Leave",
  "Learning Budget",
  "Performance Bonus",
  "Flexible Working Hours",
]
const industries = [
  "Software & IT Services",
  "Design & Creative",
  "Marketing & Advertising",
  "Finance & Banking",
  "Healthcare",
  "Education",
  "Retail & E-commerce",
  "Manufacturing",
  "Other",
]
const companySizes = [
  "1 – 10 Employees",
  "11 – 50 Employees",
  "51 – 200 Employees",
  "201 – 500 Employees",
  "501 – 1,000 Employees",
  "1,000+ Employees",
]
const inputClass =
  "h-11 w-full min-w-0 border-white/10 bg-[#202023] text-sm text-zinc-200 placeholder:text-zinc-600 focus-visible:border-violet-400 focus-visible:ring-violet-400/20 disabled:opacity-70"
const selectClass =
  "w-full rounded-lg bg-[#202023] text-zinc-200 [&_select]:h-11 [&_select]:border-white/10 [&_select]:focus-visible:ring-violet-400/20 [&_option]:bg-[#202023] [&_option]:text-zinc-200"
const cardClass =
  "border border-white/[0.08] bg-[#141416] py-0 text-zinc-100 ring-0"
const labelClass = "mb-2 block text-xs font-medium text-zinc-300"

export function CompanyForm({
  company,
  recruiterId,
}: {
  company: Company | null
  recruiterId: string
}) {
  const router = useRouter()
  const initialValues: CompanyFormData = {
    name: company?.name ?? "",
    tagline: company?.tagline ?? "",
    industry: company?.industry ?? "",
    size: company?.size ?? "",
    location: company?.location ?? "",
    website: company?.website ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    overview: company?.overview ?? "",
    logoUrl: company?.logoUrl ?? "",
    coverUrl: company?.coverUrl ?? "",
    benefits: {
      "Full-time": company?.benefits?.["Full-time"] ?? [],
      "Part-time": company?.benefits?.["Part-time"] ?? [],
      Contract: company?.benefits?.Contract ?? [],
      Internship: company?.benefits?.Internship ?? [],
      Freelance: company?.benefits?.Freelance ?? [],
    },
  }
  const [values, setValues] = useState(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)
  const [savedCompany, setSavedCompany] = useState(company)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [error, setError] = useState("")
  const [benefitType, setBenefitType] = useState<JobType>("Full-time")
  const [customBenefit, setCustomBenefit] = useState("")
  const busy = isSaving || logoUploading || coverUploading
  const disabled = !isEditing || busy

  function changeField(field: keyof CompanyFormData, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function toggleBenefit(type: JobType, benefit: string, checked: boolean) {
    setValues((current) => ({
      ...current,
      benefits: {
        ...current.benefits,
        [type]: checked
          ? [...current.benefits[type], benefit]
          : current.benefits[type].filter((item) => item !== benefit),
      },
    }))
  }

  function addBenefit() {
    const benefit = customBenefit.trim()
    if (!benefit) return
    if (
      !values.benefits[benefitType].some(
        (item) => item.toLowerCase() === benefit.toLowerCase()
      )
    ) {
      toggleBenefit(benefitType, benefit, true)
    }
    setCustomBenefit("")
  }

  function cancelEditing() {
    setValues(savedValues)
    setIsEditing(false)
    setCustomBenefit("")
    setError("")
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isEditing || busy) return
    if (!recruiterId) {
      setError("Please sign in before saving your company.")
      return
    }
    const cleanedValues = {
      ...values,
      name: values.name.trim(),
      tagline: values.tagline.trim(),
      location: values.location.trim(),
      website: values.website.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      overview: values.overview.trim(),
    }
    if (
      !cleanedValues.name ||
      !cleanedValues.industry ||
      !cleanedValues.size ||
      !cleanedValues.location ||
      !cleanedValues.email ||
      !cleanedValues.overview
    ) {
      setError(
        "Please complete all required fields. Text fields cannot contain only spaces."
      )
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const data = {
        ...cleanedValues,
        recruiterId,
        updatedAt: new Date().toISOString(),
      }
      let nextCompany: Company
      if (savedCompany) {
        const result = await updateCompany(savedCompany._id, data)
        if (!result.acknowledged || result.matchedCount !== 1)
          throw new Error(
            "Your company could not be updated. Please try again."
          )
        nextCompany = { ...savedCompany, ...data }
      } else {
        const createdAt = data.updatedAt
        const result = await createCompany({ ...data, createdAt })
        if (!result.acknowledged || !result.insertedId)
          throw new Error("Your company was not saved. Please try again.")
        nextCompany = {
          ...data,
          createdAt,
          _id: result.insertedId,
          verificationStatus: "pending",
        }
      }
      setSavedCompany(nextCompany)
      setValues(cleanedValues)
      setSavedValues(cleanedValues)
      setIsEditing(false)
      setCustomBenefit("")
      toast.add({
        title: "Company saved",
        description: "Your employer profile has been updated.",
        type: "success",
      })
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save your company. Please try again."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="-m-4 min-h-full bg-[#111113] p-4 text-zinc-100 [color-scheme:dark] sm:-m-6 sm:p-6 lg:px-8 lg:py-10">
      <form onSubmit={handleSave} className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col justify-between gap-4 pb-2 sm:flex-row sm:items-center">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-2 flex items-center gap-1 text-xs text-zinc-500"
            >
              <span>Recruiter Portal</span>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span aria-current="page" className="text-violet-300">
                My Company
              </span>
            </nav>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              My Company
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Manage your employer profile and show candidates who you are.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={cancelEditing}
                  className="h-10 border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={busy}
                  aria-busy={busy}
                  className="h-10 bg-[#6757ff] px-4 text-xs text-white hover:bg-[#796aff]"
                >
                  {busy ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  {isSaving
                    ? "Saving…"
                    : logoUploading || coverUploading
                      ? "Uploading…"
                      : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(true)
                  setError("")
                }}
                className="h-10 bg-[#6757ff] px-4 text-xs text-white hover:bg-[#796aff]"
              >
                <Pencil className="size-4" aria-hidden="true" />
                {savedCompany ? "Edit Company" : "Add Company Details"}
              </Button>
            )}
          </div>
        </header>

        {!savedCompany && (
          <div className="flex items-start gap-3 rounded-xl border border-violet-400/15 bg-violet-400/5 p-4 text-xs leading-relaxed text-violet-200/80">
            <Building2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              Your company profile is empty. Click{" "}
              <span className="font-medium text-violet-200">
                Add Company Details
              </span>{" "}
              to introduce your organization. Saved information can be used in
              your job details later.
            </p>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <Card className={cardClass}>
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Company Identity
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Basic information and brand assets of your company.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 px-5 pb-5 sm:grid-cols-[150px_minmax(0,1fr)]">
            <CompanyImageUpload
              label="Company logo"
              imageUrl={values.logoUrl}
              disabled={disabled}
              onChange={(url) => changeField("logoUrl", url)}
              onUploadingChange={setLogoUploading}
            />
            <div className="min-w-0 space-y-5">
              <fieldset
                disabled={disabled}
                className="grid min-w-0 gap-4 md:grid-cols-2"
              >
                <div className="min-w-0">
                  <Label htmlFor="company-name" className={labelClass}>
                    Company Name <span className="text-violet-400">*</span>
                  </Label>
                  <Input
                    id="company-name"
                    name="name"
                    value={values.name}
                    onChange={(event) =>
                      changeField("name", event.target.value)
                    }
                    required
                    maxLength={120}
                    placeholder="e.g. I&Tech"
                    className={inputClass}
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="company-tagline" className={labelClass}>
                    Tagline <span className="text-zinc-600">(Optional)</span>
                  </Label>
                  <Input
                    id="company-tagline"
                    name="tagline"
                    value={values.tagline}
                    onChange={(event) =>
                      changeField("tagline", event.target.value)
                    }
                    maxLength={160}
                    placeholder="Building better digital experiences"
                    className={inputClass}
                  />
                </div>
              </fieldset>
              <div>
                <p className={labelClass}>Verification Status</p>
                <Badge
                  variant="outline"
                  className={`h-auto gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-normal ${savedCompany?.verificationStatus === "verified" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : savedCompany?.verificationStatus === "rejected" ? "border-red-400/20 bg-red-400/10 text-red-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}
                >
                  {savedCompany?.verificationStatus === "verified" ? (
                    <>
                      <BadgeCheck aria-hidden="true" />
                      Verified Employer
                    </>
                  ) : savedCompany?.verificationStatus === "rejected" ? (
                    <>
                      <ShieldAlert aria-hidden="true" />
                      Needs Review
                    </>
                  ) : (
                    <>
                      <Clock3 aria-hidden="true" />
                      {savedCompany ? "Pending Verification" : "Not Submitted"}
                    </>
                  )}
                </Badge>
                <p className="mt-2 text-[11px] text-zinc-600">
                  Verification is managed by the platform, not editable here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Company Information
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Key details about your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <fieldset
              disabled={disabled}
              className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <div className="min-w-0">
                <Label htmlFor="company-industry" className={labelClass}>
                  Industry <span className="text-violet-400">*</span>
                </Label>
                <NativeSelect
                  id="company-industry"
                  name="industry"
                  value={values.industry}
                  onChange={(event) =>
                    changeField("industry", event.target.value)
                  }
                  required
                  className={selectClass}
                >
                  <NativeSelectOption value="">
                    Select industry
                  </NativeSelectOption>
                  {industries.map((industry) => (
                    <NativeSelectOption key={industry} value={industry}>
                      {industry}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="min-w-0">
                <Label htmlFor="company-size" className={labelClass}>
                  Company Size <span className="text-violet-400">*</span>
                </Label>
                <NativeSelect
                  id="company-size"
                  name="size"
                  value={values.size}
                  onChange={(event) => changeField("size", event.target.value)}
                  required
                  className={selectClass}
                >
                  <NativeSelectOption value="">
                    Select company size
                  </NativeSelectOption>
                  {companySizes.map((size) => (
                    <NativeSelectOption key={size} value={size}>
                      {size}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              {[
                {
                  field: "location",
                  label: "Headquarters / Location",
                  type: "text",
                  placeholder: "Dhaka, Bangladesh",
                  required: true,
                },
                {
                  field: "website",
                  label: "Website",
                  type: "url",
                  placeholder: "https://yourcompany.com",
                  required: false,
                },
                {
                  field: "email",
                  label: "Contact Email",
                  type: "email",
                  placeholder: "careers@yourcompany.com",
                  required: true,
                },
                {
                  field: "phone",
                  label: "Phone",
                  type: "tel",
                  placeholder: "+880 1712-345678",
                  required: false,
                },
              ].map((field) => (
                <div key={field.field} className="min-w-0">
                  <Label
                    htmlFor={`company-${field.field}`}
                    className={labelClass}
                  >
                    {field.label}
                    {field.required ? (
                      <span className="text-violet-400"> *</span>
                    ) : (
                      <span className="text-zinc-600"> (Optional)</span>
                    )}
                  </Label>
                  <Input
                    id={`company-${field.field}`}
                    name={field.field}
                    type={field.type}
                    required={field.required}
                    maxLength={250}
                    value={
                      values[
                        field.field as
                          "location" | "website" | "email" | "phone"
                      ]
                    }
                    onChange={(event) =>
                      changeField(
                        field.field as keyof CompanyFormData,
                        event.target.value
                      )
                    }
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Company Overview
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Tell candidates about your mission, culture, and what you build.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Label htmlFor="company-overview" className="sr-only">
              Company overview (required)
            </Label>
            <Textarea
              id="company-overview"
              name="overview"
              value={values.overview}
              onChange={(event) => changeField("overview", event.target.value)}
              disabled={disabled}
              required
              maxLength={1000}
              placeholder="Introduce your company, your team, and what makes your workplace special…"
              className={`${inputClass} h-auto min-h-32 resize-y py-3 leading-relaxed`}
            />
            <p className="mt-2 text-right text-[10px] text-zinc-600">
              {values.overview.length} / 1,000
            </p>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="size-1.5 rounded-full bg-violet-400" />
              Media & Gallery
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Add a cover image to showcase your workplace, team, or office
              culture.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <CompanyImageUpload
              label="Cover image"
              imageUrl={values.coverUrl}
              disabled={disabled}
              cover
              onChange={(url) => changeField("coverUrl", url)}
              onUploadingChange={setCoverUploading}
            />
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className="px-5 pt-5">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gift className="size-4 text-violet-400" aria-hidden="true" />
              Employee Benefits
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Set benefits for each employment type. These can be shown with
              matching jobs later.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <Tabs
              value={benefitType}
              onValueChange={(value) => {
                setBenefitType(value as JobType)
                setCustomBenefit("")
              }}
            >
              <TabsList className="grid h-auto! w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-5">
                {jobTypes.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    disabled={busy}
                    className="h-10 rounded-lg border border-white/10 bg-[#202023] px-3 text-xs font-normal text-zinc-400 data-active:border-violet-400 data-active:bg-violet-400/15 data-active:text-violet-300"
                  >
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>
              {jobTypes.map((type) => (
                <TabsContent key={type} value={type} className="mt-4 space-y-4">
                  {[
                    ...new Set([...benefitOptions, ...values.benefits[type]]),
                  ].map((benefit, index) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <Checkbox
                        id={`benefit-${type}-${index}`}
                        checked={values.benefits[type].includes(benefit)}
                        disabled={disabled}
                        onCheckedChange={(checked) =>
                          toggleBenefit(type, benefit, checked)
                        }
                        className="border-white/20 bg-white/5 data-checked:border-violet-400 data-checked:bg-violet-400/15 data-checked:text-violet-300"
                      />
                      <Label
                        htmlFor={`benefit-${type}-${index}`}
                        className="cursor-pointer text-xs font-normal text-zinc-300"
                      >
                        {benefit}
                      </Label>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
            {isEditing && (
              <div className="mt-5 flex gap-2">
                <Label htmlFor="custom-benefit" className="sr-only">
                  Add custom benefit for {benefitType}
                </Label>
                <Input
                  id="custom-benefit"
                  value={customBenefit}
                  disabled={busy}
                  maxLength={100}
                  onChange={(event) => setCustomBenefit(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addBenefit()
                    }
                  }}
                  placeholder={`Add a ${benefitType.toLowerCase()} benefit…`}
                  className={inputClass}
                />
                <Button
                  type="button"
                  disabled={busy || !customBenefit.trim()}
                  onClick={addBenefit}
                  aria-label="Add custom benefit"
                  className="h-11 bg-violet-400/15 text-violet-300 hover:bg-violet-400/25"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <p className="text-[11px] text-zinc-600">
          Fields marked <span className="text-violet-400">*</span> are required.
          Uploading an image does not save the profile; click Save Changes to
          keep your edits.
        </p>
      </form>
    </div>
  )
}
