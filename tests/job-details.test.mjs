import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)
function load(path, mocks = {}) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports, require: (name) => mocks[name] ?? require(name) }
  )
  return exports
}
function nodes(element) {
  if (element == null || typeof element !== "object") return [element]
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}
const job = {
  _id: "job-123",
  recruiterId: "user-1",
  title: "Frontend Developer",
  companyName: "Original Company Name",
  category: "Engineering & Tech",
  location: "Dhaka",
  isRemote: true,
  jobType: "Full-time",
  minSalary: "25",
  maxSalary: "40",
  salaryFrequency: "hourly",
  deadline: "2099-05-30",
  responsibilities: "Build interfaces.\nCollaborate with designers.",
  requirements: "React experience.\nTypeScript knowledge.",
}
const company = {
  _id: "company-1",
  recruiterId: "user-1",
  name: "HireLoop",
  tagline: "Build your future",
  overview: "We create useful software.",
  logoUrl: "https://i.ibb.co/logo.png",
  coverUrl: "https://i.ibb.co/cover.png",
  size: "11 – 50 Employees",
  industry: "Software & IT Services",
  location: "Dhaka, Bangladesh",
  website: "https://example.com",
  verificationStatus: "verified",
  benefits: {
    "Full-time": ["Health Insurance", "Learning Budget"],
    "Part-time": ["Flexible hours"],
  },
}
const uiMocks = {
  "next/link": { default: "a" },
  "next/image": { default: "img" },
  "@/components/ui/card": {
    Card: "Card",
    CardContent: "CardContent",
    CardHeader: "CardHeader",
    CardTitle: "CardTitle",
  },
  "@/components/ui/button": { Button: "Button" },
  "@/components/ui/badge": { Badge: "Badge" },
}

function pageMocks(getJob, getCompanies) {
  return {
    ...uiMocks,
    "next/navigation": {
      notFound: () => {
        throw new Error("NOT_FOUND")
      },
    },
    "@/lib/api/jobs": { getJob },
    "@/lib/api/companies": { getCompanies },
    "./_components/job-details": { JobDetails: "JobDetails" },
  }
}

test("details page loads the requested job and matches the company by recruiter ID", async () => {
  const page = load(
    "app/Browse-jobs/[id]/page.tsx",
    pageMocks(
      async (id) => {
        assert.equal(id, "job-123")
        return job
      },
      async () => [{ ...company, recruiterId: "another-user" }, company]
    )
  )
  const result = await page.default({
    params: Promise.resolve({ id: "job-123" }),
  })
  assert.equal(result.props.job, job)
  assert.equal(result.props.company, company)
  assert.equal(result.props.companyError, false)
})

test("company failures and missing profiles never hide the job", async () => {
  for (const fail of [false, true]) {
    const page = load(
      "app/Browse-jobs/[id]/page.tsx",
      pageMocks(
        async () => job,
        async () => {
          if (fail) throw new Error("Offline")
          return []
        }
      )
    )
    const result = await page.default({
      params: Promise.resolve({ id: "job-123" }),
    })
    assert.equal(result.props.job, job)
    assert.equal(result.props.company, null)
    assert.equal(result.props.companyError, fail)
  }
})

test("legacy jobs without recruiter IDs are never linked to unowned companies", async () => {
  const page = load(
    "app/Browse-jobs/[id]/page.tsx",
    pageMocks(
      async () => ({ ...job, recruiterId: undefined }),
      async () => {
        throw new Error("Should not fetch")
      }
    )
  )
  const result = await page.default({
    params: Promise.resolve({ id: "job-123" }),
  })
  assert.equal(result.props.company, null)
  assert.equal(result.props.companyError, false)
})

test("missing jobs trigger not-found and failed requests show retry UI", async () => {
  const missing = load(
    "app/Browse-jobs/[id]/page.tsx",
    pageMocks(async () => null)
  )
  await assert.rejects(
    missing.default({ params: Promise.resolve({ id: "missing" }) }),
    /NOT_FOUND/
  )
  const failed = load(
    "app/Browse-jobs/[id]/page.tsx",
    pageMocks(async () => {
      throw new Error("Offline")
    })
  )
  const result = nodes(
    await failed.default({ params: Promise.resolve({ id: "job-123" }) })
  )
  assert.ok(result.some((node) => node?.props?.role === "alert"))
  assert.ok(result.includes("Try again"))
})

const details = load("app/Browse-jobs/[id]/_components/job-details.tsx", {
  ...uiMocks,
  "@/lib/job-display": load("lib/job-display.ts"),
  "./company-overview": {
    JobCompanyOverview: "JobCompanyOverview",
  },
})

test("details display actual job data, matching benefits and disabled future actions", () => {
  const items = nodes(details.JobDetails({ job, company }))
  for (const text of [
    job.title,
    company.name,
    "$25 – $40 / hr",
    "Dhaka (Remote)",
    job.responsibilities,
    job.requirements,
    "Verified Employer",
    "Health Insurance",
    "Learning Budget",
  ])
    assert.ok(items.includes(text), text)
  assert.ok(
    !items.includes("Flexible hours"),
    "benefits must match the employment type"
  )
  const buttons = items.filter((node) => node?.type === "Button")
  assert.equal(buttons.length, 2)
  assert.ok(buttons.every((button) => button.props.disabled === true))
  const responsibilities = items.find(
    (node) => node?.type === "p" && node.props.children === job.responsibilities
  )
  assert.ok(responsibilities.props.className.includes("whitespace-pre-wrap"))
  assert.equal(
    items.find((node) => node?.type === "JobCompanyOverview").props.company,
    company
  )
})

test("pending and missing company profiles never show verified badges", () => {
  for (const profile of [null, { ...company, verificationStatus: "pending" }]) {
    const items = nodes(details.JobDetails({ job, company: profile }))
    assert.ok(!items.includes("Verified Employer"))
    if (!profile) assert.ok(items.includes(job.companyName))
  }
  const items = nodes(
    details.JobDetails({
      job: { ...job, deadline: "2000-01-01" },
      company: null,
    })
  )
  assert.ok(items.includes("Applications closed"))
})

const overview = load(
  "app/Browse-jobs/[id]/_components/company-overview.tsx",
  uiMocks
)
test("company sidebar displays company data and allows only HTTP(S) website links", () => {
  const items = nodes(
    overview.JobCompanyOverview({ company, companyName: job.companyName })
  )
  for (const text of [
    company.name,
    company.overview,
    company.size,
    company.industry,
    company.location,
  ])
    assert.ok(items.includes(text))
  const website = items.find((node) => node?.type === "Button").props.render
  assert.equal(website.props.href, company.website)
  assert.equal(website.props.rel, "noopener noreferrer")
  assert.ok(
    items.some(
      (node) => node?.type === "img" && node.props.src === company.coverUrl
    )
  )
  const unsafe = nodes(
    overview.JobCompanyOverview({
      company: { ...company, website: "javascript:alert(1)" },
      companyName: "Company",
    })
  )
  assert.ok(!unsafe.some((node) => node?.type === "Button"))
})

test("company sidebar has separate missing-profile and request-error messages", () => {
  const missing = nodes(
    overview.JobCompanyOverview({ company: null, companyName: job.companyName })
  )
  assert.ok(missing.includes(job.companyName))
  assert.ok(
    missing.includes("This employer hasn't added a company overview yet.")
  )
  const failed = nodes(
    overview.JobCompanyOverview({
      company: null,
      companyName: job.companyName,
      unavailable: true,
    })
  )
  assert.ok(
    failed.includes(
      "Company information is temporarily unavailable. You can still review the job details."
    )
  )
})
