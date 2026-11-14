import { test } from "node:test"
import assert from "node:assert/strict"
import {
  buildJobsQuery,
  registerJobsRoutes,
} from "../docs/backend/jobs-routes.mjs"

test("backend supports no filters, repeated job types, exact category and remote booleans", () => {
  assert.deepEqual(buildJobsQuery({}), {})
  assert.deepEqual(
    buildJobsQuery({
      jobType: ["Full-time", "Contract"],
      category: "Engineering & Tech",
      isRemote: "false",
    }),
    {
      jobType: { $in: ["Full-time", "Contract"] },
      category: "Engineering & Tech",
      isRemote: false,
    }
  )
  assert.equal(buildJobsQuery({ isRemote: "true" }).isRemote, true)
  assert.deepEqual(buildJobsQuery({ jobType: "Freelance" }).jobType.$in, [
    "Freelance",
  ])
})

test("backend escapes regex input and searches actual project field names", () => {
  const query = buildJobsQuery({ search: "React + C&[x].*" })
  assert.deepEqual(
    query.$or.map((item) => Object.keys(item)[0]),
    ["title", "companyName", "location"]
  )
  const expression = query.$or[0].title
  const regex = new RegExp(expression.$regex, expression.$options)
  assert.ok(regex.test("Learn react + c&[x].* today"))
  assert.equal(regex.test("React anything"), false)
})

test("backend rejects invalid query types, values and salary ranges", () => {
  for (const params of [
    { search: { $ne: "" } },
    { category: ["x", "y"] },
    { isRemote: "remote" },
    { salaryFrequency: "weekly" },
    { jobType: ["Admin"] },
    { jobType: { $ne: "" } },
    { minSalary: "NaN" },
    { maxSalary: "-1" },
    { minSalary: "Infinity" },
    { minSalary: "50", maxSalary: "20" },
    { search: "a".repeat(201) },
  ])
    assert.throws(() => buildJobsQuery(params))
})

// Evaluate only expressions used by this example to check legacy salary behavior.
// This is not a substitute for running the endpoint against an actual MongoDB.
function evaluate(expression, job) {
  if (typeof expression === "string" && expression.startsWith("$"))
    return job[expression.slice(1)]
  if (!expression || typeof expression !== "object") return expression
  if (Array.isArray(expression))
    return expression.map((item) => evaluate(item, job))
  const [operator, value] = Object.entries(expression)[0]
  if (operator === "$convert") {
    const input = evaluate(value.input, job)
    return input == null || input === "" || !Number.isFinite(Number(input))
      ? null
      : Number(input)
  }
  const args = evaluate(value, job)
  switch (operator) {
    case "$and":
      return args.every(Boolean)
    case "$eq":
      return args[0] === args[1]
    case "$ne":
      return args[0] !== args[1]
    case "$gte":
      return args[0] >= args[1]
    case "$lte":
      return args[0] <= args[1]
    case "$ifNull":
      return args[0] ?? args[1]
    case "$in":
      return args[1].includes(args[0])
    case "$cond":
      return args[0] ? args[1] : args[2]
    default:
      throw new Error(`Unsupported expression ${operator}`)
  }
}

test("salary comparison supports strings, numeric zero and legacy frequency, excluding missing amounts", () => {
  const query = buildJobsQuery({
    minSalary: "0",
    maxSalary: "40",
    salaryFrequency: "hourly",
  })
  for (const job of [
    { minSalary: "25", maxSalary: "40", frequency: "hourly" },
    { minSalary: 0, maxSalary: 40, salaryFrequency: "hourly" },
    {
      minSalary: "25",
      maxSalary: 40,
      salaryFrequency: "",
      frequency: "hourly",
    },
  ])
    assert.equal(evaluate(query.$expr, job), true)
  for (const job of [
    { minSalary: "25", maxSalary: "400", frequency: "hourly" },
    { minSalary: "25", maxSalary: "40", salaryFrequency: "monthly" },
    { minSalary: "25", frequency: "hourly" },
    { minSalary: "", maxSalary: "40", frequency: "hourly" },
    { minSalary: "invalid", maxSalary: "40", frequency: "hourly" },
  ])
    assert.equal(evaluate(query.$expr, job), false)
})

function routes(collection) {
  const handlers = {}
  registerJobsRoutes(
    {
      get(path, handler) {
        handlers[path] = handler
      },
    },
    collection
  )
  return handlers
}
function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    send(body) {
      this.body = body
      return this
    },
  }
}

test("route passes the query to MongoDB and preserves the array response", async () => {
  const records = [{ _id: "job" }]
  let query
  const handlers = routes({
    find(value) {
      query = value
      return { toArray: async () => records }
    },
  })
  const res = response()
  await handlers["/jobs"](
    { query: { jobType: "Full-time", isRemote: "true" } },
    res
  )
  assert.equal(query.isRemote, true)
  assert.equal(res.body, records)
  const invalid = response()
  await handlers["/jobs"]({ query: { minSalary: "bad" } }, invalid)
  assert.equal(invalid.statusCode, 400)
})

test("metadata route registers before job listing and returns global options/counts", async () => {
  const handlers = routes({
    distinct: async (field) => {
      assert.equal(field, "category")
      return ["Engineering & Tech", "Design & Creative"]
    },
    aggregate: () => ({
      toArray: async () => [
        { _id: "Full-time", count: 3 },
        { _id: "Contract", count: 2 },
      ],
    }),
  })
  assert.equal(Object.keys(handlers)[0], "/jobs/filters")
  const res = response()
  await handlers["/jobs/filters"]({}, res)
  assert.deepEqual(res.body, {
    categories: ["Design & Creative", "Engineering & Tech"],
    jobTypeCounts: { "Full-time": 3, Contract: 2 },
  })
})
