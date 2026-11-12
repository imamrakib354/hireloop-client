import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"
import * as React from "react"

const loadModule = createRequire(import.meta.url)

function renderSidebar(role, pathname) {
  const exports = {}
  const mocks = {
    react: {
      ...React,
      useState: () => [false, () => {}],
      useRef: (current) => ({ current }),
    },
    "next/link": { default: "a" },
    "next/image": { default: "img" },
    "next/navigation": { usePathname: () => pathname, useRouter: () => ({}) },
    "@/components/ui/sidebar": new Proxy(
      {},
      {
        get: (_, name) =>
          name === "useSidebar"
            ? () => ({ isMobile: false, setOpenMobile() {} })
            : name,
      }
    ),
    "@/lib/auth-client": { authClient: {} },
    "@/components/ui/toast": { toast: {} },
  }
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("app/components/DashboardSidebar.tsx", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }
    ).outputText,
    { exports, require: (name) => mocks[name] ?? loadModule(name) }
  )
  return exports.DashboardSidebar({ user: { name: "Test User", role } })
}

function nodes(element) {
  if (element == null || typeof element !== "object") return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

const destinations = {
  seeker: [
    "",
    "/jobs",
    "/saved-jobs",
    "/applications",
    "/billing",
    "/settings",
  ],
  recruiter: [
    "",
    "/my-company",
    "/jobs",
    "/jobs/new",
    "/applications",
    "/settings",
  ],
  admin: ["", "/users", "/companies", "/jobs", "/payments", "/settings"],
}

for (const [role, suffixes] of Object.entries(destinations)) {
  test(`${role}: menu links match the requested order and have page files`, () => {
    const buttons = nodes(renderSidebar(role, `/dashboard/${role}`)).filter(
      (node) => node.type === "SidebarMenuButton"
    )
    const links = buttons.map((node) => node.props.render.props.href)
    assert.deepEqual(
      links,
      suffixes.map((suffix) => `/dashboard/${role}${suffix}`)
    )
    for (const href of links)
      assert.ok(fs.existsSync(`app${href}/page.tsx`), href)
  })
}

for (const [pathname, expected] of [
  ["/dashboard/recruiter", "/dashboard/recruiter"],
  ["/dashboard/recruiter/jobs", "/dashboard/recruiter/jobs"],
  ["/dashboard/recruiter/jobs/new", "/dashboard/recruiter/jobs/new"],
  ["/dashboard/recruiter/jobs/123", "/dashboard/recruiter/jobs"],
]) {
  test(`${pathname}: only the most specific menu item is active`, () => {
    const active = nodes(renderSidebar("recruiter", pathname)).filter(
      (node) => node.type === "SidebarMenuButton" && node.props.isActive
    )
    assert.equal(active.length, 1)
    assert.equal(active[0].props.render.props.href, expected)
    assert.equal(active[0].props.render.props["aria-current"], "page")
  })
}
