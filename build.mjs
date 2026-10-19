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
  tagPageHtml, tagSlug, SITE, esc, t, projectListHtml, projectListMd, checkProjectTags,
} from "./lib/templates.mjs"
import { makeOgImage } from "./lib/og.mjs"
import { buildRss, buildSitemap } from "./lib/feeds.mjs"
import { fileSlug } from "./lib/slug.mjs"
import { newsletterExcerpt } from "./lib/newsletter.mjs"
import { appendUpdates } from "./lib/updates.mjs"
import { loadFavicons } from "./lib/favicons.mjs"

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

// Words a reader reads: prose, not code, maths, URLs or markup.
function countWords(md) {
  const text = md
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$(?=\S)[^$\n]*?\S\$/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/!\[\[[^\]]*\]\]|!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[\^[^\]]*\]:?/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/<[^>]+>|https?:\/\/\S+/g, " ")
  return (text.match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []).length
}

// Links from one rendered page to other writings, as their URLs.
function writingLinks(html) {
  const urls = new Set()
  for (const [, href] of html.matchAll(/href="(?:https:\/\/blog\.m19182\.dev)?(\/writings\/[^"#?]+)/g)) {
    try { urls.add(decodeURIComponent(href).replace(/\/+$/, "")) } catch {}
  }
  return urls
}

// Posts sharing a `series:` name, ordered by `series_order`, then date.
function buildSeries(posts) {
  const map = new Map()
  for (const p of posts) {
    if (!p.series) continue
    if (!map.has(p.series)) map.set(p.series, { name: p.series, nameEs: "", posts: [] })
    const s = map.get(p.series)
    s.nameEs ||= p.seriesEs
    s.posts.push(p)
  }
  const order = (p) => p.seriesOrder ?? Infinity
  for (const s of map.values()) {
    s.posts.sort((a, b) => order(a) - order(b) || (a.date || "").localeCompare(b.date || ""))
    s.posts.forEach((p, i) => { p.seriesInfo = { ...s, index: i } })
  }
}

function ogSubtitle(page) {
  if (page.isHome) return "Mateo's blog"
  if (page.isArticle && page.date) return page.date
  return {
    now: "what I'm working on",
    projects: "things I've built",
    writings: "essays and notes",
    "link-archive": "a living archive of links",
    "things-i-like": "books, music, films, and more",
  }[page.name] || "blog.m19182.dev"
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

  const pages = []
  // top-level pages
  for (const f of await readdir(CONTENT)) {
    if (!f.endsWith(".md") || /\.(es|en)\.md$/.test(f)) continue
    pages.push(await loadFile(path.join(CONTENT, f), f.replace(/\.md$/, ""), null))
  }
  // writings
  const wdir = path.join(CONTENT, "writings")
  for (const f of await readdir(wdir)) {
    if (!f.endsWith(".md") || /\.(es|en)\.md$/.test(f)) continue
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
    lang: data.lang === "es" ? "es" : "en",
    unlisted: data.unlisted === true,
    date: normalizeDate(data.date),
    updated: normalizeDate(data.updated),
    series: data.series ? String(data.series) : "",
    seriesEs: data.series_es ? String(data.series_es) : "",
    seriesOrder: Number.isFinite(data.series_order) ? data.series_order : null,
    summary: data.summary || "",
    description: data.description || data.summary || text.slice(0, 160).trim(),
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    aliases: Array.isArray(data.aliases) ? data.aliases : data.aliases ? [data.aliases] : [],
    rawContent: content,
    isArticle: section === "writings",
    ...(await loadTranslations(file, name, data, content)),
  }
}

// The default slot is English and `es` is Spanish, whichever was written first.
// An English-original page may have a sibling `foo.es.md`; a Spanish-original one
// (`lang: es`) may have `foo.en.md`. `translated` names the slot that is a translation.
async function loadTranslations(file, name, data, content) {
  const title = data.title || name
  if (data.lang === "es") {
    const en = await loadTranslation(file.replace(/\.md$/, ".en.md"), title)
    if (!en) return { es: null }
    return {
      en,
      es: { title, summary: data.summary || "", rawContent: content },
      translated: "en",
    }
  }
  const es = await loadTranslation(file.replace(/\.md$/, ".es.md"), title)
  // The link list is regenerated weekly, so the Spanish page only translates the intro.
  if (es && name === "link-archive") es.rawContent += "\n" + content.slice(content.indexOf("\n- ["))
  return { es, translated: es ? "es" : null }
}

// Optional Spanish version of a page, written by hand as a sibling `foo.es.md`.
async function loadTranslation(file, fallbackTitle) {
  if (!existsSync(file)) return null
  const { data, content } = matter(await readFile(file, "utf8"))
  return {
    title: data.title || fallbackTitle,
    summary: data.summary || "",
    rawContent: content,
  }
}

async function loadUpdates() {
  const dir = path.join(CONTENT, "updates")
  if (!existsSync(dir)) return []
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"))
  return Promise.all(files.map(async (f) => {
    const { data, content } = matter(await readFile(path.join(dir, f), "utf8"))
    return { title: data.title || f.replace(/\.md$/, ""), date: normalizeDate(data.date), content }
  }))
}

// Project cards live in content/projects.yml; `hidden: true` entries are kept but not shown.
// Newest first; undated entries go last, in file order.
async function loadProjects() {
  const file = path.join(CONTENT, "projects.yml")
  if (!existsSync(file)) return []
  const list = (matter.engines.yaml.parse(await readFile(file, "utf8")) || []).filter((p) => !p.hidden)
  checkProjectTags(list)
  return list.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
}

// ---- resolver for wikilinks -------------------------------------------------
function makeResolver(pages, dataFiles) {
  const dataSet = new Set(dataFiles)
  const map = new Map()
  const put = (key, href) => map.set(linkKey(key), { href, exists: true })
  for (const p of pages) {
    put(p.name, p.url)
    if (p.title) put(p.title, p.url)
    if (p.es) put(p.es.title, p.url)
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
  appendUpdates(pages.find((p) => p.name === "now" && !p.section), await loadUpdates())
  const resolve = makeResolver(pages, dataFiles)
  const favicons = loadFavicons(ROOT)
  const md = makeRenderer(resolve, { favicon: favicons.lookup })
  const projects = await loadProjects()

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
    const imageCaptions = p.name === "El reto de Feijoo"
    // every link-archive entry is external, so it stays free of markers
    const noFavicons = p.name === "link-archive"
    let bodyHtml = md.render(p.en ? p.en.rawContent : p.rawContent, { imageCaptions, lede: p.isArticle, noFavicons })
    const toc = p.isArticle ? extractToc(bodyHtml) : []
    let es = null
    if (p.es) {
      const html = md.render(p.es.rawContent, { docId: "es", imageCaptions, lede: p.isArticle, noFavicons })
      es = { ...p.es, html, toc: p.isArticle ? extractToc(html) : [] }
    }

    if (p.name === "projects") {
      const inline = (s) => md.renderInline(s)
      bodyHtml += projectListHtml(projects, inline)
      if (es) es.html += projectListHtml(projects, inline, "es")
    }

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

  for (const [p, page] of rendered) {
    page.backlinks = [...(backlinks.get(page.url) || [])]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    await emit(p.url, renderPage(page))
    if ((p.isArticle || SEARCHED_PAGES.has(p.name)) && !p.unlisted) searchDocs.push(...searchRecords(page))
    if (p.isArticle && !p.unlisted) {
      const slot = (s, html) => ({ title: s.title, summary: s.summary || "", excerpt: previewExcerpt(html) })
      previews[p.url] = { date: p.date, en: slot(p.en || p, page.html), ...(page.es && { es: slot(page.es, page.es.html) }) }
    }
    await emitMd(p.url, p.title, p.name === "projects" ? p.rawContent + "\n" + projectListMd(projects) : p.rawContent)
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
  await writeFile(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`)
  await buildSearchIndex(searchDocs)

  // tools/fetch-favicons.mjs reads the hosts in use from here
  if (process.env.FAVICON_HOSTS_OUT) await writeFile(process.env.FAVICON_HOSTS_OUT, JSON.stringify([...favicons.seen].sort()))
  const unknownHosts = favicons.unknown()
  if (unknownHosts.length) console.log(`${unknownHosts.length} link hosts have no cached favicon yet (npm run favicons): ${unknownHosts.slice(0, 5).join(", ")}${unknownHosts.length > 5 ? ", …" : ""}`)

  console.log(`Built ${pages.length} pages + ${tagMap.size} tags in ${Date.now() - t0}ms -> public/`)
}

// ---- search (Pagefind) ------------------------------------------------------
// Writings plus these pages are searchable; the link archive has its own filter.
const SEARCHED_PAGES = new Set(["now", "projects", "things-i-like"])

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
    ".json": "application/json", ".wasm": "application/wasm",
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
