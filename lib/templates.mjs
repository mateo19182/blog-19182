// HTML templates — a single minimal page shell plus small partials.

const SITE = {
  title: "blog-19182",
  author: "Mateo",
  baseUrl: "https://blog.m19182.dev",
  locale: "en-US",
  umamiHost: "https://umami.m19182.dev",
  umamiId: "23e4acbd-b580-49f5-8582-40c77218c6cc",
}

export { SITE }

const NAV = [
  { href: "/now", label: "now", es: "ahora" },
  { href: "/writings", label: "writings", es: "escritos" },
  { href: "/projects", label: "projects", es: "proyectos" },
  { href: "/link-archive", label: "links", es: "enlaces" },
  { href: "/things-i-like", label: "extras", es: "extras", desktopOnly: true },
]

function esc(s = "") {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
}

// Both language variants of a snippet (already-escaped HTML). CSS shows the one
// matching <html lang>, which the pre-paint script in <head> sets.
function t(en, es) {
  return `<span class="i18n" lang="en">${en}</span><span class="i18n" lang="es">${es}</span>`
}

// Title in the default (English) slot, which is a translation for Spanish originals.
function enTitle(page) {
  return page.en ? page.en.title : page.title
}

// One-line notice at the top of a translated article, with a way back to the original.
function translationNote(page, slot) {
  if (!page.isArticle || page.translated !== slot) return ""
  const [text, action] = slot === "es"
    ? ["Traducido con un LLM del original en inglés.", "Leer el original"]
    : ["LLM-translated from the Spanish original.", "Read the original"]
  return `<p class="translation-note">${text} <button type="button" class="lang-switch">${action}</button></p>\n`
}

// Page-level content: wrap only when a Spanish version exists.
function bilingual(en, es, tag = "div") {
  if (es == null) return en
  return `<${tag} class="i18n" lang="en">${en}</${tag}><${tag} class="i18n" lang="es">${es}</${tag}>`
}

function dateHtml(d) {
  return t(fmtDate(d), fmtDate(d, "es-ES"))
}

function fmtDate(d, locale = SITE.locale) {
  if (!d) return ""
  const date = new Date(d + "T00:00:00Z")
  if (isNaN(date)) return ""
  return date.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" })
}

const themeToggle = `<button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
      <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>`

function langToggle(page) {
  const label = page.es ? "Switch language / Cambiar idioma" : page.lang === "es" ? "Solo disponible en español" : "Only available in English"
  return `<button class="lang-toggle" aria-label="${label}" title="${label}"${page.es ? "" : " disabled"}><span lang="en">EN</span><span lang="es">ES</span></button>`
}

function header(page) {
  // The home page has no header at all — its body already lists every section.
  if (page.isHome) return ""
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${n.desktopOnly ? ' class="desktop-only"' : ""}${page.url?.startsWith(n.href) && n.href !== "/" ? ' aria-current="page"' : ""}>${t(esc(n.label), esc(n.es))}</a>`,
  ).join("")
  return `<header class="site-header">
  <div class="wrap">
    <a class="site-title" href="/" aria-label="Home" title="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></a>
    <nav class="site-nav">${links}</nav>
    ${langToggle(page)}
  </div>
</header>`
}

function articleMeta(page) {
  if (!page.isArticle) return ""
  const bits = []
  if (page.date) bits.push(`<time datetime="${esc(page.date)}">${dateHtml(page.date)}</time>`)
  const tags = (page.tags || [])
    .map((t) => `<a class="tag" href="/tags/${tagSlug(t)}">#${esc(t)}</a>`)
    .join("")
  return `<div class="content-meta">${bits.join('<span class="dot">·</span>')}</div>${
    tags ? `<div class="tag-list">${tags}</div>` : ""
  }`
}

export function tagSlug(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
}

function tocBlock(page) {
  const en = tocHtml(page.toc, page.lang === "es" && !page.en ? "Índice" : "Contents")
  if (!page.es?.toc) return en
  return bilingual(en, tocHtml(page.es.toc, "Índice"))
}

function tocHtml(toc, summary) {
  if (!toc || toc.length < 3) return ""
  const items = toc
    .map((h) => `<li class="toc-h${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join("")
  return `<nav aria-label="${summary}"><details class="toc" open>
    <summary>${summary}</summary>
    <ul>${items}</ul>
  </details></nav>`
}

function footer(page) {
  return `<footer class="site-footer">
  <div class="wrap">
    <p class="footer-meta">
      <a rel="license" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank">CC0 1.0</a>
      <span class="dot">·</span><a href="/index.xml">RSS</a>
    </p>
    <div class="footer-right">
      ${langToggle(page)}
      ${themeToggle}
      <details class="sand-details">
        <summary aria-label="sand garden" title="sand garden"></summary>
        <div class="sand-wrap">
          <canvas id="sand-canvas" width="200" height="150"></canvas>
          <div><button id="sand-clear" class="sand-clear">Clear</button></div>
        </div>
      </details>
    </div>
  </div>
  <script src="/scripts/sandgarden.js" defer></script>
</footer>`
}

function head(page) {
  const desc = esc(page.description || "Mateo's blog.")
  const url = SITE.baseUrl + (page.url === "/" ? "/" : page.url)
  const ogImg = SITE.baseUrl + (page.ogImage || "/static/og-default.png")
  const fullTitle = page.isHome ? SITE.title : `${esc(page.title)} · ${SITE.title}`
  const title = (s) => (page.isHome ? SITE.title : `${esc(s)} · ${SITE.title}`)
  // data-es-title doubles as the "this page has both languages" marker.
  const langAttrs = page.es ? ` data-en-title="${title(enTitle(page))}" data-es-title="${title(page.es.title)}"` : ""
  return `<!DOCTYPE html>
<html lang="${page.lang || "en"}"${langAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<meta name="author" content="${esc(SITE.author)}">
${page.unlisted ? '<meta name="robots" content="noindex, nofollow">' : ""}
<link rel="canonical" href="${url}">
<meta property="og:type" content="${page.isArticle ? "article" : "website"}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:alt" content="${esc(page.title)} preview card">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="${esc(SITE.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${esc(page.title)} preview card">
<link rel="icon" href="/static/icon.png" type="image/png">
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.title)}" href="/index.xml">
<link rel="alternate" type="text/markdown" href="${page.url === "/" ? "/index.md" : page.url + ".md"}">
<link rel="preload" href="/static/fonts/geist-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/static/fonts/geist-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossorigin="anonymous">
<link rel="stylesheet" href="/static/styles.css?v=summaries-1">
<script>
  (function () {
    try {
      var root = document.documentElement
      var t = localStorage.getItem("theme") === "dark" ? "dark" : "light"
      root.setAttribute("data-theme", t)
      // The saved language if this page has both; otherwise its original one.
      var lang = localStorage.getItem("lang")
      if (root.dataset.esTitle && (lang === "es" || lang === "en") && lang !== root.lang) {
        root.lang = lang
        document.title = lang === "es" ? root.dataset.esTitle : root.dataset.enTitle
      }
    } catch (e) {}
  })()
</script>
<script defer src="${SITE.umamiHost}/script.js" data-website-id="${SITE.umamiId}"></script>
</head>`
}

export function renderPage(page) {
  return `${head(page)}
<body>
<canvas id="bg-canvas" aria-hidden="true"></canvas>
${header(page)}
<main class="content">
  <div class="wrap${page.toc?.length >= 3 || page.es?.toc?.length >= 3 ? " with-toc" : ""}">
    ${page.isArticle ? `<h1 class="article-title">${bilingual(esc(enTitle(page)), page.es && esc(page.es.title), "span")}</h1>` : ""}
    ${articleMeta(page)}
    ${page.showFilter ? filterWidget() : ""}
    <div class="article-layout">
    <aside class="article-toc">${tocBlock(page)}</aside>
    <article class="prose${page.url === "/writings/El-reto-de-Feijoo" ? " feijoo-post" : ""}${page.showFilter ? " archive-page" : ""}">
${bilingual(translationNote(page, "en") + page.html, page.es && translationNote(page, "es") + page.es.html)}
    </article>
    </div>
  </div>
</main>
${footer(page)}
<script src="/scripts/background.js" defer></script>
<script src="/scripts/main.js?v=translation-1" defer></script>
${page.toc?.length >= 3 || page.es?.toc?.length >= 3 ? '<script src="/scripts/toc.js" defer></script>' : ""}
<script src="/scripts/popover.js" defer></script>
<script src="/scripts/footnotes.js" defer></script>
${page.name === "El reto de Feijoo" || page.name === "El reto de Feijoo (borrador)" ? '<script src="/scripts/scan-annotations.js" defer></script>' : ""}
${page.showFilter ? '<script src="/scripts/filter.js" defer></script>' : ""}
</body>
</html>`
}

function filterWidget() {
  return `<div class="archive-filter">
    <input type="search" id="archive-search" placeholder="Search links…" autocomplete="off" aria-label="Search links">
    <select id="archive-category" aria-label="Filter by category"><option value="">All categories</option></select>
    <span id="archive-count" class="archive-count"></span>
  </div>`
}

// One-line summary under a writings-list entry, in both languages when translated.
function summaryHtml(p) {
  const en = p.en ? p.en.summary : p.summary
  const es = p.es?.summary
  if (!en && !es) return ""
  const html = en && es ? t(esc(en), esc(es)) : esc(en || es)
  return `<p class="entry-summary">${html}</p>`
}

// Build the writings index list (chronological, newest first).
export function writingsIndexHtml(posts) {
  const rows = posts
    .map(
      (p) => `<li>
      <div class="entry-row">
      <a href="${p.url}">${bilingual(esc(enTitle(p)), p.es && esc(p.es.title), "span")}</a>
      <span class="entry-date">${dateHtml(p.date)}</span>
      ${(p.tags || []).map((t) => `<a class="tag" href="/tags/${tagSlug(t)}">#${esc(t)}</a>`).join("")}
      </div>
      ${summaryHtml(p)}
    </li>`,
    )
    .join("\n")
  return `<ul class="entry-list">\n${rows}\n</ul>`
}

// Tag index + per-tag pages.
export function tagsIndexHtml(tagMap) {
  const rows = [...tagMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(
      ([tag, posts]) =>
        `<li><a class="tag" href="/tags/${tagSlug(tag)}">#${esc(tag)}</a> <span class="entry-date">${posts.length}</span></li>`,
    )
    .join("\n")
  return `<ul class="tag-index">\n${rows}\n</ul>`
}

export function tagPageHtml(tag, posts) {
  return writingsIndexHtml(posts)
}

// Project cards from content/projects.yml. `inline` renders a markdown snippet.
export function projectListHtml(projects, inline, lang = "en") {
  const cards = projects.map((p) => {
    const title = (lang === "es" && p.title_es) || p.title
    const desc = (lang === "es" && p.desc_es) || p.desc || ""
    const date = p.date ? `<span class="project-date">${esc(String(p.date))}</span>` : ""
    return `<div class="project-card">
  <div class="project-title"><a href="${esc(p.url)}">${inline(title)}</a>${date}</div>
  ${desc ? `<div class="project-desc">${inline(desc)}</div>` : ""}
</div>`
  })
  return `<div class="project-list">\n${cards.join("\n")}\n</div>`
}

// Plain markdown version of the project list, for the raw .md copy of the page.
export function projectListMd(projects) {
  return projects
    .map((p) => `- [${p.title}](${p.url})${p.date ? ` (${p.date})` : ""}${p.desc ? `: ${p.desc}` : ""}`)
    .join("\n")
}

export { fmtDate, esc, t }
