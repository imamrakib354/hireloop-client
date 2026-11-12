import Image from "next/image"
import { Building2, ExternalLink, Globe2, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Company } from "@/lib/types/company"

export function JobCompanyOverview({
  company,
  companyName,
  unavailable = false,
}: {
  company: Company | null
  companyName: string
  unavailable?: boolean
}) {
  const website = company?.website?.trim()
  const hasWebsite = website && /^https?:\/\//i.test(website)

  return (
    <Card className="border border-white/[0.07] bg-[#141416] py-0 text-zinc-100 ring-0">
      <CardHeader className="px-5 pt-5">
        <CardTitle className="text-base font-semibold">
          Company Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5">
        <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-[#1c1c22]">
          {company?.coverUrl ? (
            <Image
              src={company.coverUrl}
              alt={`${company.name} workplace`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 360px"
              className="object-cover"
            />
          ) : (
            <Building2
              className="size-12 text-violet-400/30"
              aria-hidden="true"
            />
          )}
        </div>
        <div>
          <h3 className="font-semibold break-words">
            {company?.name || companyName || "Company"}
          </h3>
          {company?.tagline && (
            <p className="mt-1 text-xs leading-relaxed text-violet-300">
              {company.tagline}
            </p>
          )}
          <p className="mt-3 text-xs leading-6 break-words whitespace-pre-wrap text-zinc-400">
            {company?.overview ||
              (unavailable
                ? "Company information is temporarily unavailable. You can still review the job details."
                : "This employer hasn't added a company overview yet.")}
          </p>
        </div>
        {company && (
          <>
            <dl className="divide-y divide-white/[0.06] text-xs">
              {[
                { label: "Company size", value: company.size, icon: Users },
                { label: "Industry", value: company.industry, icon: Building2 },
                {
                  label: "Headquarters",
                  value: company.location,
                  icon: MapPin,
                },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <dt className="flex shrink-0 items-center gap-2 text-zinc-500">
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="min-w-0 text-right leading-relaxed break-words text-zinc-300">
                    {value || "Not specified"}
                  </dd>
                </div>
              ))}
            </dl>
            {hasWebsite && (
              <Button
                nativeButton={false}
                render={
                  <a href={website} target="_blank" rel="noopener noreferrer" />
                }
                variant="outline"
                className="h-10 w-full border-white/10 bg-white/[0.025] text-xs text-zinc-300 hover:bg-violet-400/10 hover:text-violet-200"
              >
                <Globe2 aria-hidden="true" />
                Visit Website
                <ExternalLink className="ml-auto size-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
