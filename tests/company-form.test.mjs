import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)
function load(path, mocks) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2017,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports, Error, require: (name) => mocks[name] ?? require(name) }
  )
  return exports
}
function nodes(element) {
  if (element == null || typeof element !== "object") return [element]
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

function setup(company = null, overrides = {}) {
  const state = []
  const calls = { creates: [], updates: [], toasts: [], refreshes: 0 }
  let index = 0
  const mocks = {
    react: {
      useState: (initial) => {
        const current = index++
        if (!(current in state)) state[current] = initial
        return [
          state[current],
          (value) => {
            state[current] =
              typeof value === "function" ? value(state[current]) : value
          },
        ]
      },
    },
    "next/navigation": {
      useRouter: () => ({ refresh: () => calls.refreshes++ }),
    },
    "@/components/ui/toast": {
      toast: { add: (value) => calls.toasts.push(value) },
    },
    "@/app/components/CompanyImageUpload": {
      CompanyImageUpload: "CompanyImageUpload",
    },
    "@/lib/actions/companies": {
      createCompany: async (data) => {
        calls.creates.push(data)
        return overrides.create
          ? overrides.create(data)
          : { acknowledged: true, insertedId: "company-1" }
      },
      updateCompany: async (id, data) => {
        calls.updates.push({ id, data })
        return overrides.update
          ? overrides.update(data)
          : { acknowledged: true, matchedCount: 1, modifiedCount: 0 }
      },
    },
  }
  for (const [file, names] of Object.entries({
    button: ["Button"],
    badge: ["Badge"],
    card: ["Card", "CardContent", "CardDescription", "CardHeader", "CardTitle"],
    checkbox: ["Checkbox"],
    input: ["Input"],
    label: ["Label"],
    "native-select": ["NativeSelect", "NativeSelectOption"],
    tabs: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
    textarea: ["Textarea"],
  })) {
    mocks[`@/components/ui/${file}`] = Object.fromEntries(
      names.map((name) => [name, name])
    )
  }
  const component = load("app/components/CompanyForm.tsx", mocks)
  function render() {
    index = 0
    return nodes(component.CompanyForm({ company, recruiterId: "user-1" }))
  }
  function click(text) {
    render()
      .find((node) => node?.type === "Button" && nodes(node).includes(text))
      .props.onClick()
  }
  function change(name, value) {
    render()
      .find((node) => node?.props?.name === name)
      .props.onChange({ target: { value } })
  }
  function fill() {
    for (const [name, value] of Object.entries({
      name: " HireLoop ",
      industry: "Software & IT Services",
      size: "11 – 50 Employees",
      location: "Dhaka",
      email: "careers@example.com",
      overview: "We build useful software.",
    }))
      change(name, value)
  }
  async function submit() {
    await render()
      .find((node) => node?.type === "form")
      .props.onSubmit({ preventDefault() {} })
  }
  return { render, calls, click, change, fill, submit }
}

test("company form starts empty and read-only, then creates an owner-linked profile", async () => {
  const form = setup()
  assert.ok(
    form
      .render()
      .some((node) => node?.type === "fieldset" && node.props.disabled)
  )
  await form.submit()
  assert.equal(form.calls.creates.length, 0)
  form.click("Add Company Details")
  form.fill()
  const image = form
    .render()
    .find((node) => node?.type === "CompanyImageUpload")
  image.props.onChange("https://i.ibb.co/logo.png")
  await form.submit()
  const saved = form.calls.creates[0]
  assert.equal(saved.recruiterId, "user-1")
  assert.equal(saved.name, "HireLoop")
  assert.equal(saved.logoUrl, "https://i.ibb.co/logo.png")
  assert.ok(saved.createdAt)
  assert.equal(saved._id, undefined)
  assert.equal(form.calls.refreshes, 1)
  assert.equal(form.calls.toasts[0].title, "Company saved")
  assert.ok(form.render().includes("Edit Company"))
  form.click("Edit Company")
  await form.submit()
  assert.equal(
    form.calls.creates.length,
    1,
    "later saves update instead of inserting duplicates"
  )
  assert.equal(form.calls.updates[0].id, "company-1")
})

const company = {
  _id: "company-1",
  recruiterId: "user-1",
  name: "Existing Company",
  industry: "Software & IT Services",
  size: "11 – 50 Employees",
  location: "Dhaka",
  email: "careers@example.com",
  overview: "Existing overview",
  verificationStatus: "verified",
  createdAt: "2026-01-01",
}

test("cancel discards edits and updating preserves verification and creation metadata", async () => {
  const form = setup(company)
  form.click("Edit Company")
  form.change("name", "Unsaved")
  form.click("Cancel")
  assert.equal(
    form.render().find((node) => node?.props?.name === "name").props.value,
    "Existing Company"
  )
  form.click("Edit Company")
  await form.submit()
  assert.equal(form.calls.updates.length, 1)
  assert.equal(form.calls.updates[0].data._id, undefined)
  assert.equal(form.calls.updates[0].data.verificationStatus, undefined)
  assert.equal(form.calls.updates[0].data.createdAt, undefined)
  assert.ok(form.render().includes("Verified Employer"))
})

test("benefits are separate by job type and custom benefits are saved", async () => {
  const form = setup(company)
  form.click("Edit Company")
  form
    .render()
    .find((node) => node?.props?.id === "benefit-Full-time-0")
    .props.onCheckedChange(true)
  form
    .render()
    .find((node) => node?.props?.id === "custom-benefit")
    .props.onChange({ target: { value: "Remote stipend" } })
  form
    .render()
    .find((node) => node?.props?.["aria-label"] === "Add custom benefit")
    .props.onClick()
  await form.submit()
  const benefits = form.calls.updates[0].data.benefits
  assert.equal(
    benefits["Full-time"].join(","),
    "Health Insurance,Remote stipend"
  )
  assert.equal(benefits["Part-time"].length, 0)
})

test("saving is blocked during uploads and failures preserve edits", async () => {
  const form = setup(company, {
    update: async () => {
      throw new Error("Offline")
    },
  })
  form.click("Edit Company")
  form
    .render()
    .find((node) => node?.type === "CompanyImageUpload")
    .props.onUploadingChange(true)
  await form.submit()
  assert.equal(form.calls.updates.length, 0)
  form
    .render()
    .find((node) => node?.type === "CompanyImageUpload")
    .props.onUploadingChange(false)
  form.change("name", "Updated company")
  await form.submit()
  assert.ok(form.render().includes("Offline"))
  assert.equal(
    form.render().find((node) => node?.props?.name === "name").props.value,
    "Updated company"
  )
  assert.ok(form.render().includes("Save Changes"))
})

test("unmatched updates and blank required fields do not show success", async () => {
  const form = setup(company, {
    update: async () => ({ acknowledged: true, matchedCount: 0 }),
  })
  form.click("Edit Company")
  form.change("name", "   ")
  await form.submit()
  assert.equal(form.calls.updates.length, 0)
  form.change("name", "Company")
  await form.submit()
  assert.equal(form.calls.toasts.length, 0)
  assert.ok(form.render().some((node) => node?.props?.role === "alert"))
})

test("company page selects the current recruiter's company and blocks forms on fetch errors", async () => {
  for (const fail of [false, true]) {
    const page = load("app/dashboard/recruiter/my-company/page.tsx", {
      "@/lib/require-dashboard-role": {
        requireDashboardRole: async (role) => {
          assert.equal(role, "recruiter")
          return { id: "user-1" }
        },
      },
      "@/lib/api/companies": {
        getCompanies: async () => {
          if (fail) throw new Error("Offline")
          return [{ ...company, recruiterId: "other-user" }, company]
        },
      },
      "@/app/components/CompanyForm": { CompanyForm: "CompanyForm" },
    })
    const items = nodes(await page.default())
    const form = items.find((node) => node?.type === "CompanyForm")
    if (fail) assert.equal(form, undefined)
    else {
      assert.equal(form.props.company, company)
      assert.equal(form.props.recruiterId, "user-1")
    }
  }
})
