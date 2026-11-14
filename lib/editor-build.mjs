// Builds the web editor into public/edit/ (behind Cloudflare Access): the
// bundled app plus a snapshot of what its preview needs to render like the site.
import { readFile, writeFile, readdir, mkdir, copyFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import * as esbuild from "esbuild"
import { PROJECT_TAGS } from "./templates.mjs"

export async function buildEditor({ root, out, pages, drafts, posts, dataFiles }) {
  const dest = path.join(out, "edit")
  await mkdir(dest, { recursive: true })
  await esbuild.build({
    entryPoints: [path.join(root, "editor", "main.js")],
    bundle: true,
    minify: true,
    format: "esm",
    target: "es2022",
    outfile: path.join(dest, "editor.js"),
    // The preview skips syntax highlighting; Shiki would add megabytes.
    alias: { shiki: path.join(root, "editor", "shiki-stub.js") },
    logLevel: "warning",
  })
  await copyFile(path.join(root, "editor", "editor.css"), path.join(dest, "editor.css"))
  // Hunspell dictionaries for editor/spell.js, fetched when first needed.
  await mkdir(path.join(dest, "dict"), { recursive: true })
  for (const lang of ["en-gb", "es"]) {
    for (const ext of ["aff", "dic"]) await copyFile(path.join(root, "node_modules", `dictionary-${lang}`, `index.${ext}`), path.join(dest, "dict", `${lang}.${ext}`))
  }
  // A content hash in the asset URLs, so a deploy never runs a stale cached editor.
  let html = await readFile(path.join(root, "editor", "index.html"), "utf8")
  for (const f of ["editor.js", "editor.css"]) {
    const hash = createHash("sha256").update(await readFile(path.join(dest, f))).digest("hex").slice(0, 10)
    html = html.replace(`/edit/${f}"`, `/edit/${f}?v=${hash}"`)
  }
  await writeFile(path.join(dest, "index.html"), html)

  const read = async (f) => (existsSync(f) ? JSON.parse(await readFile(f, "utf8")) : {})
  const tags = new Map()
  for (const p of posts) for (const t of p.tags) tags.set(t, (tags.get(t) || 0) + 1)
  const index = {
    pages: [...pages, ...drafts].filter((p) => p.url !== "/updates").map((p) => ({
      name: p.name, section: p.section, url: p.url, title: p.title, lang: p.lang,
      esTitle: p.es?.title || "", enTitle: p.en?.title || "",
      date: p.date, series: p.series, seriesEs: p.seriesEs, seriesOrder: p.seriesOrder,
      draft: p.draft, unlisted: p.unlisted,
    })),
    dataFiles,
    favicons: await read(path.join(root, "assets", "favicons", "manifest.json")),
    soundtracks: await read(path.join(root, "content", "data", "soundtrack", "peaks.json")),
    writingTags: [...tags].sort((a, b) => b[1] - a[1]).map(([t]) => t),
    projectTags: PROJECT_TAGS,
    projectImages: await readdir(path.join(root, "assets", "projects")),
  }
  await writeFile(path.join(dest, "index.json"), JSON.stringify(index))
}
