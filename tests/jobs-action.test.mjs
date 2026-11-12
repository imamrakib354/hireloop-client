import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import ts from "typescript"

function setup(fetch, baseURL, path = "lib/actions/jobs.ts") {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      fetch,
      process: { env: { NEXT_PUBLIC_API_BASE_URL: baseURL } },
    }
  )
  return exports
}

test("createJob posts JSON to the configured backend and returns the insert result", async () => {
  const result = { acknowledged: true, insertedId: "job-123" }
  const data = {
    title: "Frontend Developer",
    minSalary: "25",
    salaryFrequency: "hourly",
    isRemote: true,
  }
  const { createJob } = setup(async (url, options) => {
    assert.equal(url, "https://api.example.com/jobs")
    assert.equal(options.method, "POST")
    assert.equal(options.headers["content-type"], "application/json")
    assert.deepEqual(JSON.parse(options.body), data)
    return { ok: true, json: async () => result }
  }, "https://api.example.com")
  assert.equal(await createJob(data), result)
})

test("createJob uses localhost when the API URL is not configured", async () => {
  const { createJob } = setup(async (url) => {
    assert.equal(url, "http://localhost:5000/jobs")
    return {
      ok: true,
      json: async () => ({ acknowledged: true, insertedId: "job-123" }),
    }
  })
  await createJob({ title: "Test" })
})

test("createJob rejects HTTP errors", async () => {
  const { createJob } = setup(async () => ({ ok: false }))
  await assert.rejects(createJob({ title: "Test" }), /Could not publish/)
})

test("deleteJob sends DELETE and returns the backend result", async () => {
  const result = { acknowledged: true, deletedCount: 1 }
  const { deleteJob } = setup(async (url, options) => {
    assert.equal(url, "https://api.example.com/jobs/job-123")
    assert.equal(options.method, "DELETE")
    return { ok: true, json: async () => result }
  }, "https://api.example.com")
  assert.equal(await deleteJob("job-123"), result)
})

test("deleteJob rejects HTTP errors", async () => {
  const { deleteJob } = setup(async () => ({ ok: false }))
  await assert.rejects(deleteJob("job-123"), /Could not delete/)
})

test("getJobs fetches fresh records and normalizes legacy salaries and frequency", async () => {
  const { getJobs } = setup(
    async (url, options) => {
      assert.equal(url, "https://api.example.com/jobs")
      assert.equal(options.cache, "no-store")
      return {
        ok: true,
        json: async () => [
          { _id: "old", minSalary: 25, maxSalary: 40, frequency: "hourly" },
          {
            _id: "new",
            minSalary: "1000",
            maxSalary: "2000",
            salaryFrequency: "monthly",
          },
        ],
      }
    },
    "https://api.example.com",
    "lib/api/jobs.ts"
  )
  const jobs = await getJobs()
  assert.equal(jobs[0].minSalary, "25")
  assert.equal(jobs[0].maxSalary, "40")
  assert.equal(jobs[0].salaryFrequency, "hourly")
  assert.equal(jobs[1].salaryFrequency, "monthly")
})

test("getJobs handles an empty list and rejects failed or invalid responses", async () => {
  const empty = setup(
    async () => ({ ok: true, json: async () => [] }),
    undefined,
    "lib/api/jobs.ts"
  )
  assert.equal((await empty.getJobs()).length, 0)
  const failed = setup(
    async () => ({ ok: false }),
    undefined,
    "lib/api/jobs.ts"
  )
  await assert.rejects(failed.getJobs(), /Could not load jobs/)
  const invalid = setup(
    async () => ({
      ok: true,
      json: async () => ({ message: "Error" }),
    }),
    undefined,
    "lib/api/jobs.ts"
  )
  await assert.rejects(invalid.getJobs(), /response is invalid/)
})

test("getJob fetches one fresh record and normalizes legacy compensation", async () => {
  const api = setup(
    async (url, options) => {
      assert.equal(url, "https://api.example.com/jobs/job-123")
      assert.equal(options.cache, "no-store")
      return {
        ok: true,
        json: async () => ({
          _id: "job-123",
          minSalary: 25,
          maxSalary: 40,
          frequency: "hourly",
        }),
      }
    },
    "https://api.example.com",
    "lib/api/jobs.ts"
  )
  const job = await api.getJob("job-123")
  assert.equal(job.minSalary, "25")
  assert.equal(job.maxSalary, "40")
  assert.equal(job.salaryFrequency, "hourly")
})

test("getJob distinguishes missing records from failed and malformed responses", async () => {
  for (const response of [
    { status: 404, ok: false },
    { ok: true, json: async () => null },
  ]) {
    const api = setup(async () => response, undefined, "lib/api/jobs.ts")
    assert.equal(await api.getJob("missing"), null)
  }
  const failed = setup(
    async () => ({ ok: false, status: 500 }),
    undefined,
    "lib/api/jobs.ts"
  )
  await assert.rejects(failed.getJob("job-123"), /Could not load this job/)
  const invalid = setup(
    async () => ({ ok: true, json: async () => ({ error: "Invalid" }) }),
    undefined,
    "lib/api/jobs.ts"
  )
  await assert.rejects(invalid.getJob("job-123"), /response is invalid/)
})
