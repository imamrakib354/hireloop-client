import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import ts from "typescript"

function load(path, fetch) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      fetch,
      process: { env: { NEXT_PUBLIC_API_BASE_URL: "https://api.example.com" } },
    }
  )
  return exports
}

test("getCompanies fetches fresh records and rejects failures or invalid responses", async () => {
  const records = [{ _id: "company-1", recruiterId: "user-1" }]
  const api = load("lib/api/companies.ts", async (url, options) => {
    assert.equal(url, "https://api.example.com/companies")
    assert.equal(options.cache, "no-store")
    return { ok: true, json: async () => records }
  })
  assert.equal(await api.getCompanies(), records)
  for (const response of [
    { ok: false },
    { ok: true, json: async () => ({ error: "invalid" }) },
  ]) {
    await assert.rejects(
      load("lib/api/companies.ts", async () => response).getCompanies()
    )
  }
})

test("createCompany uses POST with a pending verification status", async () => {
  const result = { acknowledged: true, insertedId: "company-1" }
  const api = load("lib/actions/companies.ts", async (url, options) => {
    assert.equal(url, "https://api.example.com/companies")
    assert.equal(options.method, "POST")
    const body = JSON.parse(options.body)
    assert.equal(body.recruiterId, "user-1")
    assert.equal(body.verificationStatus, "pending")
    return { ok: true, json: async () => result }
  })
  assert.equal(
    await api.createCompany({ name: "HireLoop", recruiterId: "user-1" }),
    result
  )
})

test("updateCompany uses PATCH and accepts unchanged records", async () => {
  const result = { acknowledged: true, matchedCount: 1, modifiedCount: 0 }
  const api = load("lib/actions/companies.ts", async (url, options) => {
    assert.equal(url, "https://api.example.com/companies/company-1")
    assert.equal(options.method, "PATCH")
    assert.equal(JSON.parse(options.body).name, "HireLoop")
    return { ok: true, json: async () => result }
  })
  assert.equal(
    await api.updateCompany("company-1", { name: "HireLoop" }),
    result
  )
  const failed = load("lib/actions/companies.ts", async () => ({ ok: false }))
  await assert.rejects(failed.createCompany({}), /Could not create/)
  await assert.rejects(
    failed.updateCompany("company-1", {}),
    /Could not update/
  )
})
