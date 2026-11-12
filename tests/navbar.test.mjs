import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"
import * as React from "react"

const loadModule = createRequire(import.meta.url)
const dashboard = {}
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("lib/dashboard.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: dashboard }
)

// Exercise the actual navbar component and handler without a browser or database.
function setup(signOut = async () => ({ error: null })) {
  const calls = { toasts: [], routes: [], refreshes: 0, busy: [] }
  const exports = {}
  const mocks = {
    react: {
      ...React,
      useState: () => [false, (value) => calls.busy.push(value)],
      useRef: (current) => ({ current }),
    },
    "next/navigation": {
      usePathname: () => "/",
      useRouter: () => ({
        replace: (url) => calls.routes.push(url),
        refresh: () => calls.refreshes++,
      }),
    },
    "next/link": { default: "a" },
    "next/image": { default: "img" },
    "lucide-react": { Loader2: "spinner", Menu: "menu-icon" },
    "@/components/ui/dropdown-menu": Object.fromEntries(
      [
        "DropdownMenu",
        "DropdownMenuTrigger",
        "DropdownMenuContent",
        "DropdownMenuItem",
      ].map((key) => [key, key])
    ),
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
    "@/components/hover-lift": { HoverLift: "hover-lift" },
    "@/lib/auth-client": { authClient: { signOut } },
    "@/lib/dashboard": dashboard,
    "@/components/ui/toast": {
      toast: { add: (value) => calls.toasts.push(value) },
    },
  }
  const source = ts.transpileModule(
    fs.readFileSync("components/navbar.tsx", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }
  ).outputText
  vm.runInNewContext(source, {
    exports,
    require: (name) => mocks[name] ?? loadModule(name),
  })
  return { render: (user) => exports.Navbar({ user }), calls }
}

function nodes(element) {
  if (element == null || typeof element === "boolean") return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  if (typeof element !== "object") return [element]
  return [element, ...nodes(element.props?.children)]
}

function signOutButton(tree) {
  return nodes(tree).find(
    (node) => node?.type === "button" && node.props.onClick
  )
}

test("logged out: shows Sign In and Get Started on desktop and mobile", () => {
  const { render } = setup()
  const items = nodes(render(null))
  assert.equal(
    items.filter((node) => node?.props?.href === "/sign-in").length,
    2
  )
  assert.equal(items.filter((node) => node === "Get Started").length, 2)
  assert.equal(signOutButton(render(null)), undefined)
  assert.equal(items.filter((node) => node === "Dashboard").length, 0)
})

for (const role of ["seeker", "recruiter", "admin"]) {
  test(`${role}: desktop and mobile dashboard links use the session role`, () => {
    const { render } = setup()
    const items = nodes(render({ name: "Test", role }))
    assert.equal(
      items.filter((node) => node?.props?.href === `/dashboard/${role}`).length,
      2
    )
  })
}

test("unknown or missing roles never fall back to a seeker dashboard", () => {
  const { render } = setup()
  for (const role of [undefined, null, "owner", ""]) {
    assert.equal(
      nodes(render({ name: "Test", role })).filter(
        (node) => node === "Dashboard"
      ).length,
      0
    )
  }
})

test("desktop and mobile use the same Company URL", () => {
  const { render } = setup()
  for (const user of [null, { name: "Test", role: "recruiter" }]) {
    const items = nodes(render(user))
    assert.equal(
      items.filter((node) => node?.props?.href === "/company").length,
      2
    )
    assert.equal(
      items.filter((node) => node?.props?.href === "/companies").length,
      0
    )
  }
})

test("mobile account row wraps and keeps actions left-aligned", () => {
  const { render } = setup()
  const items = nodes(render({ name: "A long user name", role: "seeker" }))
  const mobileRow = items.find(
    (node) =>
      node?.props?.className?.includes("border-t") &&
      node?.props?.className?.includes("xl:hidden")
  )
  assert.ok(mobileRow.props.className.includes("items-start"))
  const actions = nodes(mobileRow).find((node) =>
    node?.props?.className?.includes("justify-start")
  )
  assert.ok(actions.props.className.includes("flex-wrap"))
  assert.ok(!mobileRow.props.className.includes("justify-between"))
})

test("logged in: welcomes user, shows Sign Out, and retains Get Started", () => {
  const { render } = setup()
  const tree = render({ name: "Test User" })
  const items = nodes(tree)
  assert.equal(items.filter((node) => node === "Test User").length, 2)
  assert.equal(items.filter((node) => node === "Sign Out").length, 2)
  assert.equal(items.filter((node) => node === "Get Started").length, 2)
  assert.equal(
    items.filter((node) => node?.props?.href === "/sign-in").length,
    0
  )
})

test("successful sign-out notifies, redirects home, and refreshes", async () => {
  const { render, calls } = setup()
  await signOutButton(render({ name: "Test" })).props.onClick()
  assert.deepEqual(calls.routes, ["/"])
  assert.equal(calls.refreshes, 1)
  assert.equal(calls.toasts[0].type, "success")
  assert.deepEqual(calls.busy, [true, false])
})

test("API sign-out errors notify without redirecting", async () => {
  const { render, calls } = setup(async () => ({
    error: { message: "Session service unavailable" },
  }))
  await signOutButton(render({ name: "Test" })).props.onClick()
  assert.equal(calls.toasts[0].type, "error")
  assert.equal(calls.toasts[0].description, "Session service unavailable")
  assert.deepEqual(calls.routes, [])
  assert.equal(calls.refreshes, 0)
  assert.deepEqual(calls.busy, [true, false])
})

test("network failures notify and restore the button", async () => {
  const { render, calls } = setup(async () => {
    throw new Error("Offline")
  })
  await signOutButton(render({ name: "Test" })).props.onClick()
  assert.equal(calls.toasts[0].type, "error")
  assert.deepEqual(calls.routes, [])
  assert.deepEqual(calls.busy, [true, false])
})

test("duplicate clicks cannot send concurrent sign-out requests", async () => {
  let count = 0
  let resolve
  const { render } = setup(() => {
    count++
    return new Promise((done) => {
      resolve = done
    })
  })
  const handler = signOutButton(render({ name: "Test" })).props.onClick
  const pending = handler()
  await handler()
  assert.equal(count, 1)
  resolve({ error: null })
  await pending
})
