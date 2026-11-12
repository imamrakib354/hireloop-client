import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import { createRequire } from "node:module"
import ts from "typescript"

const require = createRequire(import.meta.url)

function setup(deleteJob) {
  const state = [true, false, ""]
  let index = 0
  let refreshes = 0
  const notices = []
  const exports = {}
  const mocks = {
    react: {
      useState: () => {
        const current = index++
        return [
          state[current],
          (value) => {
            state[current] = value
          },
        ]
      },
    },
    "next/navigation": { useRouter: () => ({ refresh: () => refreshes++ }) },
    "@/lib/actions/jobs": { deleteJob },
    "@/components/ui/toast": {
      toast: { add: (notice) => notices.push(notice) },
    },
    "@/components/ui/button": { Button: "Button" },
    "@/components/ui/alert-dialog": Object.fromEntries(
      [
        "AlertDialog",
        "AlertDialogAction",
        "AlertDialogCancel",
        "AlertDialogContent",
        "AlertDialogDescription",
        "AlertDialogFooter",
        "AlertDialogHeader",
        "AlertDialogMedia",
        "AlertDialogTitle",
        "AlertDialogTrigger",
      ].map((name) => [name, name])
    ),
  }
  vm.runInNewContext(
    ts.transpileModule(
      fs.readFileSync("app/components/DeleteJobDialog.tsx", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }
    ).outputText,
    { exports, Error, require: (name) => mocks[name] ?? require(name) }
  )
  function render() {
    index = 0
    return exports.DeleteJobDialog({
      job: { _id: "job-123", title: "Frontend Developer" },
    })
  }
  return { render, state, notices, refreshes: () => refreshes }
}

function nodes(element) {
  if (!element || typeof element !== "object") return []
  if (Array.isArray(element)) return element.flatMap(nodes)
  return [element, ...nodes(element.props?.children)]
}

test("confirming deletion closes the dialog, shows a toast and refreshes jobs", async () => {
  const dialog = setup(async (id) => {
    assert.equal(id, "job-123")
    return { deletedCount: 1 }
  })
  await nodes(dialog.render())
    .find((node) => node.type === "AlertDialogAction")
    .props.onClick()
  assert.equal(dialog.state[0], false)
  assert.equal(dialog.state[1], false)
  assert.equal(dialog.notices[0].title, "Job deleted")
  assert.equal(dialog.refreshes(), 1)
})

test("failed deletion keeps the dialog open and displays an error", async () => {
  for (const deleteJob of [
    async () => ({ deletedCount: 0 }),
    async () => {
      throw new Error("Offline")
    },
  ]) {
    const dialog = setup(deleteJob)
    await nodes(dialog.render())
      .find((node) => node.type === "AlertDialogAction")
      .props.onClick()
    assert.equal(dialog.state[0], true)
    assert.equal(dialog.state[1], false)
    assert.ok(
      nodes(dialog.render()).some((node) => node.props.role === "alert")
    )
    assert.equal(dialog.refreshes(), 0)
  }
})

test("pending deletion disables actions and prevents closing or resubmitting", async () => {
  let finish
  let requests = 0
  const dialog = setup(() => {
    requests++
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  const pending = nodes(dialog.render())
    .find((node) => node.type === "AlertDialogAction")
    .props.onClick()
  const items = nodes(dialog.render())
  for (const type of ["AlertDialogAction", "AlertDialogCancel"]) {
    assert.equal(items.find((node) => node.type === type).props.disabled, true)
  }
  items.find((node) => node.type === "AlertDialog").props.onOpenChange(false)
  assert.equal(dialog.state[0], true)
  await items.find((node) => node.type === "AlertDialogAction").props.onClick()
  assert.equal(requests, 1)
  finish({ deletedCount: 1 })
  await pending
})
