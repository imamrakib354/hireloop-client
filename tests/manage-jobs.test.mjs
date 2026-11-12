import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const loadModule = createRequire(import.meta.url)

function load(path, mocks = {}) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports, require: (name) => mocks[name] ?? loadModule(name) }
  )
  return exports
}

const display = load("lib/job-display.ts")
const jobList = load("app/dashboard/recruiter/jobs/job-list.tsx", {
  "@/lib/job-display": display,
  "./job-actions": { JobActions: "JobActions" },
  "@/components/ui/table": Object.fromEntries(
    [
      "Table",
      "TableBody",
      "TableCell",
      "TableHead",
      "TableHeader",
      "TableRow",
    ].map((name) => [name, name])
  ),
})

function nodes(element) {
  if (element == null) return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  if (typeof element !== "object") return [element]
  if (typeof element.type === "function")
    return nodes(element.type(element.props))
  return [element, ...nodes(element.props?.children)]
}

const jobs = [
  {
    _id: "job-123",
    recruiterId: "recruiter-123",
    title: "Frontend Developer",
    companyName: "HireLoop",
    category: "Engineering & Tech",
    jobType: "Full-time",
    isRemote: true,
    location: "New York, USA",
    deadline: "2099-05-30",
    minSalary: "25",
    maxSalary: "40",
    salaryFrequency: "hourly",
    responsibilities: "Build UI",
    requirements: "React",
  },
]

test("fetched job values appear in both the desktop table and mobile cards", () => {
  const items = nodes(jobList.JobList({ jobs }))
  for (const text of [
    "Frontend Developer",
    "HireLoop",
    "Engineering & Tech",
    "Remote (New York, USA)",
    "$25 – $40 / hr",
    "Open",
  ]) {
    assert.equal(items.filter((item) => item === text).length, 2, text)
  }
  assert.equal(items.filter((item) => item?.type === "JobActions").length, 2)
  const table = items.find((item) => item?.type === "Table")
  assert.ok(table.props.className.includes("min-w-"))
  assert.ok(
    items.some(
      (item) =>
        item?.type === "div" && item.props.className?.includes("md:hidden")
    )
  )
})

test("page fetches all jobs but only passes the current recruiter's jobs to the list", async () => {
  const page = load("app/dashboard/recruiter/jobs/page.tsx", {
    "next/link": { default: "a" },
    "@/lib/getUserSession": {
      getCurrentUser: async () => ({ id: "recruiter-123" }),
    },
    "@/lib/api/jobs": {
      getJobs: async () => [
        ...jobs,
        { ...jobs[0], _id: "other-job", recruiterId: "another-recruiter" },
        { ...jobs[0], _id: "legacy-job", recruiterId: undefined },
      ],
    },
    "./job-list": { JobList: "JobList" },
  })
  const items = nodes(await page.default())
  const visibleJobs = items.find((item) => item?.type === "JobList").props.jobs
  assert.equal(visibleJobs.length, 1)
  assert.equal(visibleJobs[0], jobs[0])
  assert.ok(
    items.some((item) => item?.props?.href === "/dashboard/recruiter/jobs/new")
  )
})

test("job categories have distinct icons and matching colors on desktop and mobile", () => {
  const icons = loadModule("lucide-react")
  const categories = [
    ["Engineering & Tech", "Code2", "text-[#7964ff]"],
    ["Design & Creative", "PencilRuler", "text-orange-500"],
    ["Marketing & Sales", "Megaphone", "text-violet-300"],
    ["Business & Finance", "ChartNoAxesCombined", "text-emerald-400"],
    ["Customer Support", "Headset", "text-pink-400"],
    ["Operations", "Settings2", "text-amber-400"],
    ["Infrastructure", "CloudCog", "text-sky-400"],
    ["Quality", "BadgeCheck", "text-indigo-400"],
    ["  DESIGN  ", "PencilRuler", "text-orange-500"],
    ["Other", "BriefcaseBusiness", "text-zinc-400"],
    ["Unknown category", "BriefcaseBusiness", "text-zinc-400"],
    ["", "BriefcaseBusiness", "text-zinc-400"],
    ["constructor", "BriefcaseBusiness", "text-zinc-400"],
  ]

  for (const [category, icon, color] of categories) {
    const items = nodes(jobList.JobList({ jobs: [{ ...jobs[0], category }] }))
    assert.equal(
      items.filter((item) => item?.type === icons[icon]).length,
      2,
      category
    )
    assert.equal(
      items.filter(
        (item) =>
          item?.type === "span" &&
          item.props.className?.includes("rounded-lg") &&
          item.props.className?.includes(color)
      ).length,
      2,
      category
    )
    assert.equal(
      items.filter(
        (item) => item?.type === "p" && item.props.className?.includes(color)
      ).length,
      2,
      category
    )
  }
})

test("page displays empty and failed request states", async () => {
  for (const fail of [false, true]) {
    const page = load("app/dashboard/recruiter/jobs/page.tsx", {
      "next/link": { default: "a" },
      "@/lib/getUserSession": {
        getCurrentUser: async () => ({ id: "recruiter-123" }),
      },
      "@/lib/api/jobs": {
        getJobs: async () => {
          if (fail) throw new Error("Offline")
          return []
        },
      },
      "./job-list": { JobList: "JobList" },
    })
    const items = nodes(await page.default())
    assert.ok(
      items.includes(
        fail
          ? "We couldn't load your job listings. Please try again."
          : "No jobs posted yet"
      )
    )
  }
})

test("each job has icon-only update, delete dialog and view details actions", () => {
  const notices = []
  const actions = load("app/dashboard/recruiter/jobs/job-actions.tsx", {
    "next/link": { default: "a" },
    "@/app/components/DeleteJobDialog": { DeleteJobDialog: "DeleteJobDialog" },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/toast": {
      toast: { add: (message) => notices.push(message) },
    },
  })
  const items = nodes(
    actions.JobActions({ jobId: "job-123", title: "Frontend Developer" })
  )
  const dialog = items.find((item) => item?.type === "DeleteJobDialog")
  assert.equal(dialog.props.job._id, "job-123")
  assert.equal(dialog.props.job.title, "Frontend Developer")
  const buttons = items.filter((item) => item?.type === "Button")
  assert.equal(buttons.length, 1)
  assert.equal(buttons[0].props.size, "icon-sm")
  assert.ok(!items.includes("Update"))
  const details = items.find(
    (item) => item?.props?.href === "/Browse-jobs/job-123"
  )
  assert.ok(details.props["aria-label"].includes("Frontend Developer"))
  for (const button of buttons) {
    assert.ok(button.props["aria-label"].includes("Frontend Developer"))
    button.props.onClick()
  }
  assert.equal(notices.length, 1)
})

test("manage jobs never shows unowned jobs when there is no current user", async () => {
  const page = load("app/dashboard/recruiter/jobs/page.tsx", {
    "next/link": { default: "a" },
    "@/lib/getUserSession": { getCurrentUser: async () => null },
    "@/lib/api/jobs": {
      getJobs: async () => {
        throw new Error("Should not fetch")
      },
    },
    "./job-list": { JobList: "JobList" },
  })
  const items = nodes(await page.default())
  assert.ok(!items.some((item) => item?.type === "JobList"))
  assert.ok(items.includes("No jobs posted yet"))
})
