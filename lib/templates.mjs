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
  { href: "/things-i-like", label: "things i like", es: "cosas que me gustan" },
]

function esc(s = "") {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
}

// Both language variants of a snippet (already-escaped HTML). CSS shows the one
// matching <html lang>, which the pre-paint script in <head> sets.
function t(en, es) {
  return `<span class="i18n" lang="en">${en}</span><span class="i18n" lang="es">${es}</span>`
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
  const label = page.es ? "Switch language / Cambiar idioma" : "Only available in English"
  return `<button id="lang-toggle" class="lang-toggle" aria-label="${label}" title="${label}"${page.es ? "" : " disabled"}><span lang="en">EN</span><span lang="es">ES</span></button>`
}

function header(page) {
  // The home page has no header at all — its body already lists every section.
  if (page.isHome) return ""
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}"${page.url?.startsWith(n.href) && n.href !== "/" ? ' aria-current="page"' : ""}>${t(esc(n.label), esc(n.es))}</a>`,
  ).join("")
  return `<header class="site-header">
  <div class="wrap">
    <a class="site-title" href="/" aria-label="Home" title="Home"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></a>
    <nav class="site-nav">${links}</nav>
  </div>
</header>`
}

function articleMeta(page) {
  if (!page.isArticle) return ""
  const bits = []
  if (page.date) bits.push(`<time datetime="${esc(page.date)}">${dateHtml(page.date)}</time>`)
  if (page.readingTime) {
    bits.push(`<span>${t(`${page.readingTime} min read`, `${page.es?.readingTime ?? page.readingTime} min de lectura`)}</span>`)
  }
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
  const en = tocHtml(page.toc, "Table of Contents")
  if (!page.es?.toc) return en
  return bilingual(en, tocHtml(page.es.toc, "Índice"))
}

function tocHtml(toc, summary) {
  if (!toc || toc.length < 3) return ""
  const items = toc
    .map((h) => `<li class="toc-h${h.level}"><a href="#${h.id}">${esc(h.text)}</a></li>`)
    .join("")
  return `<details class="toc" open>
    <summary>${summary}</summary>
    <ul>${items}</ul>
  </details>`
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
  const esTitle = page.es && (page.isHome ? SITE.title : `${esc(page.es.title)} · ${SITE.title}`)
  // data-es-title doubles as the "this page has a Spanish version" marker.
  const langAttrs = page.es ? ` data-en-title="${fullTitle}" data-es-title="${esTitle}"` : ""
  return `<!DOCTYPE html>
<html lang="en"${langAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${desc}">
<meta name="author" content="${esc(SITE.author)}">
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
<link rel="stylesheet" href="/static/styles.css">
<script>
  (function () {
    try {
      var root = document.documentElement
      var t = localStorage.getItem("theme") || "light"
      root.setAttribute("data-theme", t)
      // Spanish only if chosen and this page has a translation; else English.
      if (localStorage.getItem("lang") === "es" && root.dataset.esTitle) {
        root.lang = "es"
        document.title = root.dataset.esTitle
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
  <div class="wrap">
    ${page.isArticle ? `<h1 class="article-title">${bilingual(esc(page.title), page.es && esc(page.es.title), "span")}</h1>` : ""}
    ${articleMeta(page)}
    ${page.showFilter ? filterWidget() : ""}
    ${tocBlock(page)}
    <article class="prose${page.showFilter ? " archive-page" : ""}">
${bilingual(page.html, page.es?.html)}
    </article>
  </div>
</main>
${footer(page)}
<script src="/scripts/background.js" defer></script>
<script src="/scripts/main.js" defer></script>
<script src="/scripts/popover.js" defer></script>
<script src="/scripts/footnotes.js" defer></script>
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

// Build the writings index list (chronological, newest first).
export function writingsIndexHtml(posts) {
  const rows = posts
    .map(
      (p) => `<li>
      <a href="${p.url}">${bilingual(esc(p.title), p.es && esc(p.es.title), "span")}</a>
      <span class="entry-date">${dateHtml(p.date)}</span>
      ${(p.tags || []).filter((t) => t !== "writing").map((t) => `<a class="tag" href="/tags/${tagSlug(t)}">#${esc(t)}</a>`).join("")}
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

export { fmtDate, esc, t }
