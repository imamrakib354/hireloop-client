import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import ts from "typescript"

const display = {}
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/job-display.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: display }
)

test("salary ranges use the correct units", () => {
  for (const [frequency, unit] of [
    ["hourly", "hr"],
    ["monthly", "month"],
    ["yearly", "year"],
  ]) {
    assert.equal(
      display.formatCompensation("25", "40", frequency),
      `€25 – €40 / ${unit}`
    )
  }
  assert.equal(display.formatCompensation("", "", "hourly"), "—")
})

test("deadline status includes the full deadline day", () => {
  const now = new Date("2027-05-30T12:00:00Z")
  assert.equal(display.deadlineDetails("2027-05-30", now).status, "Open")
  assert.equal(display.deadlineDetails("2027-05-29", now).status, "Expired")
  assert.equal(display.deadlineDetails("2027-05-30", now).label, "May 30, 2027")
  assert.equal(display.deadlineDetails("invalid", now).status, "—")
})
