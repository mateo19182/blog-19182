// How a content file becomes a page: shared by build.mjs and the web editor's
// preview, so the preview renders what the site will. No Node APIs here.
import { fileSlug, linkKey } from "./slug.mjs"
import { normalizeDate } from "./content.mjs"
import { projectListHtml } from "./templates.mjs"

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|pdf|avif)$/i

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

// Meta description: the front matter's, else the summary, else the opening text.
function describe(data, content) {
  return data.description || data.summary || stripToText(content).slice(0, 160).trim()
}

// Page fields from a file's name, section, front matter and body.
export function pageMeta(name, section, data, content) {
  const isHome = name === "index" && !section
  const slug = isHome ? "" : fileSlug(name)
  const url = isHome ? "/" : section ? `/${section}/${slug}` : `/${slug}`
  return {
    name, section, slug, url, isHome,
    title: data.title || name,
    lang: data.lang === "es" ? "es" : "en",
    unlisted: data.unlisted === true,
    draft: data.draft === true,
    date: normalizeDate(data.date),
    updated: normalizeDate(data.updated),
    series: data.series ? String(data.series) : "",
    seriesEs: data.series_es ? String(data.series_es) : "",
    seriesOrder: Number.isFinite(data.series_order) ? data.series_order : null,
    summary: data.summary || "",
    description: describe(data, content),
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    rawContent: content,
    isArticle: section === "writings",
  }
}

// The default slot is English and `es` is Spanish, whichever was written first.
// An English-original page may have a sibling `foo.es.md`; a Spanish-original one
// (`lang: es`) may have `foo.en.md`. `translated` names the slot that is a translation.
// `sibling` is the translation's { data, content }, or null.
export function translationSlots(name, data, content, sibling) {
  const title = data.title || name
  const tr = sibling && { title: sibling.data.title || title, summary: sibling.data.summary || "", description: describe(sibling.data, sibling.content), rawContent: sibling.content }
  if (data.lang === "es") {
    if (!tr) return { es: null }
    return { en: tr, es: { title, summary: data.summary || "", description: describe(data, content), rawContent: content }, translated: "en" }
  }
  // The link list is regenerated weekly, so the Spanish page only translates the intro.
  if (tr && name === "link-archive") tr.rawContent += "\n" + content.slice(content.indexOf("\n- ["))
  return { es: tr, translated: tr ? "es" : null }
}

// `wave` is the file's entry in content/data/soundtrack/peaks.json.
export function soundtrackInfo(s, wave) {
  return {
    artist: String(s.artist), title: String(s.title),
    src: `/data/soundtrack/${encodeURIComponent(s.file)}`,
    ...wave,
  }
}

// Posts sharing a `series:` name, ordered by `series_order`, then date.
export function buildSeries(posts) {
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

// Wikilink targets: page names and titles (both languages), and data files.
export function makeResolver(pages, dataFiles) {
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
      const base = target.split("/").pop()
      if (dataSet.has(base)) return { href: `/data/${base}`, exists: true }
      return { href: "", exists: false }
    }
    return map.get(linkKey(target)) || null
  }
}

// A page's body HTML in each language, with its table of contents.
export function renderBody(md, p, projects) {
  const imageCaptions = p.name === "El reto de Feijoo"
  // every link-archive entry is external, so it stays free of markers
  const noFavicons = p.name === "link-archive"
  let html = md.render(p.en ? p.en.rawContent : p.rawContent, { imageCaptions, lede: p.isArticle, noFavicons })
  const toc = p.isArticle ? extractToc(html) : []
  let es = null
  if (p.es) {
    const esHtml = md.render(p.es.rawContent, { docId: "es", imageCaptions, lede: p.isArticle, noFavicons })
    es = { ...p.es, html: esHtml, toc: p.isArticle ? extractToc(esHtml) : [] }
  }
  if (p.name === "projects") {
    const inline = (s) => md.renderInline(s)
    html += projectListHtml(projects, inline)
    if (es) es.html += projectListHtml(projects, inline, "es")
  }
  return { html, toc, es }
}

// Project cards to show, newest first (undated last, in file order). A card
// linking to a draft writing stays hidden until the writing is published.
export function visibleProjects(list, draftUrls = []) {
  const drafts = new Set(draftUrls)
  const target = (url) => String(url || "").replace(/^https:\/\/blog\.m19182\.dev/, "").replace(/\/+$/, "")
  return list
    .filter((p) => !p.hidden && !drafts.has(target(p.url)))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
}

// Links to drafts become plain text on published pages, so nothing points to
// (or names the URL of) a post that isn't out yet. `md` handles Markdown source.
const draftHref = (urls) => (href) => {
  const path = href.replace(/^https:\/\/blog\.m19182\.dev/, "").replace(/[#?].*$/, "").replace(/\/+$/, "")
  try { return urls.has(decodeURIComponent(path)) } catch { return false }
}
export function unlinkDrafts(html, draftUrls) {
  if (!draftUrls.size) return html
  const isDraft = draftHref(draftUrls)
  return html.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, text) => (isDraft(href) ? text : m))
}
export function unlinkDraftsMd(md, draftUrls) {
  if (!draftUrls.size) return md
  const isDraft = draftHref(draftUrls)
  return md.replace(/(?<!!)\[([^\]]*)\]\(([^)\s]+)\)/g, (m, text, href) => (isDraft(href) ? text : m))
}

// The URLs of a page in each language: the original at its own path, a
// translation under /es or /en. `alt` is the other language, if there is one.
export function pageViews(page) {
  const lang = page.lang || "en"
  const own = { lang, url: page.url }
  if (!page.es) return [own]
  const altLang = lang === "es" ? "en" : "es"
  const alt = { lang: altLang, url: `/${altLang}${page.url === "/" ? "" : page.url}` }
  return [{ ...own, alt }, { ...alt, alt: own }]
}

// Links to the site's pages get the trailing slash Cloudflare serves them at
// (it redirects the bare path) and point to the version in `lang` when there is
// one. `versions` maps every page's slashed URL to its { en, es } slashed URLs;
// other paths (files, unknown pages) and links to another language
// (`hreflang` before `href`) are left alone.
export function localizeLinks(html, lang, versions) {
  return html.replace(/(?<!hreflang="[a-z]{2}" )\bhref="(\/(?!\/)[^"#?]*)([^"]*)"/g, (m, path, rest) => {
    const slashed = path.endsWith("/") ? path : path + "/"
    let v
    try { v = versions.get(decodeURI(slashed)) } catch {}
    return v ? `href="${encodeURI(v[lang] || Object.values(v)[0])}${rest}"` : m
  })
}
