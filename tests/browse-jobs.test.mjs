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
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports, require: (name) => mocks[name] ?? require(name) }
  )
  return exports
}
const browsing = load("lib/browse-jobs.ts")
const empty = {
  keyword: "",
  types: [],
  category: "",
  minSalary: "",
  maxSalary: "",
  frequency: "",
}
const jobs = [
  {
    _id: "job-1",
    title: "Frontend Developer",
    companyName: "HireLoop",
    location: "New York",
    category: "Engineering & Tech",
    jobType: "Full-time",
    minSalary: "25",
    maxSalary: "40",
    salaryFrequency: "hourly",
    createdAt: "2026-01-01",
  },
  {
    _id: "job-2",
    title: "Brand Designer",
    companyName: "Studio",
    location: "London",
    category: "Design & Creative",
    jobType: "Freelance",
    minSalary: "1000",
    maxSalary: "2000",
    salaryFrequency: "monthly",
    createdAt: "2026-02-01",
  },
  {
    _id: "job-3",
    title: "Backend Engineer",
    companyName: "Studio",
    location: "Berlin",
    category: "Engineering & Tech",
    jobType: "Contract",
    minSalary: "30",
    maxSalary: "50",
    salaryFrequency: "hourly",
    createdAt: "2026-03-01",
  },
]

test("browse defaults to newest first and supports oldest and title sorting", () => {
  assert.equal(browsing.filterJobs(jobs, empty, "newest")[0]._id, "job-3")
  assert.equal(browsing.filterJobs(jobs, empty, "oldest")[0]._id, "job-1")
  assert.equal(browsing.filterJobs(jobs, empty, "title")[0]._id, "job-3")
  assert.equal(jobs[0]._id, "job-1", "sorting does not mutate fetched jobs")
  const legacy = [
    { ...jobs[0], _id: "600000000000000000000000", createdAt: undefined },
    { ...jobs[0], _id: "650000000000000000000000", createdAt: undefined },
  ]
  assert.equal(
    browsing.filterJobs(legacy, empty, "newest")[0]._id,
    legacy[1]._id
  )
})

test("search matches title, company and location, not filter-only fields", () => {
  for (const keyword of [" FRONTEND ", "hireloop", "new york"]) {
    const result = browsing.filterJobs(jobs, { ...empty, keyword }, "newest")
    assert.equal(result.length, 1)
    assert.equal(result[0]._id, "job-1")
  }
  assert.equal(
    browsing.filterJobs(jobs, { ...empty, keyword: "Full-time" }, "newest")
      .length,
    0
  )
})

test("type, category, salary bounds and pay period filters combine", () => {
  const result = browsing.filterJobs(
    jobs,
    {
      ...empty,
      types: ["Freelance"],
      category: "Design & Creative",
      minSalary: "1000",
      maxSalary: "2000",
      frequency: "monthly",
    },
    "newest"
  )
  assert.equal(result.length, 1)
  assert.equal(result[0]._id, "job-2")
  assert.equal(
    browsing.filterJobs(
      jobs,
      { ...empty, minSalary: "25", maxSalary: "45", frequency: "hourly" },
      "newest"
    )[0]._id,
    "job-1"
  )
  assert.equal(
    browsing.filterJobs(jobs, { ...empty, maxSalary: "40" }, "newest").length,
    1
  )
  assert.equal(
    browsing.filterJobs(jobs, { ...empty, minSalary: "9000" }, "newest").length,
    0
  )
})

function nodes(element) {
  if (!element || typeof element !== "object") return [element]
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

function setup(records = jobs, error = "") {
  const states = []
  let index = 0
  const mocks = {
    react: {
      useState: (initial) => {
        const current = index++
        if (!(current in states)) states[current] = initial
        return [
          states[current],
          (value) => {
            states[current] = value
          },
        ]
      },
    },
    "@/lib/browse-jobs": browsing,
    "@/app/components/browseCard": { BrowseCard: "BrowseCard" },
  }
  for (const [file, names] of Object.entries({
    button: ["Button"],
    card: ["Card", "CardContent"],
    checkbox: ["Checkbox"],
    input: ["Input"],
    label: ["Label"],
    "native-select": ["NativeSelect", "NativeSelectOption"],
    pagination: ["Pagination", "PaginationContent", "PaginationItem"],
  }))
    mocks[`@/components/ui/${file}`] = Object.fromEntries(
      names.map((name) => [name, name])
    )
  const component = load("app/components/BrowseJobs.tsx", mocks)
  return () => {
    index = 0
    return nodes(component.BrowseJobs({ jobs: records, error }))
  }
}

test("browse paginates six cards at a time and resets the page when filters change", () => {
  const records = Array.from({ length: 14 }, (_, index) => ({
    ...jobs[0],
    _id: `job-${index}`,
    createdAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
  }))
  const render = setup(records)
  let items = render()
  let cards = items.filter((item) => item?.type === "BrowseCard")
  assert.equal(cards.length, 6)
  assert.equal(cards[0].props.job._id, "job-13")
  assert.equal(
    items.find((item) => item?.props?.["aria-label"] === "Previous page").props
      .disabled,
    true
  )
  items
    .find((item) => item?.props?.["aria-label"] === "Next page")
    .props.onClick()
  items = render()
  assert.equal(
    items.filter((item) => item?.type === "BrowseCard")[0].props.job._id,
    "job-7"
  )
  items
    .find((item) => item?.props?.id === "job-category")
    .props.onChange({ target: { value: "Design & Creative" } })
  items = render()
  assert.ok(items.includes("No matching jobs"))
  items
    .find(
      (item) =>
        item?.props?.onClick && nodes(item).includes("Clear search and filters")
    )
    .props.onClick()
  cards = render().filter((item) => item?.type === "BrowseCard")
  assert.equal(cards[0].props.job._id, "job-13")
})

test("browse search submits a keyword and displays empty and failed states", () => {
  const render = setup()
  render()
    .find((item) => item?.props?.id === "job-search")
    .props.onChange({ target: { value: "London" } })
  render()
    .find((item) => item?.props?.role === "search")
    .props.onSubmit({ preventDefault() {} })
  const cards = render().filter((item) => item?.type === "BrowseCard")
  assert.equal(cards.length, 1)
  assert.equal(cards[0].props.job._id, "job-2")
  assert.ok(setup([])().includes("No jobs posted yet"))
  assert.ok(
    setup([], "Offline")().some((item) => item?.props?.role === "alert")
  )
})

test("salary inputs stay in equal-width columns beneath a non-floating heading", () => {
  const items = setup()()
  const fieldset = items.find(
    (item) =>
      item?.type === "fieldset" &&
      nodes(item).some((node) => node?.props?.id === "filter-min")
  )
  const legend = nodes(fieldset).find((item) => item?.type === "legend")
  assert.ok(!legend.props.className.includes("float-"))
  const columns = nodes(fieldset).find((item) =>
    item?.props?.className?.includes("grid-cols-2")
  )
  assert.equal(columns.props.children.length, 2)
  for (const column of columns.props.children) {
    assert.ok(column.props.className.includes("min-w-0"))
    const input = nodes(column).find((item) => item?.type === "Input")
    assert.ok(input.props.className.includes("w-full min-w-0"))
  }
})

test("reusable browse card links to details and displays dollar compensation", () => {
  const display = load("lib/job-display.ts")
  const card = load("app/components/browseCard.tsx", {
    "next/link": { default: "a" },
    "@/lib/job-display": display,
    "@/components/ui/card": { Card: "Card", CardContent: "CardContent" },
    "@/components/ui/badge": { Badge: "Badge" },
  })
  const items = nodes(card.BrowseCard({ job: jobs[0] }))
  assert.ok(items.includes("$25 – $40 / hr"))
  assert.ok(items.some((item) => item?.props?.href === "/Browse-jobs/job-1"))
})

test("browse page fetches from the existing jobs API and handles failures", async () => {
  for (const fail of [false, true]) {
    const page = load("app/Browse-jobs/page.tsx", {
      "@/lib/api/jobs": {
        getJobs: async () => {
          if (fail) throw new Error("Offline")
          return jobs
        },
      },
      "@/app/components/BrowseJobs": { BrowseJobs: "BrowseJobs" },
    })
    const browser = nodes(await page.default()).find(
      (item) => item?.type === "BrowseJobs"
    )
    assert.equal(browser.props.jobs.length, fail ? 0 : jobs.length)
    assert.equal(Boolean(browser.props.error), fail)
  }
})
