import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import * as React from "react"
import ts from "typescript"

const loadModule = createRequire(import.meta.url)
const jobDisplay = {}
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/job-display.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: jobDisplay }
)

function setup(
  isRemote = false,
  createJob = async () => ({ acknowledged: true, insertedId: "job-123" }),
  salaryFrequency = "hourly",
  session = { user: { id: "recruiter-123" } },
  isPending = false
) {
  const exports = {}
  const messages = []
  const errors = []
  const busy = []
  const requests = []
  const remoteChanges = []
  const formResets = []
  const salaryChanges = []
  let stateIndex = 0
  const mocks = {
    react: {
      ...React,
      useState: () => {
        const index = stateIndex++
        if (index === 0) return [isRemote, (value) => remoteChanges.push(value)]
        if (index === 1) return ["", (message) => messages.push(message)]
        if (index === 2) return [false, (error) => errors.push(error)]
        if (index === 3) return [false, (value) => busy.push(value)]
        if (index === 4) return [0, (update) => formResets.push(update(0))]
        return [salaryFrequency, (value) => salaryChanges.push(value)]
      },
      useRef: (current) => ({ current }),
    },
    "next/link": { default: "a" },
    "@/lib/auth-client": { useSession: () => ({ data: session, isPending }) },
    "@/lib/job-display": jobDisplay,
    "@/lib/actions/jobs": {
      createJob: (data) => {
        requests.push(data)
        return createJob(data)
      },
    },
  }
  for (const [file, names] of Object.entries({
    button: ["Button"],
    input: ["Input"],
    label: ["Label"],
    textarea: ["Textarea"],
    switch: ["Switch"],
    select: [
      "Select",
      "SelectContent",
      "SelectItem",
      "SelectTrigger",
      "SelectValue",
    ],
  })) {
    mocks[`@/components/ui/${file}`] = Object.fromEntries(
      names.map((name) => [name, name])
    )
  }
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("app/dashboard/recruiter/jobs/new/page.tsx", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }
    ).outputText,
    {
      exports,
      Error,
      require: (name) => mocks[name] ?? loadModule(name),
      FormData: class {
        constructor(form) {
          return form.data
        }
      },
    }
  )
  const tree = exports.default()
  const form = nodes(tree).find((node) => node.type === "form")
  return {
    tree,
    messages,
    errors,
    busy,
    requests,
    remoteChanges,
    formResets,
    salaryChanges,
    submit(values = {}) {
      const data = new FormData()
      for (const [name, value] of Object.entries({
        title: "Frontend Developer",
        companyName: "HireLoop",
        category: "Engineering & Tech",
        jobType: "Full-time",
        location: "New York, USA",
        deadline: "2027-05-30",
        minSalary: "25",
        maxSalary: "40",
        salaryFrequency: "hourly",
        responsibilities: "Build accessible user interfaces.",
        requirements: "Experience with React and TypeScript.",
        ...values,
      }))
        data.set(name, value)
      let prevented = false
      const pending = form.props.onSubmit({
        preventDefault() {
          prevented = true
        },
        currentTarget: { data },
      })
      assert.ok(prevented)
      return pending
    },
  }
}

function nodes(element) {
  if (!element || typeof element !== "object") return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

test("form includes all named fields and a real submit button", () => {
  const items = nodes(setup().tree)
  for (const name of [
    "title",
    "companyName",
    "category",
    "jobType",
    "isRemote",
    "location",
    "deadline",
    "minSalary",
    "maxSalary",
    "salaryFrequency",
    "responsibilities",
    "requirements",
  ]) {
    assert.ok(
      items.some((node) => node.props?.name === name),
      name
    )
  }
  assert.ok(
    items.some((node) => node.type === "Button" && node.props.type === "submit")
  )
  const radios = items.filter((node) => node.props?.type === "radio")
  assert.equal(radios.length, 5)
  assert.equal(radios.filter((node) => node.props.defaultChecked).length, 1)
})

test("textareas grow with their content instead of inheriting fixed input heights", () => {
  const fields = nodes(setup().tree).filter((node) => node.type === "Textarea")
  assert.equal(fields.length, 2)
  for (const field of fields) {
    assert.ok(field.props.className.includes("field-sizing-content"))
    assert.ok(field.props.className.includes("h-auto"))
    assert.ok(field.props.className.includes("resize-none"))
    assert.ok(!field.props.className.includes("h-11"))
  }
})

test("valid form sends typed job data and confirms the inserted job", async () => {
  const form = setup()
  await form.submit({ title: " Frontend Developer " })
  assert.equal(form.errors.at(-1), false)
  assert.match(form.messages.at(-1), /Frontend Developer/)
  assert.match(form.messages.at(-1), /published successfully/)
  assert.equal(form.requests.length, 1)
  assert.equal(form.requests[0].title, "Frontend Developer")
  assert.equal(form.requests[0].recruiterId, "recruiter-123")
  assert.ok(Number.isFinite(Date.parse(form.requests[0].createdAt)))
  assert.equal(form.requests[0].minSalary, "25")
  assert.equal(form.requests[0].maxSalary, "40")
  assert.equal(form.requests[0].salaryFrequency, "hourly")
  assert.equal(form.requests[0].frequency, undefined)
  assert.equal(form.requests[0].isRemote, false)
  assert.equal(
    form.requests[0].requirements,
    "Experience with React and TypeScript."
  )
  assert.deepEqual(form.busy, [true, false])
  assert.deepEqual(form.formResets, [1])
  assert.deepEqual(form.remoteChanges, [false])
})

test("publishing requires a current session and disables the button while it loads", async () => {
  const form = setup(false, undefined, "hourly", null)
  await form.submit()
  assert.equal(form.requests.length, 0)
  assert.match(form.messages.at(-1), /sign in/)
  for (const tree of [
    form.tree,
    setup(false, undefined, "hourly", null, true).tree,
  ]) {
    const button = nodes(tree).find(
      (node) => node.type === "Button" && node.props.type === "submit"
    )
    assert.equal(button.props.disabled, true)
  }
})

test("Freelance is offered and can be published as a job type", async () => {
  const form = setup()
  assert.ok(nodes(form.tree).some((node) => node?.props?.value === "Freelance"))
  await form.submit({ jobType: "Freelance" })
  assert.equal(form.requests[0].jobType, "Freelance")
})

test("successful publishing resets remote work and restores form defaults", async () => {
  const form = setup(true)
  await form.submit({
    jobType: "Part-time",
    category: "Other",
    salaryFrequency: "monthly",
  })
  assert.deepEqual(form.remoteChanges, [false])
  assert.deepEqual(form.formResets, [1])
  const items = nodes(form.tree)
  assert.equal(
    items.find((node) => node.props?.name === "category").props.defaultValue,
    "Engineering & Tech"
  )
  assert.equal(
    items.find((node) => node.props?.name === "salaryFrequency").props.value,
    "hourly"
  )
  assert.deepEqual(form.salaryChanges, ["hourly"])
  assert.equal(
    items.find(
      (node) => node.props?.name === "jobType" && node.props.defaultChecked
    ).props.value,
    "Full-time"
  )
})

test("salary labels match the selected frequency", () => {
  for (const [frequency, unit] of [
    ["hourly", "hr"],
    ["monthly", "month"],
    ["yearly", "year"],
  ]) {
    const items = nodes(setup(false, undefined, frequency).tree)
    for (const id of ["minSalary", "maxSalary"]) {
      const label = items.find(
        (node) => node.type === "Label" && node.props.htmlFor === id
      )
      assert.ok(label.props.children.includes(unit))
    }
  }
})

test("invalid salary ranges are rejected without sending a request", async () => {
  for (const values of [
    { minSalary: "50", maxSalary: "40" },
    { minSalary: "-1" },
    { maxSalary: "not a number" },
  ]) {
    const form = setup()
    await form.submit(values)
    assert.equal(form.errors.at(-1), true)
    assert.match(form.messages.at(-1), /salary range/)
    assert.equal(form.requests.length, 0)
  }
})

test("required text cannot contain only whitespace", async () => {
  const form = setup()
  await form.submit({ title: "   " })
  assert.equal(form.errors.at(-1), true)
  assert.equal(form.requests.length, 0)
})

test("location is optional only when remote work is enabled", async () => {
  for (const isRemote of [false, true]) {
    const form = setup(isRemote)
    const location = nodes(form.tree).find(
      (node) => node.props?.name === "location"
    )
    assert.equal(location.props.required, !isRemote)
    await form.submit({ location: "" })
    assert.equal(form.errors.at(-1), !isRemote)
  }
})

test("unconfirmed inserts do not show success", async () => {
  for (const result of [{ acknowledged: false }, { acknowledged: true }]) {
    const form = setup(false, async () => result)
    await form.submit()
    assert.equal(form.errors.at(-1), true)
    assert.match(form.messages.at(-1), /not saved/)
    assert.equal(form.formResets.length, 0)
    assert.deepEqual(form.busy, [true, false])
  }
})

test("request failures show an error and allow a retry", async () => {
  const form = setup(false, async () => {
    throw new Error("Service unavailable")
  })
  await form.submit()
  assert.equal(form.errors.at(-1), true)
  assert.match(form.messages.at(-1), /Service unavailable/)
  assert.equal(form.formResets.length, 0)
  assert.equal(form.remoteChanges.length, 0)
  assert.deepEqual(form.busy, [true, false])
  await form.submit()
  assert.equal(form.requests.length, 2)
})

test("duplicate submits do not send concurrent requests", async () => {
  let resolve
  const form = setup(
    false,
    () =>
      new Promise((done) => {
        resolve = done
      })
  )
  const pending = form.submit()
  await form.submit()
  assert.equal(form.requests.length, 1)
  resolve({ acknowledged: true, insertedId: "job-123" })
  await pending
  assert.deepEqual(form.busy, [true, false])
})
