// Builds the web editor into public/edit/ (behind Cloudflare Access): the
// bundled app plus a snapshot of what its preview needs to render like the site.
import { readFile, writeFile, readdir, mkdir, copyFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
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
  for (const f of ["index.html", "editor.css"]) await copyFile(path.join(root, "editor", f), path.join(dest, f))

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
