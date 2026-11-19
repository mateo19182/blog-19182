// Content conventions shared by the build, the web editor and its API, so the
// editor refuses what would break the build or AGENTS.md rules.
import * as yaml from "js-yaml"
import { PROJECT_TAGS } from "./templates.mjs"

export function normalizeDate(d) {
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

// Words a reader reads: prose, not code, maths, URLs or markup.
export function countWords(md) {
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

// ---- files the editor may touch ---------------------------------------------
// Machine-maintained files stay out: the link archive is rewritten weekly.
export const READ_ONLY = {
  "content/link-archive.md": "La lista de enlaces se regenera cada semana.",
}

const TEXT_PATH = /^content\/(?:[^/]+\.md|writings\/[^/]+\.md|updates\/[^/]+\.md|projects\.yml)$/
const IMAGE_PATH = /^(?:content\/data\/(?:[\w.-]+\/)?[^/]+|assets\/projects\/[^/]+)\.(?:webp|png|jpe?g|gif|svg|avif)$/i
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

// Why a path can't be written, or null.
export function pathError(p) {
  if (typeof p !== "string" || p.includes("..") || p.includes("\\") || /[\0-\x1f]/.test(p)) return "ruta no válida"
  if (READ_ONLY[p]) return READ_ONLY[p]
  if (TEXT_PATH.test(p) || IMAGE_PATH.test(p)) return null
  return "el editor no puede escribir en esta ruta"
}
export const isImagePath = (p) => IMAGE_PATH.test(p)

// ---- file kinds ---------------------------------------------------------------
// writing | translation | page | update | update-translation | projects
export function fileKind(p) {
  if (p === "content/projects.yml") return "projects"
  const tr = /\.(es|en)\.md$/.test(p)
  if (p.startsWith("content/writings/")) return tr ? "translation" : "writing"
  if (p.startsWith("content/updates/")) return p.endsWith(".en.md") ? "update-translation" : "update"
  return tr ? "translation" : "page"
}

// The sibling translation path of an original, given its language.
export function translationPath(p, lang) {
  return p.replace(/\.md$/, lang === "es" ? ".en.md" : ".es.md")
}
export const originalPath = (p) => p.replace(/\.(es|en)\.md$/, ".md")

// A file name for a new post title: what Obsidian would accept.
export function fileNameFor(title) {
  return String(title).replace(/[\\/:*?"<>|#^[\]]/g, "").replace(/\s+/g, " ").trim()
}

// ---- front matter ---------------------------------------------------------------
// Dates stay strings (CORE schema) so they round-trip as written.
export function splitFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)
  if (!m) return { yaml: "", data: {}, body: src }
  return { yaml: m[1], data: yaml.load(m[1], { schema: yaml.CORE_SCHEMA }) || {}, body: src.slice(m[0].length) }
}

const KEY_ORDER = ["title", "summary", "description", "date", "updated", "lang", "tags", "series", "series_es", "series_order", "unlisted", "draft", "soundtrack"]

// Serialize front matter, dropping empty fields and keeping a stable key order.
export function dumpFrontMatter(data) {
  const clean = {}
  const keys = [...KEY_ORDER.filter((k) => k in data), ...Object.keys(data).filter((k) => !KEY_ORDER.includes(k))]
  for (const k of keys) {
    const v = data[k]
    if (v === "" || v == null || v === false || (Array.isArray(v) && !v.length)) continue
    clean[k] = v
  }
  return yaml.dump(clean, { schema: yaml.CORE_SCHEMA, lineWidth: -1 })
}

export function joinFrontMatter(data, body) {
  const fm = dumpFrontMatter(data)
  return fm.trim() ? `---\n${fm}---\n\n${body.replace(/^\n+/, "")}` : body
}

// ---- validation --------------------------------------------------------------------
const DAY = /^\d{4}-\d{2}-\d{2}$/

// Problems that would break the build or the conventions in AGENTS.md.
// `ctx.soundtracks` lists the files in content/data/soundtrack, when known.
export function validateFile(path, src, ctx = {}) {
  const kind = fileKind(path)
  const errors = []
  if (kind === "projects") return validateProjects(src)
  let data
  try { ({ data } = splitFrontMatter(src)) } catch (e) { return [`front matter: ${e.message.split("\n")[0]}`] }
  if (typeof data !== "object" || Array.isArray(data)) return ["front matter: debe ser un mapa clave: valor"]
  if (kind === "writing") {
    if (!data.title) errors.push("falta title")
    if (!data.summary) errors.push("falta summary (una línea para la lista de escritos)")
    else if (String(data.summary).includes("\n")) errors.push("summary debe ser una sola línea")
    const tags = Array.isArray(data.tags) ? data.tags.filter(Boolean) : []
    if (tags.length < 1 || tags.length > 3) errors.push("pon entre 1 y 3 tags")
    if (tags.includes("writing")) errors.push("no uses el tag genérico writing")
    if (!DAY.test(normalizeDate(data.date))) errors.push("date debe ser AAAA-MM-DD")
    if (data.updated && !DAY.test(normalizeDate(data.updated))) errors.push("updated debe ser AAAA-MM-DD")
    if (data.series_es && !data.series) errors.push("series_es sin series")
    if (data.series_order != null && !Number.isFinite(Number(data.series_order))) errors.push("series_order debe ser un número")
    if (data.lang && data.lang !== "es" && data.lang !== "en") errors.push("lang debe ser es o en")
    const s = data.soundtrack
    if (s) {
      if (!s.artist || !s.title || !s.file) errors.push("soundtrack necesita artist, title y file")
      else if (ctx.soundtracks && !ctx.soundtracks.includes(s.file)) errors.push(`no existe content/data/soundtrack/${s.file}`)
    }
  } else if (kind === "translation") {
    if (!data.title) errors.push("falta title")
    const extra = Object.keys(data).filter((k) => k !== "title" && k !== "summary")
    if (extra.length && path.startsWith("content/writings/")) errors.push(`una traducción solo lleva title y summary (sobra: ${extra.join(", ")})`)
  } else if (kind === "update") {
    if (!data.title) errors.push("falta title")
    if (!DAY.test(normalizeDate(data.date))) errors.push("date debe ser AAAA-MM-DD")
  }
  return errors
}

export function parseProjects(src) {
  return yaml.load(src, { schema: yaml.CORE_SCHEMA }) || []
}

function validateProjects(src) {
  let list
  try { list = parseProjects(src) } catch (e) { return [`YAML: ${e.message.split("\n")[0]}`] }
  if (!Array.isArray(list)) return ["projects.yml debe ser una lista"]
  const errors = []
  list.forEach((p, i) => {
    const name = p?.title || `#${i + 1}`
    if (!p || typeof p !== "object") return errors.push(`${name}: entrada no válida`)
    if (!p.title) errors.push(`${name}: falta title`)
    const tags = p.tags || []
    if (!Array.isArray(tags)) return errors.push(`${name}: tags debe ser una lista`)
    if (!p.hidden && (tags.length < 1 || tags.length > 3)) errors.push(`${name}: pon entre 1 y 3 tags`)
    const unknown = tags.filter((t) => !PROJECT_TAGS[t])
    if (unknown.length) errors.push(`${name}: tags desconocidas ${unknown.join(", ")} (válidas: ${Object.keys(PROJECT_TAGS).join(", ")})`)
    if (p.date && !/^\d{4}(-\d{2}){0,2}$/.test(String(p.date))) errors.push(`${name}: date debe ser AAAA-MM`)
  })
  return errors
}
