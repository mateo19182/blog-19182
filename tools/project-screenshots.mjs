#!/usr/bin/env node
// Capture thumbnails for highlighted projects into assets/projects/. A project
// with `image: name.webp` and a live (non-GitHub) `url` gets a 1280×800 headless
// Chrome screenshot of that url, taken a few seconds after load so maps and
// tiles can draw, and scaled to 640px wide. Images for repo-only projects are
// added by hand under the same name; the build never fetches.
//
//   npm run screenshots                capture images that don't exist yet
//   npm run screenshots -- --refresh   recapture every live-site image
import { readFile, writeFile, mkdtemp, mkdir, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import { spawn, spawnSync } from "node:child_process"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DIR = path.join(ROOT, "assets", "projects")
const CHROME = process.env.CHROME || "google-chrome"
const PORT = 9333
const SETTLE_MS = 8000
const refresh = process.argv.includes("--refresh")
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const projects = matter.engines.yaml.parse(await readFile(path.join(ROOT, "content", "projects.yml"), "utf8"))
const todo = projects.filter((p) => p.image && /^https?:/.test(p.url || "") && !/github\.com/.test(p.url) && (refresh || !existsSync(path.join(DIR, p.image))))
if (!todo.length) process.exit(0)
await mkdir(DIR, { recursive: true })
const tmp = await mkdtemp(path.join(tmpdir(), "project-shots-"))

// software WebGL so map libraries render without a GPU
const chrome = spawn(CHROME, ["--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars", `--remote-debugging-port=${PORT}`, `--user-data-dir=${tmp}/profile`, "about:blank"], { stdio: "ignore" })

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
      const page = tabs.find((t) => t.type === "page")
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error("chrome did not start")
}

const ws = new WebSocket(await connect())
await new Promise((r) => ws.addEventListener("open", r, { once: true }))
let nextId = 0
const pending = new Map()
ws.addEventListener("message", (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg)
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)))
    ws.send(JSON.stringify({ id, method, params }))
  })

try {
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false })
  for (const p of todo) {
    try {
      await send("Page.navigate", { url: p.url })
      await sleep(SETTLE_MS)
      const { data } = await send("Page.captureScreenshot", { format: "png" })
      const png = path.join(tmp, "shot.png")
      await writeFile(png, Buffer.from(data, "base64"))
      const conv = spawnSync("convert", [png, "-resize", "640x", "-quality", "82", path.join(DIR, p.image)], { stdio: "inherit" })
      console.log(conv.status === 0 ? `✓ ${p.title} → assets/projects/${p.image}` : `✗ ${p.title}: convert failed`)
    } catch (err) {
      console.log(`✗ ${p.title}: ${err.message}`)
    }
  }
} finally {
  ws.close()
  chrome.kill()
  await rm(tmp, { recursive: true, force: true }).catch(() => {})
}
