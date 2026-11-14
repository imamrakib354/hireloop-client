import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)
function load(path, mocks = {}, globals = {}) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      URLSearchParams,
      require: (name) => mocks[name] ?? require(name),
      ...globals,
    }
  )
  return exports
}
function nodes(element) {
  if (!element || typeof element !== "object") return [element]
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

const helpers = load("lib/jobs/search-params.ts")
const defaults = helpers.readJobSearchParams({})
const jobs = [
  {
    _id: "job-1",
    title: "Frontend Developer",
    companyName: "HireLoop",
    location: "Dhaka",
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
]
const options = {
  categories: ["Engineering & Tech", "Design & Creative"],
  jobTypeCounts: { "Full-time": 1, Freelance: 1 },
}
const uiMocks = {}
for (const [file, names] of Object.entries({
  button: ["Button"],
  card: ["Card", "CardContent"],
  checkbox: ["Checkbox"],
  input: ["Input"],
  label: ["Label"],
  "native-select": ["NativeSelect", "NativeSelectOption"],
  pagination: ["Pagination", "PaginationContent", "PaginationItem"],
  badge: ["Badge"],
}))
  uiMocks[`@/components/ui/${file}`] = Object.fromEntries(
    names.map((name) => [name, name])
  )

// Shallow React harness: test component callbacks and rerender their local state.
function component(file, name, props, mocks = {}, pending = false) {
  const state = []
  let index = 0
  const loaded = load(`app/Browse-jobs/_components/${file}.tsx`, {
    ...uiMocks,
    "@/lib/jobs/search-params": helpers,
    react: {
      useState(initial) {
        const key = index++
        if (!(key in state)) state[key] = initial
        return [
          state[key],
          (value) => {
            state[key] = typeof value === "function" ? value(state[key]) : value
          },
        ]
      },
      useTransition: () => [pending, (callback) => callback()],
    },
    ...mocks,
  })
  return () => {
    index = 0
    return nodes(loaded[name](props))
  }
}

test("URL parser supports repeated types and validates defaults and unknown values", () => {
  const parsed = helpers.readJobSearchParams({
    jobType: ["Full-time", "Contract", "bad", "Full-time"],
    search: " react ",
    page: "2",
    sort: "title",
    isRemote: "false",
  })
  assert.deepEqual(Array.from(parsed.jobTypes), ["Full-time", "Contract"])
  assert.equal(parsed.search, "react")
  assert.equal(parsed.page, 2)
  assert.equal(parsed.isRemote, "false")
  for (const page of [
    "0",
    "-1",
    "2.5",
    "Infinity",
    "bad",
    "99999999999999999999",
  ]) {
    assert.equal(helpers.readJobSearchParams({ page }).page, 1)
  }
  const invalid = helpers.readJobSearchParams({
    minSalary: "-5",
    maxSalary: "NaN",
    sort: "bad",
    salaryFrequency: "weekly",
    isRemote: "remote",
    search: ["x", "y"],
  })
  assert.equal(invalid.minSalary, "")
  assert.equal(invalid.maxSalary, "")
  assert.equal(invalid.sort, "newest")
  assert.equal(invalid.salaryFrequency, "")
  assert.equal(invalid.isRemote, "")
  assert.equal(invalid.search, "")
})

test("backend query includes only filters and safely encodes text and repeated types", () => {
  const parsed = helpers.readJobSearchParams({
    search: "React + C&[x]",
    category: "Design & Creative",
    jobType: ["Full-time", "Contract"],
    minSalary: "0",
    maxSalary: "40",
    salaryFrequency: "hourly",
    isRemote: "false",
    sort: "title",
    page: "3",
    ignored: "bad",
  })
  const params = new URLSearchParams(helpers.jobFiltersQuery(parsed))
  assert.equal(params.get("search"), "React + C&[x]")
  assert.equal(params.get("category"), "Design & Creative")
  assert.deepEqual(params.getAll("jobType"), ["Full-time", "Contract"])
  assert.equal(params.get("minSalary"), "0")
  assert.equal(params.get("isRemote"), "false")
  for (const key of ["sort", "page", "ignored"])
    assert.equal(params.has(key), false)
})

test("URL updates preserve other filters, remove empty values, and reset page", () => {
  let query = helpers.updateJobQuery(
    "category=Design&jobType=Contract&page=4&sort=title",
    { search: " react " }
  )
  let params = new URLSearchParams(query)
  assert.equal(params.get("category"), "Design")
  assert.equal(params.get("jobType"), "Contract")
  assert.equal(params.get("search"), "react")
  assert.equal(params.has("page"), false)
  query = helpers.updateJobQuery(query, {
    jobType: ["Full-time", "Contract"],
    search: "",
  })
  params = new URLSearchParams(
    helpers.updateJobQuery(query, { page: "2" }, false)
  )
  assert.deepEqual(params.getAll("jobType"), ["Full-time", "Contract"])
  assert.equal(params.has("search"), false)
  assert.equal(params.get("page"), "2")
  assert.equal(params.get("sort"), "title")
})

test("sorting preserves input records and supports legacy MongoDB timestamps", () => {
  assert.equal(helpers.sortJobs(jobs, "newest")[0]._id, "job-2")
  assert.equal(helpers.sortJobs(jobs, "oldest")[0]._id, "job-1")
  assert.equal(helpers.sortJobs(jobs, "title")[0]._id, "job-2")
  assert.equal(jobs[0]._id, "job-1")
  const legacy = [
    { ...jobs[0], _id: "600000000000000000000000", createdAt: undefined },
    { ...jobs[0], _id: "650000000000000000000000", createdAt: "invalid" },
  ]
  assert.equal(helpers.sortJobs(legacy, "newest")[0]._id, legacy[1]._id)
})

function browseSetup(
  filters = defaults,
  records = jobs,
  pending = false,
  error = ""
) {
  const navigations = []
  let refreshes = 0
  const query = helpers.jobFiltersQuery(filters)
  const props = { jobs: records, filters, options, error }
  const render = component(
    "browse-jobs",
    "BrowseJobs",
    props,
    {
      "next/navigation": {
        usePathname: () => "/Browse-jobs",
        useSearchParams: () =>
          new URLSearchParams(
            `${query}&sort=${filters.sort}&page=${filters.page}`
          ),
        useRouter: () => ({
          push: (url, settings) => navigations.push({ url, settings }),
          refresh: () => refreshes++,
        }),
      },
      "./job-search-bar": { JobSearchBar: "JobSearchBar" },
      "./job-filters-panel": { JobFiltersPanel: "JobFiltersPanel" },
      "./job-results": { JobResults: "JobResults" },
    },
    pending
  )
  return {
    render,
    navigations,
    props,
    get refreshes() {
      return refreshes
    },
  }
}

test("search and filter callbacks navigate instead of filtering returned jobs again", () => {
  const filters = helpers.readJobSearchParams({
    category: "Design & Creative",
    jobType: ["Contract", "Full-time"],
    page: "4",
  })
  const setup = browseSetup(filters)
  const items = setup.render()
  items.find((node) => node?.type === "JobSearchBar").props.onSearch("react")
  const url = new URL(setup.navigations[0].url, "http://localhost")
  assert.equal(url.pathname, "/Browse-jobs")
  assert.equal(url.searchParams.get("search"), "react")
  assert.equal(url.searchParams.get("category"), "Design & Creative")
  assert.deepEqual(url.searchParams.getAll("jobType"), [
    "Contract",
    "Full-time",
  ])
  assert.equal(url.searchParams.has("page"), false)
  assert.equal(setup.navigations[0].settings.scroll, false)
  const results = items.find((node) => node?.type === "JobResults").props
  assert.equal(
    results.jobs.length,
    jobs.length,
    "backend owns filtering, even if mocks return unrelated jobs"
  )
  results.onPage(2)
  assert.equal(
    new URL(setup.navigations[1].url, "http://localhost").searchParams.get(
      "page"
    ),
    "2"
  )
})

test("reset clears filters and page, preserves sort, and discards unsubmitted drafts", () => {
  const setup = browseSetup({
    ...defaults,
    search: "react",
    sort: "title",
    page: 3,
  })
  let items = setup.render()
  const searchKey = items.find((node) => node?.type === "JobSearchBar").key
  items.find((node) => node?.type === "JobFiltersPanel").props.onReset()
  assert.equal(setup.navigations[0].url, "/Browse-jobs?sort=title")
  items = setup.render()
  assert.notEqual(
    items.find((node) => node?.type === "JobSearchBar").key,
    searchKey
  )
})

test("navigation disables controls while pending, and bookmarked props restore selections", () => {
  const setup = browseSetup(
    {
      ...defaults,
      search: "saved",
      category: "Design & Creative",
      minSalary: "20",
    },
    jobs,
    true
  )
  const items = setup.render()
  assert.equal(
    items.find((node) => node?.type === "fieldset").props.disabled,
    true
  )
  assert.equal(
    items.find((node) => node?.type === "JobSearchBar").props.search,
    "saved"
  )
  assert.equal(
    items.find((node) => node?.type === "JobFiltersPanel").props.filters
      .minSalary,
    "20"
  )
  items.find((node) => node?.type === "JobSearchBar").props.onSearch("another")
  assert.equal(setup.navigations.length, 0)
})

test("out-of-range pages clamp and failed request retry preserves the URL", () => {
  const setup = browseSetup({ ...defaults, page: 999 })
  assert.equal(
    setup.render().find((node) => node?.type === "JobResults").props.page,
    1
  )
  const failed = browseSetup(defaults, [], false, "Offline")
  const items = failed.render()
  assert.ok(items.some((node) => node?.props?.role === "alert"))
  items
    .find(
      (node) => node?.type === "Button" && nodes(node).includes("Try again")
    )
    .props.onClick()
  assert.equal(failed.refreshes, 1)
  assert.equal(failed.navigations.length, 0)
})

test("search input submits only on search, not on each keystroke", () => {
  const searches = []
  const render = component("job-search-bar", "JobSearchBar", {
    search: "saved",
    onSearch: (value) => searches.push(value),
  })
  assert.equal(
    render().find((node) => node?.props?.id === "job-search").props.value,
    "saved"
  )
  render()
    .find((node) => node?.props?.id === "job-search")
    .props.onChange({ target: { value: " react " } })
  assert.equal(searches.length, 0)
  render()
    .find((node) => node?.props?.role === "search")
    .props.onSubmit({ preventDefault() {} })
  assert.deepEqual(searches, ["react"])
})

function filtersSetup(filters = defaults, optionsError = "") {
  const changes = []
  const render = component("job-filters-panel", "JobFiltersPanel", {
    filters,
    options,
    optionsError,
    onChange: (value) => changes.push(value),
    onReset() {},
  })
  return { render, changes }
}

test("checkboxes preserve multi-select and metadata keeps categories and counts stable", () => {
  const setup = filtersSetup({ ...defaults, jobTypes: ["Full-time"] })
  const items = setup.render()
  assert.equal(
    items.find((node) => node?.props?.id === "type-Full-time").props.checked,
    true
  )
  items
    .find((node) => node?.props?.id === "type-Contract")
    .props.onCheckedChange(true)
  assert.deepEqual(Array.from(setup.changes[0].jobType), [
    "Full-time",
    "Contract",
  ])
  assert.ok(items.some((node) => node?.props?.value === "Design & Creative"))
  const failed = filtersSetup(defaults, "Metadata offline").render()
  assert.equal(
    failed.find((node) => node?.props?.id === "job-category").props.disabled,
    true
  )
  assert.ok(failed.includes("—"))
})

test("salary drafts apply on leaving the group or Enter, not per keystroke", () => {
  const setup = filtersSetup()
  setup
    .render()
    .find((node) => node?.props?.id === "filter-min")
    .props.onChange({ target: { value: "25" } })
  assert.equal(setup.changes.length, 0)
  let group = setup.render().find((node) => node?.props?.onBlur)
  group.props.onBlur({
    currentTarget: { contains: () => true },
    relatedTarget: {},
  })
  assert.equal(setup.changes.length, 0)
  group.props.onBlur({
    currentTarget: { contains: () => false },
    relatedTarget: null,
  })
  assert.equal(setup.changes[0].minSalary, "25")
  group.props.onKeyDown({ key: "Enter", preventDefault() {} })
  assert.equal(setup.changes.length, 2)
})

test("invalid salary ranges remain visible and do not navigate", () => {
  const setup = filtersSetup({ ...defaults, minSalary: "50", maxSalary: "20" })
  const items = setup.render()
  assert.equal(
    items.find((node) => node?.props?.id === "filter-min").props[
      "aria-invalid"
    ],
    true
  )
  items
    .find((node) => node?.props?.onBlur)
    .props.onBlur({
      currentTarget: { contains: () => false },
      relatedTarget: null,
    })
  assert.equal(setup.changes.length, 0)
  const columns = items.find((node) =>
    node?.props?.className?.includes("grid-cols-2")
  )
  assert.equal(columns.props.children.length, 2)
  for (const column of columns.props.children)
    assert.ok(column.props.className.includes("min-w-0"))
})

test("results display six cards and distinguish no matches from no posted jobs", () => {
  const records = Array.from({ length: 14 }, (_, index) => ({
    ...jobs[0],
    _id: `job-${index}`,
  }))
  const props = {
    jobs: records,
    page: 2,
    sort: "newest",
    hasFilters: false,
    onSort() {},
    onPage() {},
    onReset() {},
  }
  const mocks = {
    "./job-card": { BrowseCard: "BrowseCard" },
    "./job-pagination": { JobPagination: "JobPagination" },
  }
  const items = component("job-results", "JobResults", props, mocks)()
  const cards = items.filter((node) => node?.type === "BrowseCard")
  assert.equal(cards.length, 6)
  assert.equal(cards[0].props.job._id, "job-6")
  assert.ok(
    component(
      "job-results",
      "JobResults",
      { ...props, jobs: [] },
      mocks
    )().includes("No jobs posted yet")
  )
  assert.ok(
    component(
      "job-results",
      "JobResults",
      { ...props, jobs: [], hasFilters: true },
      mocks
    )().includes("No matching jobs")
  )
})

test("pagination retains existing buttons and six-per-page totals", () => {
  const pages = []
  const items = component("job-pagination", "JobPagination", {
    page: 2,
    total: 14,
    onPage: (page) => pages.push(page),
  })()
  items
    .find((node) => node?.props?.["aria-label"] === "Next page")
    .props.onClick()
  assert.deepEqual(pages, [3])
  assert.equal(
    items.find((node) => node?.props?.["aria-label"] === "Page 2").props[
      "aria-current"
    ],
    "page"
  )
})

test("moved card preserves its details link and salary display", () => {
  const card = load("app/Browse-jobs/_components/job-card.tsx", {
    ...uiMocks,
    "next/link": { default: "a" },
    "@/lib/job-display": load("lib/job-display.ts"),
  })
  const items = nodes(card.BrowseCard({ job: jobs[0] }))
  assert.ok(items.includes("$25 – $40 / hr"))
  assert.ok(items.some((node) => node?.props?.href === "/Browse-jobs/job-1"))
})

test("server page forwards validated filters and loads metadata independently", async () => {
  for (const failJobs of [false, true]) {
    for (const failMetadata of [false, true]) {
      let query
      const page = load("app/Browse-jobs/page.tsx", {
        "@/lib/jobs/search-params": helpers,
        "./_components/browse-jobs": { BrowseJobs: "BrowseJobs" },
        "@/lib/api/jobs": {
          getJobs: async (value) => {
            query = value
            if (failJobs) throw new Error("Offline")
            return jobs
          },
          getJobFilterOptions: async () => {
            if (failMetadata) throw new Error("Offline")
            return options
          },
        },
      })
      const result = await page.default({
        searchParams: Promise.resolve({
          search: "react",
          jobType: ["Contract", "Full-time"],
          page: "2",
          sort: "title",
        }),
      })
      const browser = nodes(result).find((node) => node?.type === "BrowseJobs")
      assert.equal(new URLSearchParams(query).get("search"), "react")
      assert.equal(new URLSearchParams(query).has("page"), false)
      assert.equal(browser.props.jobs.length, failJobs ? 0 : 2)
      assert.equal(Boolean(browser.props.error), failJobs)
      assert.equal(Boolean(browser.props.optionsError), failMetadata)
      assert.equal(browser.props.filters.page, 2)
    }
  }
})
