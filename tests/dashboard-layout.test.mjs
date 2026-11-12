import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const loadModule = createRequire(import.meta.url)

test("dashboard uses page scrolling and keeps the sidebar toggle sticky", async () => {
  const exports = {}
  const mocks = {
    "next/navigation": {
      redirect: () => {
        throw new Error("Unexpected redirect")
      },
    },
    "@/components/ui/sidebar": {
      SidebarProvider: "SidebarProvider",
      SidebarTrigger: "SidebarTrigger",
    },
    "../components/DashboardSidebar": { DashboardSidebar: "DashboardSidebar" },
    "@/lib/getUserSession": {
      getCurrentUser: async () => ({ name: "Test", role: "recruiter" }),
    },
    "@/lib/dashboard": { isDashboardRole: () => true },
  }
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync("app/dashboard/layout.tsx", "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    { exports, require: (name) => mocks[name] ?? loadModule(name) }
  )

  const tree = await exports.default({ children: "Job form" })
  const content = tree.props.children[1]
  const [header, main] = content.props.children
  for (const element of [tree, content, main]) {
    const classes = element.props.className.split(" ")
    assert.ok(!classes.includes("h-dvh"))
    assert.ok(!classes.includes("overflow-auto"))
    assert.ok(!classes.includes("overflow-hidden"))
  }
  assert.equal(main.type, "main")
  assert.equal(main.props.children, "Job form")
  assert.ok(header.props.className.includes("sticky top-0"))
  assert.equal(header.props.children[0].type, "SidebarTrigger")
})
