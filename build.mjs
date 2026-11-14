#!/usr/bin/env node
// blog-19182 static site generator.
// Reads content/*.md, renders minimal HTML, emits raw .md copies, OG images,
// RSS, sitemap. No framework — just markdown-it + a few templates.

import { readFile, writeFile, mkdir, readdir, copyFile, rm, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import { makeRenderer, initHighlighter } from "./lib/markdown.mjs"
import {
  renderPage, writingsIndexHtml, tagsIndexHtml,
  tagPageHtml, tagSlug, SITE, esc, t, projectListMd, checkProjectTags,
} from "./lib/templates.mjs"
import { makeOgImage } from "./lib/og.mjs"
import { buildRss, buildSitemap } from "./lib/feeds.mjs"
import { fileSlug } from "./lib/slug.mjs"
import { newsletterExcerpt } from "./lib/newsletter.mjs"
import { linkUpdates, updatesPage } from "./lib/updates.mjs"
import { faviconLookup, FAVICON_DIR } from "./lib/favicons.mjs"
import { cleanLinks } from "./lib/links.mjs"
import { countWords, normalizeDate } from "./lib/content.mjs"
import { pageMeta, translationSlots, soundtrackInfo, buildSeries, makeResolver, renderBody, visibleProjects, unlinkDrafts, unlinkDraftsMd } from "./lib/page.mjs"
import { buildEditor } from "./lib/editor-build.mjs"

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const CONTENT = path.join(ROOT, "content")
const OUT = path.join(ROOT, "public")

// Links from one rendered page to other writings, as their URLs.
function writingLinks(html) {
  const urls = new Set()
  for (const [, href] of html.matchAll(/href="(?:https:\/\/blog\.m19182\.dev)?(\/writings\/[^"#?]+)/g)) {
    try { urls.add(decodeURIComponent(href).replace(/\/+$/, "")) } catch {}
  }
  return urls
}

function ogSubtitle(page) {
  if (page.isHome) return "Mateo's blog"
  if (page.isArticle && page.date) return page.date
  return {
    now: "what I'm working on",
    updates: "life updates",
    projects: "things I've built",
    writings: "essays and notes",
    "link-archive": "a living archive of links",
    "things-i-like": "books, music, films, and more",
  }[page.name] || "blog.m19182.dev"
}

// Plain-text opening of a rendered post for link previews: the lede paragraph
// (or the first one outside <details>) plus the next if the first is short.
function previewExcerpt(html, max = 520) {
  let body = html.replace(/<sup class="footnote-ref">[\s\S]*?<\/sup>/g, "")
  const lede = body.indexOf('<p class="lede">')
  if (lede >= 0) body = body.slice(lede)
  else body = body.replace(/<details[\s\S]*?<\/details>/g, "")
  const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim()
  const paras = []
  for (const m of body.matchAll(/<p(?: class="lede")?>([\s\S]*?)<\/p>/g)) {
    const s = text(m[1])
    if (!s) continue
    paras.push(s)
    if (paras.length === 2 || paras.join(" ").length >= 280) break
  }
  let out = paras.join("\n")
  if (out.length > max) out = out.slice(0, out.lastIndexOf(" ", max)).replace(/[\s,;:.–—-]+$/, "") + "…"
  return out
}

// ---- load content -----------------------------------------------------------
async function loadAll() {
  const dataFiles = existsSync(path.join(CONTENT, "data"))
    ? await readdir(path.join(CONTENT, "data"))
    : []

  // `draft: true` pages are left out of the site entirely; only the editor lists them.
  const pages = [], drafts = []
  for (const [dir, section] of [[CONTENT, null], [path.join(CONTENT, "writings"), "writings"]]) {
    for (const f of await readdir(dir)) {
      if (!f.endsWith(".md") || /\.(es|en)\.md$/.test(f)) continue
      const page = await loadFile(path.join(dir, f), f.replace(/\.md$/, ""), section)
      ;(page.draft ? drafts : pages).push(page)
    }
  }
  return { pages, drafts, dataFiles }
}

// Front matter and body of a content file, with outbound links cleaned.
async function readContent(file) {
  return matter(cleanLinks(await readFile(file, "utf8")))
}

async function loadFile(file, name, section) {
  const { data, content } = await readContent(file)
  return {
    ...pageMeta(name, section, data, content),
    soundtrack: await loadSoundtrack(data.soundtrack, file),
    ...(await loadTranslations(file, name, data, content)),
  }
}

let soundtrackPeaks
async function loadSoundtrack(s, file) {
  if (!s) return null
  if (!s.artist || !s.title || !s.file) throw new Error(`${file}: soundtrack needs artist, title and file`)
  const dir = path.join(CONTENT, "data", "soundtrack")
  if (!existsSync(path.join(dir, s.file))) throw new Error(`${file}: missing content/data/soundtrack/${s.file}`)
  soundtrackPeaks ??= JSON.parse(await readFile(path.join(dir, "peaks.json"), "utf8"))
  const wave = soundtrackPeaks[s.file]
  if (!wave) throw new Error(`${file}: no peaks for ${s.file}; run npm run soundtrack:peaks`)
  return soundtrackInfo(s, wave)
}

async function loadTranslations(file, name, data, content) {
  const sibling = file.replace(/\.md$/, data.lang === "es" ? ".en.md" : ".es.md")
  return translationSlots(name, data, content, existsSync(sibling) ? await readContent(sibling) : null)
}

async function loadUpdates() {
  const dir = path.join(CONTENT, "updates")
  if (!existsSync(dir)) return []
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md") && !f.endsWith(".en.md"))
  const updates = await Promise.all(files.map(async (f) => {
    const file = path.join(dir, f)
    const { data, content } = await readContent(file)
    if (data.draft === true) return null
    const title = data.title || f.replace(/\.md$/, "")
    const enFile = file.replace(/\.md$/, ".en.md")
    const en = existsSync(enFile) && (await readContent(enFile))
    return { title, date: normalizeDate(data.date), content, ...(en && { en: { title: en.data.title || title, content: en.content } }) }
  }))
  return updates.filter(Boolean)
}

// Project cards live in content/projects.yml; `hidden: true` entries are kept but not shown.
async function loadProjects(drafts) {
  const file = path.join(CONTENT, "projects.yml")
  if (!existsSync(file)) return []
  const list = matter.engines.yaml.parse(await readFile(file, "utf8")) || []
  checkProjectTags(list.filter((p) => !p.hidden))
  return visibleProjects(list, drafts.map((d) => d.url))
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

  const { pages, drafts, dataFiles } = await loadAll()
  const updates = await loadUpdates()
  if (updates.length) {
    pages.push(updatesPage(updates))
    linkUpdates(pages.find((p) => p.name === "now" && !p.section))
  }
  const resolve = makeResolver(pages, dataFiles)
  const faviconFile = path.join(ROOT, FAVICON_DIR, "manifest.json")
  const favicons = faviconLookup(existsSync(faviconFile) ? JSON.parse(await readFile(faviconFile, "utf8")) : {})
  const md = makeRenderer(resolve, { favicon: favicons.lookup })
  const projects = await loadProjects(drafts)

  const posts = pages
    .filter((p) => p.isArticle && !p.unlisted)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))

  // tag map (writings only)
  const tagMap = new Map()
  for (const p of posts) {
    for (const t of p.tags) {
      if (!tagMap.has(t)) tagMap.set(t, [])
      tagMap.get(t).push(p)
    }
  }

  const sitemapUrls = []
  const ogJobs = []
  const searchDocs = []
  const previews = {}

  for (const p of pages) {
    p.words = countWords(p.en ? p.en.rawContent : p.rawContent)
    if (p.es) p.es.words = countWords(p.es.rawContent)
  }
  buildSeries(posts)

  // render each content page, then link writings to the ones that cite them
  const rendered = []
  for (const p of pages) {
    const { html: bodyHtml, toc, es } = renderBody(md, p, projects)
    const ogPath = p.name === "El reto de Feijoo" ? "/static/og/feijoo-documentos-sin-texto.png" : p.isHome ? "/static/og/index.png" : `/static/og${p.url}.png`
    const page = {
      ...p,
      html: bodyHtml,
      toc,
      es,
      ogImage: ogPath,
      showFilter: p.name === "link-archive",
    }
    rendered.push([p, page])
  }

  const byUrl = new Map()
  for (const p of posts) {
    byUrl.set(p.url, p)
    for (const a of p.aliases) byUrl.set("/" + String(a).replace(/^\/+|\/+$/g, ""), p)
  }
  const backlinks = new Map()
  for (const [p, page] of rendered) {
    if (!p.isArticle || p.unlisted) continue
    const series = p.seriesInfo?.posts || []
    for (const url of writingLinks(page.html + (page.es?.html || ""))) {
      const target = byUrl.get(url)
      // the series banner already lists every part
      if (!target || target === p || series.includes(target)) continue
      if (!backlinks.has(target.url)) backlinks.set(target.url, new Set())
      backlinks.get(target.url).add(p)
    }
  }

  // Drafts aren't built: links to them stay plain text until they are published.
  const draftUrls = new Set(drafts.map((d) => d.url))
  for (const [, page] of rendered) {
    page.html = unlinkDrafts(page.html, draftUrls)
    if (page.es) page.es.html = unlinkDrafts(page.es.html, draftUrls)
  }

  for (const [p, page] of rendered) {
    page.backlinks = [...(backlinks.get(page.url) || [])]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    await emit(p.url, renderPage(page))
    if ((p.isArticle || SEARCHED_PAGES.has(p.name)) && !p.unlisted) searchDocs.push(...searchRecords(page))
    if (p.isArticle && !p.unlisted) {
      const slot = (s, html) => ({ title: s.title, summary: s.summary || "", excerpt: previewExcerpt(html) })
      previews[p.url] = { date: p.date, en: slot(p.en || p, page.html), ...(page.es && { es: slot(page.es, page.es.html) }) }
    }
    await emitMd(p.url, p.title, unlinkDraftsMd(p.name === "projects" ? p.rawContent + "\n" + projectListMd(projects) : p.rawContent, draftUrls))
    if (!p.unlisted) sitemapUrls.push({ url: p.url, date: p.updated > p.date ? p.updated : p.date })
    ogJobs.push({
      path: page.ogImage,
      title: p.isHome ? "blog-19182" : p.title,
      subtitle: ogSubtitle(p),
    })
  }

  // writings index
  {
    const html = `<p class="writings-intro"><span>${t("Essays and notes", "Ensayos y notas")}</span><span class="subscription-links">${t("Subscribe:", "Suscribirse:")} <a href="/index.xml">RSS</a><span class="dot">·</span><a href="/subscribe">Email</a></span></p>` + writingsIndexHtml(posts)
    await emit("/writings", renderPage({
      title: "Writings", url: "/writings", section: null, html, es: { title: "Escritos" },
      ogImage: "/static/og/writings.png", description: "Essays and notes by Mateo.",
    }))
    sitemapUrls.push({ url: "/writings" })
    ogJobs.push({ path: "/static/og/writings.png", title: "Writings", subtitle: `${posts.length} posts` })
  }

  // tags index
  {
    const html = `<p>${t("Browse writings by topic.", "Explora los escritos por tema.")}</p>` + tagsIndexHtml(tagMap)
    await emit("/tags", renderPage({
      title: "Tags", url: "/tags", html, es: { title: "Etiquetas" }, ogImage: "/static/og/tags.png",
      description: "Browse writings by tag.",
    }))
    sitemapUrls.push({ url: "/tags" })
    ogJobs.push({ path: "/static/og/tags.png", title: "Tags", subtitle: "browse by topic" })
  }

  // per-tag pages
  for (const [tag, tposts] of tagMap) {
    const slug = tagSlug(tag)
    const html = `<p>${t("Writings tagged", "Escritos con la etiqueta")} <strong>#${esc(tag)}</strong>.</p>` + tagPageHtml(tag, tposts)
    await emit(`/tags/${slug}`, renderPage({
      title: `#${tag}`, url: `/tags/${slug}`, section: "tags", html, es: { title: `#${tag}` },
      ogImage: `/static/og/tags-${slug}.png`, description: `Writings tagged ${tag}.`,
    }))
    sitemapUrls.push({ url: `/tags/${slug}` })
    ogJobs.push({ path: `/static/og/tags-${slug}.png`, title: `#${tag}`, subtitle: `${tposts.length} posts` })
  }

  // static assets
  await copyDir(path.join(ROOT, "assets"), path.join(OUT, "static"))
  await copyDir(path.join(ROOT, "scripts"), path.join(OUT, "scripts"))
  if (dataFiles.length) await copyDir(path.join(CONTENT, "data"), path.join(OUT, "data"))
  // hover previews for links between writings (scripts/notes.js)
  await mkdir(path.join(OUT, "data"), { recursive: true })
  await writeFile(path.join(OUT, "data", "previews.json"), JSON.stringify(previews))

  // alias redirects (frontmatter `aliases`)
  for (const p of pages) {
    for (const a of p.aliases) {
      const aslug = String(a).replace(/^\/+/, "")
      await emit(`/${aslug}`, redirectHtml(p.url))
    }
  }

  // the flag designer moved to its own repo and site
  await emit("/flag", redirectHtml("https://flag.m19182.dev/"))

  // retired tags
  for (const [from, to] of [["writing", "/writings"], ["complex-systems", "/tags/systems"], ["rambling", "/tags/personal"]]) {
    await emit(`/tags/${from}`, redirectHtml(to))
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
<p>${t(
        `This page doesn't exist (or wandered off). Try the <a href="/">home page</a> or the <a href="/writings">writings</a>.`,
        `Esta página no existe (o se ha perdido). Prueba la <a href="/">página de inicio</a> o los <a href="/writings">escritos</a>.`,
      )}</p>`,
      es: { title: "404" },
      ogImage: "/static/og-default.png",
      description: "Page not found.",
    }),
  )

  // feeds
  await writeFile(path.join(OUT, "index.xml"), buildRss(posts))
  await writeFile(path.join(OUT, "newsletter.json"), JSON.stringify(posts.map(p => ({
    url: p.url,
    title: p.en?.title || p.title,
    summary: p.lang === "es" ? p.en?.summary || "" : p.summary,
    excerpt: newsletterExcerpt(p.lang === "es" ? p.en?.rawContent || "" : p.rawContent, p.url),
  }))))
  await writeFile(path.join(OUT, "sitemap.xml"), buildSitemap(sitemapUrls))
  // Cloudflare Pages would serve .webm as video/webm.
  await writeFile(path.join(OUT, "_headers"), "/data/soundtrack/*.webm\n  Content-Type: audio/webm\n")
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /edit\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`)
  await buildEditor({ root: ROOT, out: OUT, pages, drafts, posts, dataFiles })
  await buildSearchIndex(searchDocs)

  // tools/fetch-favicons.mjs reads the hosts in use from here
  if (process.env.FAVICON_HOSTS_OUT) await writeFile(process.env.FAVICON_HOSTS_OUT, JSON.stringify([...favicons.seen].sort()))
  const unknownHosts = favicons.unknown()
  if (unknownHosts.length) console.log(`${unknownHosts.length} link hosts have no cached favicon yet (npm run favicons): ${unknownHosts.slice(0, 5).join(", ")}${unknownHosts.length > 5 ? ", …" : ""}`)

  console.log(`Built ${pages.length} pages + ${tagMap.size} tags in ${Date.now() - t0}ms -> public/`)
}

// ---- search (Pagefind) ------------------------------------------------------
// Writings plus these pages are searchable; the link archive has its own filter.
const SEARCHED_PAGES = new Set(["now", "updates", "projects", "things-i-like"])

// One record per language slot, so a result shows the text that matched and
// `?lang=` opens the page in that language. Everything goes into one index
// (English stemming) so both languages are searched whatever the UI language.
function searchRecords(page) {
  const slots = page.es
    ? [["en", page.en?.title || page.title, page.html], ["es", page.es.title, page.es.html]]
    : [[page.lang, page.title, page.html]]
  return slots.map(([lang, title, html]) => ({
    url: `${page.url}/${page.es ? `?lang=${lang}` : ""}`,
    content: `<!DOCTYPE html><html lang="${lang}"><head><title>${esc(title)}</title></head><body>
<main data-pagefind-body><span data-pagefind-meta="lang:${lang}"></span>${page.date ? `<span data-pagefind-meta="date:${page.date}"></span>` : ""}<h1>${esc(title)}</h1>
${html}</main></body></html>`,
  }))
}

async function buildSearchIndex(docs) {
  const pagefind = await import("pagefind")
  const { index, errors } = await pagefind.createIndex({
    forceLanguage: "en",
    excludeSelectors: [".footnote-ref", ".footnote-backref", ".katex", "svg"],
  })
  if (!index) throw new Error(`Pagefind: ${errors.join("; ")}`)
  for (const doc of docs) {
    const r = await index.addHTMLFile(doc)
    if (r.errors.length) throw new Error(`Pagefind ${doc.url}: ${r.errors.join("; ")}`)
  }
  await index.writeFiles({ outputPath: path.join(OUT, "pagefind") })
  await pagefind.close()
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
    ".json": "application/json", ".wasm": "application/wasm", ".webm": "audio/webm",
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
      const type = mime[path.extname(file)] || "application/octet-stream"
      // Audio can only seek with byte ranges, which Cloudflare also serves.
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "")
      if (range && (range[1] || range[2])) {
        const start = range[1] ? Number(range[1]) : Math.max(0, body.length - Number(range[2]))
        const end = range[1] && range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1
        res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${body.length}` })
        res.end(body.subarray(start, end + 1))
        return
      }
      res.writeHead(200, { "content-type": type, "accept-ranges": "bytes" })
      res.end(body)
    } catch (e) {
      res.writeHead(500); res.end(String(e))
    }
  }).listen(port, () => console.log(`Serving public/ at http://localhost:${port}`))
}

const args = process.argv.slice(2)
await build()
if (args.includes("--serve")) await serve()
