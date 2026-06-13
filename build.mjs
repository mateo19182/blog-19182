#!/usr/bin/env node
// blog-19182 static site generator.
// Reads content/*.md, renders minimal HTML, emits raw .md copies, OG images,
// RSS, sitemap. No framework — just markdown-it + a few templates.

import { readFile, writeFile, mkdir, readdir, copyFile, rm, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import { makeRenderer, initHighlighter, linkKey } from "./lib/markdown.mjs"
import {
  renderPage, writingsIndexHtml, tagsIndexHtml,
  tagPageHtml, tagSlug, SITE, esc,
} from "./lib/templates.mjs"
import { makeOgImage } from "./lib/og.mjs"
import { buildRss, buildSitemap } from "./lib/feeds.mjs"
import { fileSlug } from "./lib/slug.mjs"

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CONTENT = path.join(ROOT, "content")
const OUT = path.join(ROOT, "public")
const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|pdf|avif)$/i

// ---- date normalization ----------------------------------------------------
function normalizeDate(d) {
  if (!d) return ""
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  let s = String(d).trim()
  // "04 May, 2024" -> ISO
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/)
  if (m) {
    const months = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
    const mo = months[m[2].slice(0, 3).toLowerCase()]
    if (mo) return `${m[3]}-${String(mo).padStart(2, "0")}-${m[1].padStart(2, "0")}`
  }
  // "2024-04-1" / "2024-12-6" -> pad
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`
  return s
}

// ---- helpers ----------------------------------------------------------------
function stripToText(md) {
  return md
    .replace(/^---[\s\S]*?---/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[\[[^\]]*\]\]/g, "")
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, "$2")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function readingTime(text) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

function extractToc(html) {
  const toc = []
  const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g
  let m
  while ((m = re.exec(html))) {
    const text = m[3].replace(/<[^>]+>/g, "").trim()
    if (text) toc.push({ level: Number(m[1]), id: m[2], text })
  }
  return toc
}

// ---- load content -----------------------------------------------------------
async function loadAll() {
  const dataFiles = existsSync(path.join(CONTENT, "data"))
    ? await readdir(path.join(CONTENT, "data"))
    : []

  const pages = []
  // top-level pages
  for (const f of await readdir(CONTENT)) {
    if (!f.endsWith(".md")) continue
    pages.push(await loadFile(path.join(CONTENT, f), f.replace(/\.md$/, ""), null))
  }
  // writings
  const wdir = path.join(CONTENT, "writings")
  for (const f of await readdir(wdir)) {
    if (!f.endsWith(".md")) continue
    pages.push(await loadFile(path.join(wdir, f), f.replace(/\.md$/, ""), "writings"))
  }
  return { pages, dataFiles }
}

async function loadFile(file, name, section) {
  const raw = await readFile(file, "utf8")
  const { data, content } = matter(raw)
  const isHome = name === "index" && !section
  const slug = isHome ? "" : fileSlug(name)
  const url = isHome ? "/" : section ? `/${section}/${slug}` : `/${slug}`
  const text = stripToText(content)
  return {
    name, section, slug, url, isHome,
    title: data.title || name,
    date: normalizeDate(data.date),
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    aliases: Array.isArray(data.aliases) ? data.aliases : data.aliases ? [data.aliases] : [],
    rawContent: content,
    description: text.slice(0, 160).trim(),
    readingTime: readingTime(text),
    isArticle: section === "writings",
  }
}

// ---- resolver for wikilinks -------------------------------------------------
function makeResolver(pages, dataFiles) {
  const dataSet = new Set(dataFiles)
  const map = new Map()
  const put = (key, href) => map.set(linkKey(key), { href, exists: true })
  for (const p of pages) {
    put(p.name, p.url)
    if (p.title) put(p.title, p.url)
  }
  // synthetic pages
  put("writings", "/writings")
  put("tags", "/tags")
  put("home", "/")

  return (target) => {
    if (IMAGE_EXT.test(target)) {
      const base = path.basename(target)
      if (dataSet.has(base)) return { href: `/data/${base}`, exists: true }
      return { href: "", exists: false }
    }
    return map.get(linkKey(target)) || null
  }
}

// ---- write helpers ----------------------------------------------------------
async function emit(urlPath, html) {
  // "/foo" -> public/foo/index.html ; "/" -> public/index.html
  const clean = urlPath === "/" ? "" : urlPath.replace(/^\//, "")
  const dir = path.join(OUT, clean)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, "index.html"), html)
}

async function emitMd(urlPath, title, body) {
  const clean = urlPath === "/" ? "index" : urlPath.replace(/^\//, "")
  const dest = path.join(OUT, `${clean}.md`)
  await mkdir(path.dirname(dest), { recursive: true })
  await writeFile(dest, `# ${title}\n\n${body.trim()}\n`)
}

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true })
  for (const f of await readdir(src)) {
    const s = path.join(src, f)
    const d = path.join(dest, f)
    if ((await stat(s)).isDirectory()) await copyDir(s, d)
    else await copyFile(s, d)
  }
}

// ---- main build -------------------------------------------------------------
async function build() {
  const t0 = Date.now()
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })
  await initHighlighter()

  const { pages, dataFiles } = await loadAll()
  const resolve = makeResolver(pages, dataFiles)
  const md = makeRenderer(resolve)

  const posts = pages
    .filter((p) => p.isArticle)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  // tag map (writings only)
  const tagMap = new Map()
  for (const p of posts) {
    for (const t of p.tags) {
      if (t === "writing") continue
      if (!tagMap.has(t)) tagMap.set(t, [])
      tagMap.get(t).push(p)
    }
  }

  const sitemapUrls = []
  const ogJobs = []

  // render each content page
  for (const p of pages) {
    let bodyHtml = md.render(p.rawContent)
    const toc = p.isArticle ? extractToc(bodyHtml) : []

    const ogPath = p.isHome ? "/static/og/index.png" : `/static/og${p.url}.png`
    const page = {
      ...p,
      html: bodyHtml,
      toc,
      ogImage: ogPath,
      showFilter: p.name === "link-archive",
    }
    await emit(p.url, renderPage(page))
    await emitMd(p.url, p.title, p.rawContent)
    sitemapUrls.push({ url: p.url, date: p.date })
    ogJobs.push({
      path: ogPath,
      title: p.isHome ? "blog-19182" : p.title,
      subtitle: p.isHome ? "Mateo's blog" : p.isArticle && p.date ? p.date : "blog.m19182.dev",
    })
  }

  // writings index
  {
    const html = `<p>Essays and notes</p>` + writingsIndexHtml(posts)
    await emit("/writings", renderPage({
      title: "Writings", url: "/writings", section: null, html,
      ogImage: "/static/og/writings.png", description: "Essays and notes by Mateo.",
    }))
    sitemapUrls.push({ url: "/writings" })
    ogJobs.push({ path: "/static/og/writings.png", title: "Writings", subtitle: `${posts.length} posts` })
  }

  // tags index
  {
    const html = `<p>Browse writings by topic.</p>` + tagsIndexHtml(tagMap)
    await emit("/tags", renderPage({
      title: "Tags", url: "/tags", html, ogImage: "/static/og/tags.png",
      description: "Browse writings by tag.",
    }))
    sitemapUrls.push({ url: "/tags" })
    ogJobs.push({ path: "/static/og/tags.png", title: "Tags", subtitle: "browse by topic" })
  }

  // per-tag pages
  for (const [tag, tposts] of tagMap) {
    const slug = tagSlug(tag)
    const html = `<p>Writings tagged <strong>#${esc(tag)}</strong>.</p>` + tagPageHtml(tag, tposts)
    await emit(`/tags/${slug}`, renderPage({
      title: `#${tag}`, url: `/tags/${slug}`, section: "tags", html,
      ogImage: `/static/og/tags-${slug}.png`, description: `Writings tagged ${tag}.`,
    }))
    sitemapUrls.push({ url: `/tags/${slug}` })
    ogJobs.push({ path: `/static/og/tags-${slug}.png`, title: `#${tag}`, subtitle: `${tposts.length} posts` })
  }

  // static assets
  await copyDir(path.join(ROOT, "assets"), path.join(OUT, "static"))
  await copyDir(path.join(ROOT, "scripts"), path.join(OUT, "scripts"))
  if (dataFiles.length) await copyDir(path.join(CONTENT, "data"), path.join(OUT, "data"))

  // alias redirects (frontmatter `aliases`)
  for (const p of pages) {
    for (const a of p.aliases) {
      const aslug = String(a).replace(/^\/+/, "")
      await emit(`/${aslug}`, redirectHtml(p.url))
    }
  }

  // OG images
  for (const job of ogJobs) {
    try {
      const png = await makeOgImage(ROOT, { title: job.title, subtitle: job.subtitle })
      const dest = path.join(OUT, job.path.replace(/^\//, ""))
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest, png)
    } catch (e) {
      console.warn(`OG failed for ${job.title}: ${e.message}`)
    }
  }
  // default OG
  try {
    const png = await makeOgImage(ROOT, { title: "blog-19182", subtitle: "Mateo's blog" })
    await writeFile(path.join(OUT, "static", "og-default.png"), png)
  } catch {}

  // custom 404
  await writeFile(
    path.join(OUT, "404.html"),
    renderPage({
      title: "404",
      url: "/404",
      html: `<p style="font-size:3rem;font-family:var(--font-header);margin:2rem 0 0.5rem">404</p>
<p>This page doesn't exist (or wandered off). Try the <a href="/">home page</a> or the <a href="/writings">writings</a>.</p>`,
      ogImage: "/static/og-default.png",
      description: "Page not found.",
    }),
  )

  // feeds
  await writeFile(path.join(OUT, "index.xml"), buildRss(posts))
  await writeFile(path.join(OUT, "sitemap.xml"), buildSitemap(sitemapUrls))
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`)

  console.log(`Built ${pages.length} pages + ${tagMap.size} tags in ${Date.now() - t0}ms -> public/`)
}

function redirectHtml(to) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><title>Redirecting…</title></head><body><a href="${to}">${to}</a></body></html>`
}

// ---- dev server -------------------------------------------------------------
async function serve(port = 8080) {
  const http = await import("node:http")
  const mime = {
    ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
    ".xml": "application/xml", ".md": "text/markdown; charset=utf-8", ".pdf": "application/pdf",
    ".txt": "text/plain", ".gif": "image/gif", ".webp": "image/webp",
  }
  http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(req.url.split("?")[0])
      let file = path.join(OUT, p)
      if (existsSync(file) && (await stat(file)).isDirectory()) file = path.join(file, "index.html")
      else if (!existsSync(file) && existsSync(file + ".html")) file += ".html"
      else if (!existsSync(file)) file = path.join(OUT, p, "index.html")
      if (!existsSync(file)) { res.writeHead(404); res.end("404"); return }
      const body = await readFile(file)
      res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" })
      res.end(body)
    } catch (e) {
      res.writeHead(500); res.end(String(e))
    }
  }).listen(port, () => console.log(`Serving public/ at http://localhost:${port}`))
}

const args = process.argv.slice(2)
await build()
if (args.includes("--serve")) await serve()
