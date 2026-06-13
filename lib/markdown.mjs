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

function highlight(code, lang) {
  const loaded = highlighter?.getLoadedLanguages() ?? []
  const useLang = loaded.includes(lang) ? lang : "text"
  try {
    return highlighter.codeToHtml(code, {
      lang: useLang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    })
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
}

// Build a markdown-it instance. `resolve(target)` returns {href, exists} for a
// wikilink target, or null if it can't be resolved.
export function makeRenderer(resolve) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
    highlight,
  })

  md.use(footnote)
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

  return {
    render(src) {
      return md.render(preprocessWikilinks(src, resolve))
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

  return src.replace(/\[\[([^\]]+)\]\]/g, (_m, inner) => {
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
