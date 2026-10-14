import MarkdownIt from "markdown-it"
import footnote from "markdown-it-footnote"
import anchor from "markdown-it-anchor"
import texmath from "markdown-it-texmath"
import katex from "katex"
import { createHighlighter } from "shiki"
import { linkKey } from "./slug.mjs"

// Languages preloaded for syntax highlighting; unknown langs fall back to text.
const LANGS = [
  "text", "bash", "shell", "js", "javascript", "ts", "typescript", "json",
  "html", "css", "scss", "python", "py", "rust", "c", "cpp", "go", "java",
  "yaml", "toml", "markdown", "md", "sql", "diff", "nix", "dockerfile",
]

let highlighter = null

export async function initHighlighter() {
  highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: LANGS,
  })
}

function highlight(code, lang, lines = new Set()) {
  const loaded = highlighter?.getLoadedLanguages() ?? []
  const useLang = loaded.includes(lang) ? lang : "text"
  try {
    return highlighter.codeToHtml(code, {
      lang: useLang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [{ line(node, n) { if (lines.has(n)) this.addClassToHast(node, "highlighted") } }],
    })
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
}

// Fence info string: ```lang title="file.ext" {1,3-5}
function parseFenceInfo(info = "") {
  const lang = (info.match(/^\s*([^\s{]+)/) || [])[1] || ""
  const t = info.match(/\btitle=(?:"([^"]*)"|'([^']*)'|(\S+))/)
  const title = t ? t[1] ?? t[2] ?? t[3] : ""
  const lines = new Set()
  const ranges = (info.match(/\{([\d,\s-]+)\}/) || [])[1] || ""
  for (const part of ranges.split(",")) {
    const [a, b = a] = part.trim().split("-").map(Number)
    if (!a) continue
    for (let n = a; n <= Math.min(b, a + 1000); n++) lines.add(n)
  }
  return { lang: lang.toLowerCase(), title, lines }
}

const PLAIN = new Set(["", "text", "txt", "plain", "plaintext"])

// A fenced block: optional title bar (file name, language) above the
// highlighted <pre>. scripts/code.js adds the copy button.
function codeBlock(code, info) {
  const { lang, title, lines } = parseFenceInfo(info)
  const pre = highlight(code.replace(/\n$/, ""), lang, lines)
  const label = PLAIN.has(lang) ? "" : `<span class="code-lang">${escapeHtml(lang)}</span>`
  const head = title ? `<div class="code-head"><span class="code-title">${escapeHtml(title)}</span>${label}</div>` : ""
  return `<div class="code-block${title ? " has-title" : ""}"${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}>${head}${pre}</div>\n`
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
}

// Build a markdown-it instance. `resolve(target)` returns {href, exists} for a
// wikilink target, or null if it can't be resolved. `favicon(href)` returns the
// cached icon URL for an external link, or null.
export function makeRenderer(resolve, { favicon = () => null } = {}) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  })
  md.renderer.rules.fence = (tokens, idx) => codeBlock(tokens[idx].content, tokens[idx].info)

  md.use(footnote)
  // Plain superscript numbers (no brackets, no ":1" on repeated refs).
  md.renderer.rules.footnote_caption = (tokens, idx) => String(tokens[idx].meta.id + 1)
  md.use(anchor, {
    slugify: (s) =>
      s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
    permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
  })
  md.use(texmath, {
    engine: katex,
    delimiters: ["dollars", "brackets"],
    katexOptions: { throwOnError: false },
  })

  // External links open in a new tab; mark them for styling.
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet("href") || ""
    if (/^https?:\/\//.test(href)) {
      tokens[idx].attrSet("target", "_blank")
      tokens[idx].attrSet("rel", "noopener noreferrer")
      tokens[idx].attrJoin("class", "external")
    }
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  // Lazy-load images and decode off the main thread.
  const defaultImage =
    md.renderer.rules.image ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet("loading", "lazy")
    tokens[idx].attrSet("decoding", "async")
    return defaultImage(tokens, idx, options, env, self)
  }

  // Tables scroll inside a wrapper, which can grow wider than the text column.
  md.renderer.rules.table_open = () => '<div class="table-wrap">\n<table>\n'
  md.renderer.rules.table_close = () => "</table>\n</div>\n"

  // Mark paragraphs that hold only an image (optionally linked) so they can
  // grow wider than the text, and the article's first text paragraph for the
  // drop cap (`env.lede`; skipped inside <details> sections).
  md.core.ruler.push("block_classes", (state) => {
    const { tokens, env } = state
    let htmlDepth = 0 // paragraphs inside raw HTML wrappers (e.g. a TL;DR box) aren't the lede
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "html_block") {
        const html = tokens[i].content
        htmlDepth += (html.match(/<(div|details|section|aside|figure|blockquote)\b/g) || []).length
        htmlDepth -= (html.match(/<\/(div|details|section|aside|figure|blockquote)>/g) || []).length
      }
      if (tokens[i].type !== "paragraph_open" || tokens[i].level !== 0) continue
      const inline = tokens[i + 1]
      const kids = (inline.children || []).filter((t) => !(t.type === "text" && !t.content.trim()) && t.type !== "softbreak")
      const media = kids.length > 0 && kids.every((t) => ["image", "link_open", "link_close"].includes(t.type))
      // ![alt](src "wide") opts an image into the full available width.
      for (const img of kids.filter((t) => t.type === "image" && t.attrGet("title") === "wide")) {
        img.attrs = img.attrs.filter(([name]) => name !== "title")
        tokens[i].attrJoin("class", "wide")
      }
      if (media) tokens[i].attrJoin("class", "media")
      // justification would stretch the spaces inside long inline code
      if (kids.some((t) => t.type === "code_inline" && t.content.length > 16 && t.content.includes(" "))) tokens[i].attrJoin("class", "ragged")
      else if (env.lede && !env.ledeDone && !env.inDetails && htmlDepth <= 0 && /^[\p{L}\p{N}"“«¿¡'‘]/u.test(inline.content)) {
        tokens[i].attrJoin("class", "lede")
        env.ledeDone = true
      }
    }
  })

  // A small favicon after each external link's text (the ↗ marker stays for
  // hosts without a cached icon). The last word and the icon share a no-wrap
  // span so the icon never starts a line by itself. `env.noFavicons` skips it.
  md.core.ruler.push("link_favicons", (state) => {
    if (state.env.noFavicons) return
    const make = (type, content) => Object.assign(new state.Token(type, "", 0), { content })
    for (const block of state.tokens) {
      const kids = block.type === "inline" && block.children
      if (!kids) continue
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].type !== "link_open") continue
        const href = kids[i].attrGet("href") || ""
        const close = kids.findIndex((t, j) => j > i && t.type === "link_close")
        if (close < 0) continue
        // Links whose text is the address itself (URLs, emails) may break
        // anywhere, so a justified line doesn't stretch to make room for them.
        const text = kids.slice(i + 1, close).map((t) => t.content).join("")
        const bare = /^(https?:\/\/|www\.|mailto:)/.test(text) || (/^mailto:/.test(href) && /^\S+@\S+$/.test(text))
        if (bare) kids[i].attrJoin("class", "bare-url")
        if (!/^https?:\/\//.test(href)) continue
        const icon = kids.slice(i, close).some((t) => t.type === "image") ? null : favicon(href)
        if (!icon) continue
        kids[i].attrJoin("class", "has-favicon")
        const img = `<img class="favicon" src="${escapeHtml(icon)}" alt="" width="16" height="16" loading="lazy" decoding="async">`
        const last = kids[close - 1]
        const word = !bare && last.type === "text" ? last.content.match(/^([\s\S]*?)(\S{1,24})$/) : null
        let tail
        if (word) {
          last.content = word[1]
          tail = [make("html_inline", '<span class="link-tail">'), make("text", word[2]), make("html_inline", img + "</span>")]
        } else if (last.type === "code_inline" && last.content.length <= 24) {
          kids.splice(close - 1, 1)
          tail = [make("html_inline", '<span class="link-tail">'), last, make("html_inline", img + "</span>")]
        } else tail = [make("html_inline", img)]
        const at = kids.findIndex((t, j) => j > i && t.type === "link_close")
        kids.splice(at, 0, ...tail)
        i = at + tail.length
      }
    }
  })

  return {
    renderInline(src) {
      return md.renderInline(preprocessWikilinks(src, resolve))
    },
    // `env.docId` namespaces footnote ids so two languages can share a page.
    render(src, env = {}) {
      const linked = preprocessWikilinks(src, resolve)
      let withDetails = linked
      const opening = /<details markdown="1">/g
      let match
      const starts = []
      while ((match = opening.exec(linked))) starts.push(match.index)
      for (const start of starts.reverse()) {
        const tags = /<details\b[^>]*>|<\/details>/g
        tags.lastIndex = start
        let depth = 0, end = -1, tag
        while ((tag = tags.exec(withDetails))) {
          depth += tag[0].startsWith("</") ? -1 : 1
          if (depth === 0) { end = tags.lastIndex; break }
        }
        if (end < 0) continue
        const section = withDetails.slice(start, end)
        const parts = section.match(/^<details markdown="1">\s*<summary>([\s\S]*?)<\/summary>\s*([\s\S]*?)<\/details>$/)
        if (!parts) continue
        env.inDetails = true
        const rendered = `<details><summary>${parts[1]}</summary>\n${md.render(parts[2], env)}\n</details>`
        env.inDetails = false
        withDetails = withDetails.slice(0, start) + rendered + withDetails.slice(end)
      }
      const html = md.render(withDetails, env)
      if (!env.imageCaptions) return html
      // A standalone Markdown image followed immediately by caption text.
      // Keep the image description as alt text and preserve caption links.
      return html.replace(/<p( class="wide")?>(<img\b[^>]*>)\n([\s\S]*?)<\/p>/g, (match, wide, img, caption) => {
        if (/<(?:p|figure)\b|<img\b(?![^>]*class="favicon")/.test(caption)) return match
        return `<figure class="post-figure${wide ? " wide" : ""}">${img}<figcaption>${caption}</figcaption></figure>`
      })
    },
    renderInline(src) {
      return md.renderInline(preprocessWikilinks(src, resolve))
    },
  }
}

// Convert Obsidian wikilinks into standard markdown before parsing.
//   [[target]]            -> [target](href)
//   [[target|alias]]      -> [alias](href)
//   [[target#heading]]    -> link to anchor
//   ![[image]]            -> image embed (dropped if unresolved)
function preprocessWikilinks(src, resolve) {
  // image embeds first
  src = src.replace(/!\[\[([^\]]+)\]\]/g, (_m, inner) => {
    const target = inner.split("|")[0].trim()
    const r = resolve(target)
    if (r && r.exists) return `![](${r.href})`
    return "" // drop broken/missing embeds
  })

  // `[[23]](url)` is a markdown link whose text is "[23]", not a wikilink
  return src.replace(/\[\[([^\]]+)\]\](?!\()/g, (_m, inner) => {
    const [rawTarget, alias] = inner.split("|").map((s) => s.trim())
    const [target, heading] = rawTarget.split("#")
    const r = resolve(target.trim())
    const label = alias || rawTarget
    if (!r) return label
    const href = heading ? `${r.href}#${slugHeading(heading)}` : r.href
    return `[${label}](${href})`
  })
}

function slugHeading(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

export { linkKey }
