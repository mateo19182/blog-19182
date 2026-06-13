// Regenerates content/link-archive.md from Linkwarden.
//
// Faithful port of the old server-side scripts/linkwarden-to-md.py, adapted to
// run on GitHub Actions: pulls the full export from Linkwarden's public
// Cloudflare Tunnel endpoint, keeps a curated set of collections, and renders
// the bullet list sorted newest-first.
//
// Behaviour notes:
//   - Preserves whatever header (frontmatter + intro prose) already exists in
//     the file — only the bullet list below it is regenerated.
//   - The `date:` frontmatter is bumped to today ONLY when the link list
//     actually changes, so unchanged runs produce no diff (no commit churn).
//
// Env:
//   LINKWARDEN_TOKEN  (required)  Linkwarden access token (Bearer).
//   LINKWARDEN_API    (optional)  API base URL. Defaults to the public tunnel.

import { readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const OUT = path.join(ROOT, "content", "link-archive.md")

const API_BASE = (process.env.LINKWARDEN_API || "https://links.m19182.dev/api/v1").replace(/\/+$/, "")
const TOKEN = process.env.LINKWARDEN_TOKEN

// Collections to include (matches the original Python script verbatim).
const COLLECTION_NAMES = new Set([
  "Academic Papers and Resources", "Reads", "Ideas", "Tech",
  "Museums - Indexers", "Weird", "Publications", "Tools and Interactive Websites",
  "Art", "Arts", "Wikis", "Collectives and Magazines", "Blogs",
])

// Default header used only if the file doesn't already exist.
const DEFAULT_HEADER = (today) => `---
title: Link Archive
date: ${today}
tags:
  - personal
---

Collection of places on the internet I enjoyed.
 Categories are rough, links are updated once a week from my collection.
 If a link is broken and you're interested in it, contact me for an archive.

`

if (!TOKEN) {
  console.error("LINKWARDEN_TOKEN is not set.")
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)

console.log(`Fetching migration export from ${API_BASE} ...`)
const res = await fetch(`${API_BASE}/migration`, {
  headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
})
if (!res.ok) {
  console.error(`Linkwarden API error: HTTP ${res.status} ${res.statusText}`)
  console.error((await res.text()).slice(0, 500))
  process.exit(1)
}
const data = await res.json()

// Flatten links from the curated collections, in API order.
const links = []
for (const collection of data.collections || []) {
  if (!COLLECTION_NAMES.has(collection.name)) continue
  for (const link of collection.links || []) {
    links.push({
      name: (link.name || "").replaceAll("#", "-"),
      url: link.url,
      date: (link.createdAt || "").split("T")[0],
      collection: collection.name,
    })
  }
}

// Sort newest-first; stable for equal dates (preserves API order, like
// Python's sorted(reverse=True)).
links.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

const bullets = links
  .map((l) => `- [${l.name}](${l.url}) \`${l.collection}\` *${l.date}*`)
  .join("\n") + "\n"

console.log(`Rendered ${links.length} links from ${[...COLLECTION_NAMES].length} candidate collections.`)

// Preserve the existing header; only replace the bullet list below it.
let header = DEFAULT_HEADER(today)
let oldBullets = ""
if (existsSync(OUT)) {
  const current = await readFile(OUT, "utf8")
  const markerIdx = current.search(/^- \[/m)
  if (markerIdx !== -1) {
    header = current.slice(0, markerIdx)
    oldBullets = current.slice(markerIdx)
  } else {
    header = current.endsWith("\n") ? current : current + "\n"
  }
}

if (oldBullets.trimEnd() === bullets.trimEnd()) {
  console.log("No change to link list — leaving file untouched.")
  process.exit(0)
}

// Links changed: bump the frontmatter date to today, then write.
header = header.replace(/^date:.*$/m, `date: ${today}`)
await writeFile(OUT, header + bullets, "utf8")
console.log(`Updated ${path.relative(ROOT, OUT)} (date set to ${today}).`)
