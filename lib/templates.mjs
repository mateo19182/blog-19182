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
  { href: "/things-i-like", label: "other", es: "otros", desktopOnly: true },
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

const searchButton = `<button type="button" class="search-toggle" aria-label="Search / Buscar" title="Search (/)" aria-haspopup="dialog">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
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
    ${searchButton}
    ${langToggle(page)}
  </div>
</header>`
}

// Word count of each language slot, e.g. "2,345 words".
function lengthHtml(page) {
  const fmt = (n, locale, label) =>
    `<span class="meta-length">${n.toLocaleString(locale)} ${label}</span>`
  if (!page.words || page.words < 150) return "" // e.g. a post that is mostly an embedded PDF
  const en = fmt(page.words, "en-US", page.words === 1 ? "word" : "words")
  if (page.es?.words == null) return page.lang === "es" ? fmt(page.words, "es-ES", "palabras") : en
  return t(en, fmt(page.es.words, "es-ES", "palabras"))
}

function articleMeta(page) {
  if (!page.isArticle) return ""
  const bits = []
  if (page.date) bits.push(`<time datetime="${esc(page.date)}">${dateHtml(page.date)}</time>`)
  if (page.updated && page.updated > page.date) {
    bits.push(`<span class="meta-updated">${t("updated", "actualizado")} <time datetime="${esc(page.updated)}">${dateHtml(page.updated)}</time></span>`)
  }
  const length = lengthHtml(page)
  if (length) bits.push(length)
  const tags = (page.tags || [])
    .map((t) => `<a class="tag" href="/tags/${tagSlug(t)}">#${esc(t)}</a>`)
    .join("")
  return `<div class="content-meta">${bits.join('<span class="dot">·</span><wbr>')}</div>${
    tags ? `<div class="tag-list">${tags}</div>` : ""
  }${seriesBanner(page)}`
}

function postTitle(p) {
  return bilingual(esc(enTitle(p)), p.es && esc(p.es.title), "span")
}

// "Part 2 of 3 in Favourite music", with every part listed.
function seriesBanner(page) {
  const s = page.seriesInfo
  if (!s) return ""
  const n = s.posts.length, i = s.index + 1
  const name = esc(s.name), nameEs = esc(s.nameEs || s.name)
  const items = s.posts
    .map((p, j) => j === s.index
      ? `<li aria-current="page">${postTitle(p)}</li>`
      : `<li><a href="${p.url}">${postTitle(p)}</a></li>`)
    .join("")
  return `<nav class="series" aria-label="${name}">
      <p class="series-label">${t(`Part ${i} of ${n} in <em>${name}</em>`, `Parte ${i} de ${n} de <em>${nameEs}</em>`)}</p>
      <ol>${items}</ol>
    </nav>`
}

// After the article: previous/next in the series, then the posts linking here.
function articleEnd(page) {
  if (!page.isArticle) return ""
  const s = page.seriesInfo
  const prev = s?.posts[s.index - 1], next = s?.posts[s.index + 1]
  const cell = (p, cls, en, es) => p
    ? `<a class="${cls}" href="${p.url}"><span class="post-nav-label">${t(en, es)}</span>${postTitle(p)}</a>`
    : ""
  const nav = prev || next
    ? `<nav class="post-nav" aria-label="${esc(s.name)}: ${page.lang === "es" ? "anterior y siguiente" : "previous and next"}">${cell(prev, "post-nav-prev", "← Previous", "← Anterior")}${cell(next, "post-nav-next", "Next →", "Siguiente →")}</nav>`
    : ""
  const links = (page.backlinks || []).map((p) => `<a href="${p.url}">${postTitle(p)}</a>`).join(", ")
  const back = links ? `<p class="backlinks">${t("Linked from:", "Enlazado desde:")} ${links}</p>` : ""
  return nav || back ? `<footer class="article-end">${nav}${back}</footer>` : ""
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
      <span class="dot">·</span><span class="subscription-links">${t("Subscribe:", "Suscribirse:")}
      <a href="/index.xml">RSS</a><span class="dot">·</span><a href="/subscribe">Email</a></span>
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
<link rel="stylesheet" href="/static/styles.css?v=fonts-6">
<script>
  (function () {
    try {
      var root = document.documentElement
      var t = localStorage.getItem("theme") === "dark" ? "dark" : "light"
      root.setAttribute("data-theme", t)
      // ?lang= (from search results), else the saved language if this page has both;
      // otherwise its original one.
      var q = /[?&]lang=(en|es)(?:&|$)/.exec(location.search)
      if (q) history.replaceState(null, "", location.pathname + location.hash)
      var lang = q ? q[1] : localStorage.getItem("lang")
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
  const body = page.html + (page.es?.html || "")
  return `${head(page)}
<body${page.isHome ? ' class="home"' : page.isArticle ? ' class="article-page"' : ""}>
<canvas id="bg-canvas" aria-hidden="true"></canvas>
${page.isArticle ? '<div class="reading-progress" aria-hidden="true"></div>' : ""}
${header(page)}
<main class="content">
  <div class="wrap">
    ${page.showFilter ? filterWidget() : ""}
    <div class="article-layout">
    ${page.isArticle ? `<header class="article-header">
    <h1 class="article-title">${bilingual(esc(enTitle(page)), page.es && esc(page.es.title), "span")}</h1>
    ${articleMeta(page)}
    </header>` : ""}
    <aside class="article-toc">${tocBlock(page)}</aside>
    <article class="prose${page.url === "/writings/El-reto-de-Feijoo" ? " feijoo-post" : ""}${page.showFilter ? " archive-page" : ""}">
${bilingual(translationNote(page, "en") + page.html, page.es?.html != null ? translationNote(page, "es") + page.es.html : null)}
    </article>
    ${articleEnd(page)}
    </div>
    ${page.url === "/subscribe" ? newsletter() : ""}
  </div>
</main>
${footer(page)}
<script src="/scripts/background.js" defer></script>
<script src="/scripts/main.js?v=reading-2" defer></script>
<script src="/scripts/search.js" defer></script>
${page.url === "/subscribe" ? '<script src="/scripts/newsletter.js" defer></script>' : ""}
${page.isArticle ? '<script src="/scripts/progress.js" defer></script>' : ""}
${page.toc?.length >= 3 || page.es?.toc?.length >= 3 ? '<script src="/scripts/toc.js" defer></script>' : ""}
${page.isArticle ? '<script src="/scripts/notes.js" defer></script>' : ""}
${page.name === "El reto de Feijoo" || page.name === "El reto de Feijoo (borrador)" ? '<script src="/scripts/scan-annotations.js" defer></script>' : ""}
${page.showFilter ? '<script src="/scripts/filter.js" defer></script>' : ""}
${page.name === "projects" ? '<script src="/scripts/projects.js" defer></script>' : ""}
${/class="code-block/.test(body) ? '<script src="/scripts/code.js" defer></script>' : ""}
${/<img(?![^>]*class="favicon")/.test(body) ? '<script src="/scripts/lightbox.js?v=2" defer></script>' : ""}
${body.includes('class="header-anchor"') ? '<script src="/scripts/section-links.js" defer></script>' : ""}
</body>
</html>`
}

function newsletter() {
  const list = (name, title, note, checked = false) => `<label class="newsletter-list"><input type="checkbox" name="${name}" value="yes"${checked ? " checked" : ""}><span><span class="newsletter-list-title">${title}</span><span class="newsletter-list-note">${note}</span></span></label>`
  return `<section class="newsletter" aria-label="Newsletter">
  <form action="/api/subscribe" method="post">
    <fieldset class="newsletter-lists">
      <legend class="sr-only">${t("Lists", "Listas")}</legend>
      ${list("posts", t("Blog posts", "Posts del blog"), t("New writings, when they come out.", "Escritos nuevos, cuando salen."), true)}
      ${list("updates", t("Quarterly life updates", "Actualizaciones trimestrales"), t("Four emails a year on what I'm doing.", "Cuatro correos al año sobre lo que estoy haciendo."))}
      ${list("killswitch", t("If I die", "Si me muero"), t(`One email. Powered by <a href="https://github.com/mateo19182/posthumail">posthumail</a>.`, `Un correo. Funciona con <a href="https://github.com/mateo19182/posthumail">posthumail</a>.`))}
    </fieldset>
    <div class="newsletter-row">
      <input id="newsletter-email" name="email" type="email" aria-label="Email" placeholder="you@example.com" autocomplete="email" maxlength="254" required>
      <label class="newsletter-trap" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <button type="submit">${t("Subscribe", "Suscribirme")}</button>
    </div>
    <p class="newsletter-note">${t("Unsubscribe anytime.", "Puedes darte de baja cuando quieras.")}</p>
    <p role="status" aria-live="polite"></p>
  </form>
</section>`
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
      ${lengthHtml(p) ? `<span class="entry-length">${lengthHtml(p)}</span>` : ""}
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

// Project tags, in filter order, with their English and Spanish labels.
const PROJECT_TAGS = {
  "public-data": ["public data", "datos públicos"],
  research: ["research", "investigación"],
  llm: ["llm", "llm"],
  ml: ["ml", "ml"],
  "self-hosted": ["self-hosted", "autoalojado"],
  tools: ["tools", "herramientas"],
  "art-music": ["art & music", "arte y música"],
  competitions: ["competitions", "competiciones"],
}

export function checkProjectTags(projects) {
  const unknown = [...new Set(projects.flatMap((p) => p.tags || []))].filter((t) => !PROJECT_TAGS[t])
  if (unknown.length) throw new Error(`projects.yml: unknown tags ${unknown.join(", ")} (add them to PROJECT_TAGS)`)
}

// Projects from content/projects.yml, newest first under year headings, with tag
// filter chips (scripts/projects.js). `highlight: true` entries get a frame, and
// `image:` a thumbnail from assets/projects/. `inline` renders a markdown snippet.
export function projectListHtml(projects, inline, lang = "en") {
  const es = lang === "es"
  const label = (tag) => esc(PROJECT_TAGS[tag][es ? 1 : 0])
  const counts = new Map()
  for (const p of projects) for (const tag of p.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1)
  const chip = (tag, text, n) =>
    `<a class="tag project-chip" href="/projects${tag ? `?tag=${tag}` : ""}" data-tag="${tag}"${tag ? "" : ' aria-current="true"'}>${text} <span>${n}</span></a>`
  const chips = [chip("", es ? "todos" : "all", projects.length)]
  for (const tag of Object.keys(PROJECT_TAGS)) if (counts.has(tag)) chips.push(chip(tag, label(tag), counts.get(tag)))

  const month = (date) => {
    const [y, m] = String(date).split("-")
    return m ? new Date(Date.UTC(+y, +m - 1)).toLocaleString(es ? "es-ES" : "en-US", { month: "short", timeZone: "UTC" }).replace(".", "") : ""
  }
  const rows = []
  let year = null
  for (const p of projects) {
    const y = p.date ? String(p.date).slice(0, 4) : es ? "antes" : "earlier"
    if (y !== year) rows.push(`<h2 class="project-year">${(year = y)}</h2>`)
    const title = (es && p.title_es) || p.title
    const desc = (es && p.desc_es) || p.desc || ""
    const titleHtml = p.url ? `<a href="${esc(p.url)}">${inline(title)}</a>` : inline(title)
    const date = p.date ? `<span class="project-date">${month(p.date)}</span>` : ""
    const tags = (p.tags || []).map((tag) => `<a class="tag" href="/projects?tag=${tag}" data-tag="${tag}">#${label(tag)}</a>`).join(" ")
    const thumb = p.image
        ? `<a class="project-thumb" href="${esc(p.url || "")}" tabindex="-1" aria-hidden="true"><img src="/static/projects/${esc(p.image)}" alt="" loading="lazy" width="640" height="400"></a>`
        : ""
    rows.push(`<article class="project${p.highlight ? " project-highlight" : ""}${p.image ? " project-has-thumb" : ""}" data-tags="${(p.tags || []).join(" ")}">
  ${thumb}<div class="project-body">
  <div class="project-title">${titleHtml}${date}</div>
  ${desc ? `<div class="project-desc">${inline(desc)}</div>` : ""}
  ${tags ? `<div class="project-tags">${tags}</div>` : ""}
  </div>
</article>`)
  }
  return `<nav class="project-filter" aria-label="${es ? "Filtrar por etiqueta" : "Filter by tag"}">${chips.join(" ")}</nav>
<div class="project-list">\n${rows.join("\n")}\n</div>`
}

// Plain markdown version of the project list, for the raw .md copy of the page.
export function projectListMd(projects) {
  return projects
    .map((p) => `- ${p.url ? `[${p.title}](${p.url})` : p.title}${p.date ? ` (${p.date})` : ""}${p.desc ? `: ${p.desc}` : ""}${p.tags?.length ? ` [${p.tags.join(", ")}]` : ""}`)
    .join("\n")
}

export { fmtDate, esc, t }
