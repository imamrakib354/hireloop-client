import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import vm from "node:vm"
import ts from "typescript"

function load(path, context = {}, mocks = {}) {
  const exports = {}
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(path, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      Error,
      File,
      FormData,
      Response,
      ...context,
      require: (name) => mocks[name],
    }
  )
  return exports
}
const validFile = () =>
  new File(["image bytes"], "logo.png", { type: "image/png" })

test("uploadImage rejects unsupported, empty and oversized files before requesting", async () => {
  let calls = 0
  const helper = load("lib/uploadImage.ts", {
    fetch: async () => {
      calls++
    },
  })
  for (const file of [
    new File(["text"], "logo.txt", { type: "text/plain" }),
    new File([], "empty.png", { type: "image/png" }),
    { type: "image/png", size: 5 * 1024 * 1024 + 1 },
  ]) {
    await assert.rejects(helper.uploadImage(file), /Choose a JPG/)
  }
  assert.equal(calls, 0)
})

test("uploadImage sends multipart data to the local route and returns the hosted URL", async () => {
  const helper = load("lib/uploadImage.ts", {
    fetch: async (url, options) => {
      assert.equal(url, "/api/upload-image")
      assert.equal(options.method, "POST")
      assert.equal(options.body.get("image").name, "logo.png")
      return {
        ok: true,
        json: async () => ({ url: "https://i.ibb.co/logo.png" }),
      }
    },
  })
  assert.equal(
    await helper.uploadImage(validFile()),
    "https://i.ibb.co/logo.png"
  )
  const failed = load("lib/uploadImage.ts", {
    fetch: async () => ({
      ok: false,
      json: async () => ({ error: "Upload unavailable" }),
    }),
  })
  await assert.rejects(failed.uploadImage(validFile()), /Upload unavailable/)
})

function route({
  user = { id: "user-1" },
  key = "test-server-key",
  fetch,
} = {}) {
  const validation = load("lib/uploadImage.ts")
  return load(
    "app/api/upload-image/route.ts",
    { process: { env: { IMGBB_API_KEY: key } }, fetch },
    {
      "@/lib/getUserSession": { getCurrentUser: async () => user },
      "@/lib/uploadImage": validation,
    }
  )
}
function request(file = validFile()) {
  const body = new FormData()
  if (file) body.append("image", file)
  return new Request("http://localhost/api/upload-image", {
    method: "POST",
    body,
  })
}

test("upload route requires a session, configuration and a valid file", async () => {
  assert.equal((await route({ user: null }).POST(request())).status, 401)
  assert.equal((await route({ key: "" }).POST(request())).status, 503)
  assert.equal((await route().POST(request(null))).status, 400)
  assert.equal(
    (
      await route().POST(
        request(new File(["text"], "bad.txt", { type: "text/plain" }))
      )
    ).status,
    400
  )
})

test("upload route keeps the key server-side and returns only the image URL", async () => {
  const api = route({
    fetch: async (url, options) => {
      assert.equal(url, "https://api.imgbb.com/1/upload")
      assert.equal(options.body.get("key"), "test-server-key")
      assert.equal(options.body.get("image").name, "logo.png")
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            url: "https://i.ibb.co/logo.png",
            delete_url: "private-delete-url",
          },
        }),
      }
    },
  })
  const response = await api.POST(request())
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { url: "https://i.ibb.co/logo.png" })
})

test("upload route handles upstream errors without exposing provider details", async () => {
  const api = route({
    fetch: async () => ({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: "Provider details" },
      }),
    }),
  })
  const response = await api.POST(request())
  assert.equal(response.status, 502)
  assert.equal(
    (await response.json()).error,
    "Image upload failed. Please try again."
  )
})
