#!/usr/bin/env node
// Refresh the favicon cache in assets/favicons/ for the external links used in
// prose. Each host's icon is fetched once (the home page's <link rel=icon>,
// then /favicon.ico, then DuckDuckGo's and Google's icon services), scaled to a
// 32px PNG (palette-reduced with pngquant when installed) and stored under a
// content hash; manifest.json maps host -> file, or null when
// nothing usable was found (the link keeps the ↗ marker).
//
//   npm run favicons                 fetch hosts not in the manifest yet
//   npm run favicons -- --retry      also retry hosts recorded as misses
//   npm run favicons -- --refresh    refetch everything
import { readFile, writeFile, readdir, rm, mkdtemp } from "node:fs/promises"
import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"
import { FAVICON_DIR } from "../lib/favicons.mjs"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const DIR = path.join(ROOT, FAVICON_DIR)
const MANIFEST = path.join(DIR, "manifest.json")
const SIZE = 32
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
const args = process.argv.slice(2)

const tmp = await mkdtemp(path.join(tmpdir(), "favicons-"))
const hostsFile = path.join(tmp, "hosts.json")
const built = spawnSync(process.execPath, ["build.mjs"], { cwd: ROOT, stdio: "inherit", env: { ...process.env, FAVICON_HOSTS_OUT: hostsFile } })
if (built.status !== 0) process.exit(built.status ?? 1)
const hosts = JSON.parse(await readFile(hostsFile, "utf8"))

const manifest = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, "utf8")) : {}
const todo = hosts.filter((h) => args.includes("--refresh") || !(h in manifest) || (args.includes("--retry") && manifest[h] === null))
console.log(`${hosts.length} hosts in use, fetching ${todo.length}`)

async function get(url, accept) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept }, redirect: "follow", signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > 2_000_000) throw new Error("too large")
  return { buf, url: res.url, type: res.headers.get("content-type") || "" }
}

// <link rel="icon"> candidates from the home page, best first: the smallest
// declared size of at least 32px, then SVG, then undeclared sizes, then the rest.
async function pageIcons(host) {
  const { buf, url } = await get(`https://${host}/`, "text/html")
  const html = buf.toString("utf8").slice(0, 300_000)
  const icons = []
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const attr = (name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(1).find((v) => v != null)
    if (!/(^|\s)(icon|apple-touch-icon)(\s|$)/i.test(attr("rel") || "") || !attr("href")) continue
    let href
    try { href = new URL(attr("href").replace(/&amp;|&#0?38;/g, "&"), url).href } catch { continue }
    const size = Math.max(0, ...(attr("sizes") || "").split(/\s+/).map((s) => parseInt(s, 10) || 0))
    const svg = /\.svg(\?|$)/i.test(href) || /svg/i.test(attr("type") || "")
    icons.push({ href, rank: size >= SIZE ? size : svg ? 1000 : size === 0 ? 2000 : 3000 - size })
  }
  return icons.sort((a, b) => a.rank - b.rank).map((i) => i.href)
}

function isSvg(buf, type) {
  return /svg/.test(type) || /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg\b/i.test(buf.subarray(0, 2000).toString("utf8"))
}

function magick(cmd, argv, input) {
  const r = spawnSync(cmd, argv, { input, maxBuffer: 1 << 26 })
  if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr.toString().trim().split("\n")[0]}`)
  return r.stdout
}

// Any icon format -> SIZE x SIZE PNG, keeping the aspect ratio. For multi-image
// files (ICO) use the largest frame.
async function toPng(buf, type) {
  if (isSvg(buf, type)) buf = Buffer.from(new Resvg(buf, { fitTo: { mode: "width", value: SIZE * 2 } }).render().asPng())
  const ico = buf.readUInt32BE(0) === 0x00000100
  const src = (ico ? "ico:" : "") + path.join(tmp, "src")
  await writeFile(src.replace(/^ico:/, ""), buf)
  const frames = magick("identify", ["-format", "%w %h\n", src]).toString().trim().split("\n").map((l) => l.split(" ").map(Number))
  const best = frames.reduce((b, f, i) => (f[0] * f[1] > frames[b][0] * frames[b][1] ? i : b), 0)
  const [w, h] = frames[best]
  if (!(w >= 8 && h >= 8)) throw new Error("too small")
  const png = magick("convert", [`${src}[${best}]`, "-background", "none", "-resize", `${SIZE}x${SIZE}`, "-gravity", "center", "-extent", `${SIZE}x${SIZE}`, "-strip", "-define", "png:compression-level=9", "png32:-"])
  // A fully transparent or flat image is a placeholder, not an icon.
  const [alpha, spread] = magick("convert", ["png:-", "-format", "%[fx:maxima.a] %[fx:max(standard_deviation,standard_deviation.a)]", "info:"], png).toString().split(" ").map(Number)
  if (!(alpha > 0) || !(spread > 0.02)) throw new Error("blank")
  const small = spawnSync("pngquant", ["--quality=70-95", "--strip", "-"], { input: png })
  return small.status === 0 && small.stdout.length < png.length ? small.stdout : png
}

async function fetchIcon(host) {
  const candidates = []
  try { candidates.push(...(await pageIcons(host))) } catch {}
  candidates.push(`https://${host}/favicon.ico`, `https://icons.duckduckgo.com/ip3/${host}.ico`, `https://www.google.com/s2/favicons?domain=${host}&sz=64`)
  for (const url of [...new Set(candidates)]) {
    try {
      const { buf, type } = await get(url, "image/*")
      if (/text\/html/.test(type)) continue
      return { png: await toPng(buf, type), url }
    } catch {}
  }
  return null
}

let done = 0
async function worker(queue) {
  for (let host; (host = queue.shift()); ) {
    const icon = await fetchIcon(host)
    if (icon) {
      const file = createHash("sha1").update(icon.png).digest("hex").slice(0, 12) + ".png"
      await writeFile(path.join(DIR, file), icon.png)
      manifest[host] = file
    } else manifest[host] = null
    console.log(`[${++done}/${todo.length}] ${host}: ${icon ? icon.url : "none"}`)
  }
}
const queue = [...todo]
await Promise.all(Array.from({ length: 8 }, () => worker(queue)))

// Keep the manifest sorted and drop icons nothing points to any more.
const sorted = Object.fromEntries(Object.entries(manifest).filter(([h]) => hosts.includes(h)).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(MANIFEST, JSON.stringify(sorted, null, 1) + "\n")
const used = new Set(Object.values(sorted))
for (const f of await readdir(DIR)) if (f.endsWith(".png") && !used.has(f)) await rm(path.join(DIR, f))
await rm(tmp, { recursive: true, force: true })
const hits = Object.values(sorted).filter(Boolean).length
console.log(`${hits} hosts with icons (${used.size - (used.has(null) ? 1 : 0)} files), ${Object.keys(sorted).length - hits} without. Rebuild to use them.`)
