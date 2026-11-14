// Renders a file being edited the way build.mjs would, with the same markdown
// pipeline and page templates. Differences from the site: code isn't
// syntax-highlighted and "Linked from" isn't computed.
import { makeRenderer } from "../lib/markdown.mjs"
import { renderPage } from "../lib/templates.mjs"
import { faviconLookup } from "../lib/favicons.mjs"
import { cleanLinks } from "../lib/links.mjs"
import { countWords, fileKind, originalPath, parseProjects, splitFrontMatter } from "../lib/content.mjs"
import { pageMeta, translationSlots, soundtrackInfo, buildSeries, makeResolver, renderBody, visibleProjects, unlinkDrafts } from "../lib/page.mjs"
import { updatesPage } from "../lib/updates.mjs"

const parse = (src) => {
  const { data, body } = splitFrontMatter(cleanLinks(src))
  return { data, content: body }
}

export function makePreview(index) {
  const known = index.pages.map((p) => ({ ...p, es: p.esTitle ? { title: p.esTitle } : null }))
  const md = makeRenderer(makeResolver(known, index.dataFiles), { favicon: faviconLookup(index.favicons).lookup })

  // Other writings in the series, as the build sees them.
  function withSeries(page) {
    if (!page.isArticle || !page.series) return
    const others = index.pages
      .filter((p) => p.section === "writings" && p.series === page.series && p.name !== page.name && !p.draft && !p.unlisted)
      .map((p) => ({
        ...p,
        en: p.enTitle ? { title: p.enTitle } : null,
        es: p.esTitle ? { title: p.esTitle } : null,
      }))
    buildSeries([...others, page])
  }

  // `get(path)` returns a loaded file's current text, or undefined.
  return function render(path, get) {
    const kind = fileKind(path)
    let page, projects = []
    if (kind === "update" || kind === "update-translation") {
      const orig = parse(get(originalPath(path)) ?? "")
      const enSrc = get(originalPath(path).replace(/\.md$/, ".en.md"))
      const en = enSrc != null && parse(enSrc)
      page = updatesPage([{
        title: orig.data.title || "", date: String(orig.data.date || ""), content: orig.content,
        ...(en && { en: { title: en.data.title || orig.data.title, content: en.content } }),
      }])
    } else {
      const projectsMode = kind === "projects"
      const origPath = projectsMode ? "content/projects.md" : originalPath(path)
      const orig = parse(get(origPath) ?? "")
      const name = origPath.split("/").pop().replace(/\.md$/, "")
      const section = origPath.startsWith("content/writings/") ? "writings" : null
      const siblingSrc = get(origPath.replace(/\.md$/, orig.data.lang === "es" ? ".en.md" : ".es.md"))
      page = {
        ...pageMeta(name, section, orig.data, orig.content),
        ...translationSlots(name, orig.data, orig.content, siblingSrc != null ? parse(siblingSrc) : null),
      }
      const s = orig.data.soundtrack
      page.soundtrack = s?.file && index.soundtracks[s.file] ? soundtrackInfo(s, index.soundtracks[s.file]) : null
      if (name === "projects") {
        const src = get("content/projects.yml")
        const drafts = index.pages.filter((p) => p.draft).map((p) => p.url)
        try { projects = visibleProjects(parseProjects(src ?? "") || [], drafts) } catch { projects = [] }
      }
    }
    page.words = countWords(page.en ? page.en.rawContent : page.rawContent)
    if (page.es) page.es.words = countWords(page.es.rawContent)
    withSeries(page)
    let rendered
    try {
      const { html, toc, es } = renderBody(md, page, projects)
      // as the site will show it, unless this page is a draft itself
      const drafts = new Set(page.draft ? [] : index.pages.filter((p) => p.draft).map((p) => p.url))
      rendered = { ...page, html: unlinkDrafts(html, drafts), toc, es: es && { ...es, html: unlinkDrafts(es.html, drafts) }, backlinks: [] }
    } catch (e) {
      rendered = { ...page, html: `<pre>${String(e.message)}</pre>`, toc: [], es: null }
    }
    return { html: renderPage(rendered), words: { en: page.words, es: page.es?.words } }
  }
}
