// Web editor for the blog's content. Reads files from GitHub through
// /api/edit (lib/edit-api.mjs), autosaves locally, previews with the site's own
// renderer, and saves by committing to `main`, which Cloudflare Pages deploys.
// Drafts (`draft: true`) are committed too but left out of the site.
import { EditorView, keymap, highlightActiveLine } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { minimalSetup } from "codemirror"
import { markdown } from "@codemirror/lang-markdown"
import { yaml as yamlLang } from "@codemirror/lang-yaml"
import { indentWithTab } from "@codemirror/commands"
import { search, searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { diffLines } from "diff"
import { store } from "./store.js"
import { processImage, dataUrl } from "./images.js"
import { makePreview } from "./preview.js"
import { spellChecker, spellLang, spellTheme } from "./spell.js"
import {
  fileKind, originalPath, translationPath, fileNameFor, splitFrontMatter, joinFrontMatter,
  validateFile, countWords, READ_ONLY,
} from "../lib/content.mjs"
import { fileSlug } from "../lib/slug.mjs"
import { esc } from "../lib/templates.mjs"

const $ = (s, el = document) => el.querySelector(s)
const today = () => new Date().toISOString().slice(0, 10)
const SITE = "https://blog.m19182.dev"

const S = {
  index: null,
  render: null,
  viewOnly: new URLSearchParams(location.search).has("view"),
  remote: new Map(), // path -> sha on main
  dataFiles: [],
  docs: new Map(), // path -> doc (see newDoc)
  images: new Map(), // repo path -> { base64, type, ext }
  local: new Map(), // path -> autosaved entry, for files not opened yet
  current: null,
  previewLang: "en",
  previewPath: null,
}

// ---- API ------------------------------------------------------------------------
async function api(route, { body, params = {} } = {}) {
  const q = new URLSearchParams(params)
  let res
  try {
    res = await fetch(`/api/edit/${route}?${q}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body && JSON.stringify(body),
      redirect: "manual",
      credentials: "same-origin",
    })
  } catch {
    throw new Error("Sin conexión con el editor. Si la sesión de Access caducó, recarga (los cambios están guardados en este navegador).")
  }
  if (res.type === "opaqueredirect" || res.status === 0) throw new Error("La sesión de Cloudflare Access caducó: recarga la página. Tus cambios siguen guardados en este navegador.")
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || `error ${res.status}`), data, { status: res.status })
  return data
}

// ---- documents --------------------------------------------------------------------
// A doc keeps the text on main (`remote`, null for a new file), its blob
// sha, and the current text split into front matter and body. The front matter
// is rewritten only after the form changes it, so untouched files keep their
// formatting.
function newDoc(path, remote, sha, text = remote) {
  const doc = { path, remote, sha, kind: fileKind(path), readOnly: READ_ONLY[path] || "", state: null }
  setText(doc, text)
  return doc
}

function setText(doc, text) {
  doc.text = text
  if (doc.kind === "projects") return
  try {
    const { data, body } = splitFrontMatter(text)
    Object.assign(doc, { data, body, head: text.slice(0, text.length - body.length), fmDirty: false, fmError: "" })
  } catch (e) {
    Object.assign(doc, { data: null, body: text, head: "", fmDirty: false, fmError: e.message.split("\n")[0] })
  }
}

function compose(doc) {
  if (doc.kind === "projects" || !doc.data) return doc.body ?? doc.text
  return doc.fmDirty ? joinFrontMatter(doc.data, doc.body) : doc.head + doc.body
}

const dirty = (doc) => doc.text !== doc.remote
const textOf = (path) => S.docs.get(path)?.text

async function loadDoc(path) {
  if (S.docs.has(path)) return S.docs.get(path)
  const local = S.local.get(path)
  let doc
  if (S.remote.has(path)) {
    const f = await api("file", { params: { path } })
    doc = newDoc(path, f.content, f.sha)
    if (local && local.text !== f.content) {
      setText(doc, local.text)
      doc.restored = local.baseSha === f.sha ? "same" : "conflict"
      doc.savedAt = local.savedAt
      // saving stays refused (409) until the conflict is resolved in the banner
      if (doc.restored === "conflict") doc.sha = local.baseSha
    }
  } else if (local) {
    doc = newDoc(path, null, null, local.text)
  } else return null
  S.docs.set(path, doc)
  return doc
}

let saveTimer
function autosave(doc) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => persist(doc), 400)
}
async function persist(doc) {
  if (!doc) return
  if (dirty(doc)) {
    const entry = { path: doc.path, text: doc.text, baseSha: doc.sha }
    S.local.set(doc.path, entry)
    await store.put(entry)
  } else {
    S.local.delete(doc.path)
    await store.remove(doc.path)
  }
  renderStatus()
  renderSidebar()
}

async function loadLocal() {
  S.local.clear()
  S.images.clear()
  for (const e of await store.all()) {
    if (e.image) S.images.set(e.path, e.image)
    else S.local.set(e.path, e)
  }
}

// ---- boot ---------------------------------------------------------------------------
async function boot() {
  applyTheme()
  document.body.classList.toggle("view-only", S.viewOnly)
  try {
    const [index] = await Promise.all([
      // revalidated each time: it lists the soundtracks and pages the checks rely on
      fetch("/edit/index.json", { cache: "no-cache" }).then((r) => r.json()),
      api("me").then((me) => { $("#who").textContent = me.email }),
    ])
    S.index = index
    S.render = makePreview(index)
    await loadFiles(decodeURIComponent(location.hash.slice(1)) || null)
  } catch (e) {
    fatal(e.message)
  }
}

async function loadFiles(path) {
  const list = await api("files")
  S.remote = new Map(list.files.map((f) => [f.path, f.sha]))
  S.dataFiles = list.dataFiles
  await loadLocal()
  renderSidebar()
  if (path && (S.remote.has(path) || S.local.has(path))) await open(path)
  else showEmpty()
}

function fatal(msg) {
  document.body.innerHTML = `<div class="fatal"><h1>Editor</h1><p>${esc(msg)}</p><p><button onclick="location.reload()">Recargar</button></p></div>`
}

function applyTheme() {
  let theme = "light"
  try { theme = localStorage.getItem("theme") === "dark" ? "dark" : "light" } catch {}
  document.documentElement.dataset.theme = theme
}

// ---- sidebar ------------------------------------------------------------------------
function titleFor(path) {
  const doc = S.docs.get(path)
  if (doc?.data?.title) return doc.data.title
  const name = path.split("/").pop().replace(/\.md$/, "")
  const page = S.index.pages.find((p) => p.name === name && (p.section === "writings") === path.startsWith("content/writings/"))
  return page?.title || name
}

function isDraft(path) {
  const doc = S.docs.get(path)
  if (doc?.data) return doc.data.draft === true
  const name = path.split("/").pop().replace(/\.md$/, "")
  return !!S.index.pages.find((p) => p.name === name && p.draft)
}

function isUnlisted(path) {
  const doc = S.docs.get(path)
  if (doc?.data) return doc.data.unlisted === true
  const name = path.split("/").pop().replace(/\.md$/, "")
  return !!S.index.pages.find((p) => p.name === name && p.unlisted)
}

function allPaths() {
  return [...new Set([...S.remote.keys(), ...S.local.keys(), ...S.docs.keys()])]
}

function renderSidebar() {
  const filter = $("#filter").value.trim().toLowerCase()
  const paths = allPaths()
  const has = new Set(paths)
  const groups = { writings: [], pages: [], updates: [] }
  for (const p of paths) {
    const kind = fileKind(p)
    if (kind === "translation" || kind === "update-translation") continue
    const g = p.startsWith("content/writings/") ? "writings" : p.startsWith("content/updates/") ? "updates" : "pages"
    groups[g].push(p)
  }
  const date = (p) => S.index.pages.find((x) => x.name === p.split("/").pop().replace(/\.md$/, ""))?.date || "9999"
  groups.writings.sort((a, b) => date(b).localeCompare(date(a)))
  groups.updates.sort((a, b) => b.localeCompare(a))
  groups.pages.sort()
  const item = (p) => {
    const title = titleFor(p)
    if (filter && !title.toLowerCase().includes(filter) && !p.toLowerCase().includes(filter)) return ""
    const siblings = [".es.md", ".en.md"].map((ext) => p.replace(/\.md$/, ext)).filter((s) => has.has(s))
    const badges = [
      isDraft(p) && '<span class="badge draft">borrador</span>',
      isUnlisted(p) && '<span class="badge">sin listar</span>',
      READ_ONLY[p] && '<span class="badge">solo lectura</span>',
      !S.remote.has(p) && '<span class="badge new">nuevo</span>',
    ].filter(Boolean).join("")
    const changed = (q) => (S.local.has(q) || (S.docs.get(q) && dirty(S.docs.get(q)))) ? '<span class="dot-changed" title="Cambios sin guardar">●</span>' : ""
    const sib = siblings.map((s) => `<a href="#${esc(s)}" class="sib${S.current?.path === s ? " active" : ""}">${s.slice(-5, -3).toUpperCase()}${changed(s)}</a>`).join("")
    return `<li><a href="#${esc(p)}" class="${S.current?.path === p ? "active" : ""}">${changed(p)}${esc(title)}</a>${sib}${badges}</li>`
  }
  $("#files").innerHTML = [["Escritos", groups.writings], ["Páginas", groups.pages], ["Actualizaciones", groups.updates]]
    .map(([label, list]) => `<h3>${label}</h3><ul>${list.map(item).join("")}</ul>`).join("")
}

// ---- editor -------------------------------------------------------------------------
const langConf = new Compartment()
const roConf = new Compartment()
const attrConf = new Compartment()
let view

function wrapSel(before, after = before, fallback = "") {
  return (v) => {
    if (v.state.readOnly) return true
    v.dispatch(v.state.changeByRange((r) => {
      const text = v.state.sliceDoc(r.from, r.to) || fallback
      return {
        changes: { from: r.from, to: r.to, insert: before + text + after },
        range: { anchor: r.from + before.length, head: r.from + before.length + text.length },
      }
    }))
    v.focus()
    return true
  }
}

function linePrefix(prefix) {
  return (v) => {
    if (v.state.readOnly) return true
    const changes = []
    const seen = new Set()
    for (const r of v.state.selection.ranges) {
      for (let pos = r.from; pos <= r.to;) {
        const line = v.state.doc.lineAt(pos)
        if (!seen.has(line.from)) {
          seen.add(line.from)
          changes.push(line.text.startsWith(prefix) ? { from: line.from, to: line.from + prefix.length } : { from: line.from, insert: prefix })
        }
        pos = line.to + 1
      }
    }
    v.dispatch({ changes })
    v.focus()
    return true
  }
}

function link(v) {
  const r = v.state.selection.main
  const text = v.state.sliceDoc(r.from, r.to)
  if (/^https?:\/\/\S+$/.test(text)) {
    v.dispatch({ changes: { from: r.from, to: r.to, insert: `[](${text})` }, selection: { anchor: r.from + 1 } })
  } else {
    v.dispatch({ changes: { from: r.from, to: r.to, insert: `[${text}]()` }, selection: { anchor: r.from + text.length + 3 } })
  }
  v.focus()
  return true
}

// Next free footnote number: reference at the cursor, definition at the end.
function footnote(v) {
  if (v.state.readOnly) return true
  const doc = v.state.doc.toString()
  const n = Math.max(0, ...[...doc.matchAll(/\[\^(\d+)\]/g)].map((m) => Number(m[1]))) + 1
  const end = v.state.doc.length
  const pos = v.state.selection.main.to
  const tail = `${doc.endsWith("\n") ? "" : "\n"}\n[^${n}]: `
  v.dispatch({
    changes: [{ from: pos, insert: `[^${n}]` }, { from: end, insert: tail }],
    selection: { anchor: end + `[^${n}]`.length + tail.length },
    scrollIntoView: true,
  })
  v.focus()
  return true
}

const editorKeys = [
  { key: "Mod-s", run: () => (review(), true), preventDefault: true },
  { key: "Mod-b", run: wrapSel("**") },
  { key: "Mod-i", run: wrapSel("*") },
  { key: "Mod-k", run: link },
  { key: "Mod-Shift-f", run: footnote },
  { key: "Alt-p", run: () => (togglePreview(), true) },
  { key: "Alt-z", run: () => (toggleFocus(), true) },
  indentWithTab,
]

function makeState(doc) {
  return EditorState.create({
    doc: doc.kind === "projects" || !doc.data ? doc.text : doc.body,
    extensions: [
      minimalSetup,
      search({ top: true }),
      highlightSelectionMatches(),
      keymap.of([...editorKeys, ...searchKeymap]),
      EditorView.lineWrapping,
      highlightActiveLine(),
      langConf.of(doc.kind === "projects" ? yamlLang() : markdown()),
      roConf.of(EditorState.readOnly.of(!!doc.readOnly)),
      attrConf.of(langExtensions(doc)),
      EditorView.updateListener.of((u) => { if (u.docChanged) onBodyChange(u.state.doc.toString()) }),
      EditorView.domEventHandlers({
        paste: (e, v) => onPaste(e, v),
        drop: (e, v) => onDrop(e, v),
        scroll: () => syncScroll(),
      }),
    ],
  })
}

// The built-in checker (editor/spell.js) replaces the browser's own while it's on.
const spellOn = () => { try { return localStorage.getItem("spell") !== "off" } catch { return true } }

function langExtensions(doc) {
  const own = spellOn() && doc.kind !== "projects"
  return [
    EditorView.contentAttributes.of({ spellcheck: own ? "false" : "true", lang: docLang(doc), autocorrect: "on", autocapitalize: "sentences" }),
    own ? [spellLang.of(docLang(doc)), spellChecker, spellTheme] : [],
  ]
}

function applyLang() {
  if (view && S.current) view.dispatch({ effects: attrConf.reconfigure(langExtensions(S.current)) })
  $("#spell").setAttribute("aria-pressed", String(spellOn()))
}

function docLang(doc) {
  if (/\.es\.md$/.test(doc.path)) return "es"
  if (/\.en\.md$/.test(doc.path)) return "en"
  if (doc.kind === "update") return "es"
  return doc.data?.lang === "es" ? "es" : "en"
}

function onBodyChange(text) {
  const doc = S.current
  if (!doc) return
  if (doc.kind === "projects" || !doc.data) {
    doc.text = text
    doc.body = text
  } else {
    doc.body = text
    doc.text = compose(doc)
  }
  changed()
}

function changed() {
  autosave(S.current)
  schedulePreview()
  renderProblems()
  renderStatus()
}

async function open(path) {
  if (S.current && S.current.path === path) return
  await persist(S.current)
  if (S.current && view) S.current.state = view.state
  let doc
  try {
    doc = await loadDoc(path)
  } catch (e) {
    return toast(e.message, true)
  }
  if (!doc) return toast(`No existe ${path}`, true)
  // The preview needs the original and its translation (and projects.md for projects.yml).
  const related = doc.kind === "projects" ? ["content/projects.md"] : [originalPath(path), ...[".es.md", ".en.md"].map((e) => originalPath(path).replace(/\.md$/, e))]
  await Promise.all(related.filter((p) => p !== path && (S.remote.has(p) || S.local.has(p))).map((p) => loadDoc(p).catch(() => null)))
  S.current = doc
  history.replaceState(null, "", `${location.pathname}${location.search}#${encodeURIComponent(path)}`)
  doc.state ??= makeState(doc)
  if (!view) view = new EditorView({ parent: $("#cm"), state: doc.state })
  else view.setState(doc.state)
  applyLang()
  S.previewLang = docLang(doc)
  document.body.classList.remove("empty")
  $("#path").textContent = path.replace(/^content\//, "")
  renderForm()
  renderBanner()
  renderProblems()
  renderStatus()
  renderSidebar()
  renderActions()
  schedulePreview(0)
  document.body.classList.remove("show-files")
}

function showEmpty() {
  document.body.classList.add("empty")
  renderActions()
  renderStatus()
}

function renderBanner() {
  const doc = S.current
  const el = $("#banner")
  let html = ""
  if (doc.readOnly) html = `<b>Solo lectura.</b> ${esc(doc.readOnly)}`
  else if (doc.restored === "same") html = `Recuperados tus cambios locales del ${new Date(doc.savedAt).toLocaleString("es-ES")}. <button data-act="discard">Descartarlos</button>`
  else if (doc.restored === "conflict") html = `<b>El archivo cambió en GitHub</b> después de tu borrador local (${new Date(doc.savedAt).toLocaleString("es-ES")}). Estás viendo tu versión. <button data-act="keep">Quedarme con la mía</button> <button data-act="discard">Usar la de GitHub</button>`
  else if (doc.fmError) html = `<b>Front matter no válido:</b> ${esc(doc.fmError)}. Edita el archivo entero abajo.`
  el.innerHTML = html
  el.hidden = !html
}

$("#banner").addEventListener("click", async (e) => {
  const act = e.target.dataset?.act
  const doc = S.current
  if (!act || !doc) return
  if (act === "keep") {
    // Keep the local text but base it on the current remote version.
    doc.restored = null
    doc.sha = S.remote.get(doc.path)
  } else if (act === "discard") {
    doc.restored = null
    setText(doc, doc.remote ?? "")
    doc.state = makeState(doc)
    view.setState(doc.state)
    applyLang()
    await persist(doc)
    renderForm()
  }
  renderBanner()
  changed()
})

// ---- front matter form ----------------------------------------------------------------
const FORMS = {
  writing: ["draft", "unlisted", "title", "summary", "date", "updated", "tags", "lang", "series", "series_es", "series_order", "aliases", "soundtrack"],
  translation: ["title", "summary"],
  page: ["title"],
  update: ["draft", "title", "date"],
  "update-translation": ["title"],
}

const FIELDS = {
  draft: { label: "Borrador", type: "bool", hint: "No sale en el sitio (sí en GitHub, el repo es público)." },
  unlisted: { label: "Sin listar", type: "bool", hint: "Accesible por URL, fuera de listas, RSS y sitemap." },
  title: { label: "Título", type: "text" },
  summary: { label: "Resumen", type: "text", hint: "Una línea para la lista de escritos." },
  date: { label: "Fecha", type: "date" },
  updated: { label: "Actualizado", type: "date", today: true },
  tags: { label: "Tags", type: "tags", hint: "1–3, separadas por comas." },
  lang: { label: "Idioma original", type: "select", options: [["", "inglés"], ["es", "español"]] },
  series: { label: "Serie", type: "text", list: "series-list" },
  series_es: { label: "Serie (ES)", type: "text" },
  series_order: { label: "Orden en la serie", type: "number" },
  aliases: { label: "URLs antiguas", type: "tags", hint: "p. ej. writings/Old-Slug" },
  soundtrack: { label: "Banda sonora", type: "soundtrack" },
}

function renderForm() {
  const doc = S.current
  const form = $("#form")
  const keys = doc.data && !doc.readOnly ? FORMS[doc.kind] || [] : []
  form.hidden = !keys.length
  $("#props-bar").hidden = !keys.length
  if (!keys.length) return (form.innerHTML = "")
  renderPropsSummary()
  const d = doc.data
  const series = [...new Set(S.index.pages.map((p) => p.series).filter(Boolean))]
  const field = (key) => {
    const f = FIELDS[key]
    const v = d[key]
    const id = `f-${key}`
    let input
    if (f.type === "bool") {
      return `<label class="field bool"><input type="checkbox" id="${id}" data-key="${key}"${v === true ? " checked" : ""}> ${f.label}${f.hint ? `<small>${f.hint}</small>` : ""}</label>`
    } else if (f.type === "select") {
      input = `<select id="${id}" data-key="${key}">${f.options.map(([val, label]) => `<option value="${val}"${(v || "") === val ? " selected" : ""}>${label}</option>`).join("")}</select>`
    } else if (f.type === "tags") {
      input = `<input id="${id}" data-key="${key}" value="${esc([v || []].flat().join(", "))}"${key === "tags" ? ' list="tag-list"' : ""} autocomplete="off">`
    } else if (f.type === "soundtrack") {
      const s = v || {}
      const files = Object.keys(S.index.soundtracks)
      return `<fieldset class="field wide soundtrack"><legend>${f.label}</legend>
        <select data-st="file"><option value="">—</option>${files.map((x) => `<option${s.file === x ? " selected" : ""}>${esc(x)}</option>`).join("")}</select>
        <input data-st="artist" placeholder="Artista" value="${esc(s.artist || "")}">
        <input data-st="title" placeholder="Tema" value="${esc(s.title || "")}">
        <small>${s.file && S.index.soundtracks[s.file] ? `${Math.round(S.index.soundtracks[s.file].duration / 60)} min de audio; lectura ≈ ${Math.round(countWords(doc.body) / 230)} min.` : "Archivos en content/data/soundtrack (añadir uno nuevo requiere ffmpeg en local)."}</small>
      </fieldset>`
    } else {
      const type = f.type === "date" ? "date" : f.type === "number" ? "number" : "text"
      input = `<input id="${id}" type="${type}" data-key="${key}" value="${esc(v ?? "")}"${f.list ? ` list="${f.list}"` : ""}>`
      if (f.today) input += `<button type="button" data-today="${key}" title="Hoy">hoy</button>`
    }
    return `<label class="field${key === "summary" || key === "title" ? " wide" : ""}" for="${id}"><span>${f.label}</span>${input}${f.hint ? `<small>${f.hint}</small>` : ""}</label>`
  }
  const extra = Object.keys(d).filter((k) => !keys.includes(k))
  form.innerHTML = keys.map(field).join("") +
    (extra.length ? `<p class="extra">Otros campos (se conservan): ${extra.map(esc).join(", ")}</p>` : "") +
    `<datalist id="tag-list">${S.index.writingTags.map((t) => `<option value="${esc(t)}">`).join("")}</datalist>` +
    `<datalist id="series-list">${series.map((t) => `<option value="${esc(t)}">`).join("")}</datalist>`
}

$("#form").addEventListener("input", onForm)
$("#form").addEventListener("change", onForm)
$("#form").addEventListener("click", (e) => {
  const key = e.target.dataset?.today
  if (!key) return
  $(`#f-${key}`).value = today()
  onForm({ target: $(`#f-${key}`) })
})

// One line standing in for the form while it's collapsed.
function renderPropsSummary() {
  const d = S.current?.data
  if (!d) return
  const bits = [
    d.draft === true && "borrador",
    d.unlisted === true && "sin listar",
    d.title,
    d.date && String(d.date),
    [d.tags || []].flat().filter(Boolean).map((t) => `#${t}`).join(" "),
  ].filter(Boolean)
  $("#props-summary").textContent = bits.join(" · ")
}

const propsCollapsed = () => { try { return localStorage.getItem("props") === "collapsed" } catch { return false } }
document.body.classList.toggle("props-collapsed", propsCollapsed())
$("#props-toggle").addEventListener("click", () => {
  localStorage.setItem("props", propsCollapsed() ? "open" : "collapsed")
  document.body.classList.toggle("props-collapsed", propsCollapsed())
  $("#props-toggle").setAttribute("aria-expanded", String(!propsCollapsed()))
})
$("#props-toggle").setAttribute("aria-expanded", String(!propsCollapsed()))

function onForm(e) {
  const doc = S.current
  const el = e.target
  if (!doc?.data) return
  if (el.dataset.st) {
    const s = { ...(doc.data.soundtrack || {}) }
    s[el.dataset.st] = el.value.trim()
    doc.data.soundtrack = s.file || s.artist || s.title ? s : undefined
  } else if (el.dataset.key) {
    const key = el.dataset.key
    const f = FIELDS[key]
    let v
    if (f.type === "bool") v = el.checked
    else if (f.type === "tags") v = el.value.split(",").map((s) => s.trim()).filter(Boolean)
    else if (f.type === "number") v = el.value === "" ? undefined : Number(el.value)
    else v = el.value
    doc.data[key] = v
    if (key === "lang") applyLang()
  } else return
  doc.fmDirty = true
  doc.text = compose(doc)
  changed()
  renderPropsSummary()
  if (e.type === "change") renderSidebar()
}

// ---- problems & status -------------------------------------------------------------------
function problems(doc) {
  if (doc.readOnly) return []
  return validateFile(doc.path, doc.text, { soundtracks: Object.keys(S.index.soundtracks) })
}

function renderProblems() {
  const list = S.current ? problems(S.current) : []
  const el = $("#problems")
  el.hidden = !list.length
  el.innerHTML = list.map((p) => `<li>${esc(p)}</li>`).join("")
}

function renderStatus() {
  const doc = S.current
  const pending = pendingDocs().length
  $("#save").disabled = !pending
  $("#save").textContent = pending ? `Guardar (${pending})` : "Guardar"
  if (!doc) return ($("#status").textContent = "")
  const words = doc.kind === "projects" ? "" : `${countWords(doc.body ?? doc.text).toLocaleString("es-ES")} palabras`
  const state = doc.readOnly ? "solo lectura" : !dirty(doc) ? "sin cambios" : S.local.has(doc.path) ? "cambios guardados en este navegador" : "guardando…"
  $("#status").textContent = [words, state].filter(Boolean).join(" · ")
}

function renderActions() {
  const doc = S.current
  const orig = doc && originalPath(doc.path)
  const canTranslate = doc && (doc.kind === "writing" || doc.kind === "page" || doc.kind === "update") && !doc.readOnly
  const sibling = doc && (doc.kind === "update" ? orig.replace(/\.md$/, ".en.md") : translationPath(orig, S.docs.get(orig)?.data?.lang))
  const has = sibling && allPaths().includes(sibling)
  $("#translate").hidden = !canTranslate || has
  $("#swap").hidden = !doc || !(has || /\.(es|en)\.md$/.test(doc.path))
  if (doc && !$("#swap").hidden) $("#swap").textContent = /\.(es|en)\.md$/.test(doc.path) ? "Ir al original" : `Ir a la traducción (${sibling.slice(-5, -3).toUpperCase()})`
  const page = doc && doc.remote != null && !isDraft(originalPath(doc.path)) && pageUrl(doc.path)
  $("#view-live").hidden = !page
  if (page) $("#view-live").href = SITE + page + "/"
  const here = new URL(location.href)
  if (doc) {
    here.searchParams.set("view", "1")
    $("#view-full").href = here.href
    here.searchParams.delete("view")
    $("#view-edit").href = here.href
  }
}

function pageUrl(path) {
  const orig = originalPath(path)
  if (orig.startsWith("content/updates/")) return "/updates"
  if (orig === "content/projects.yml") return "/projects"
  const name = orig.split("/").pop().replace(/\.md$/, "")
  if (orig === "content/index.md") return ""
  return orig.startsWith("content/writings/") ? `/writings/${fileSlug(name)}` : `/${fileSlug(name)}`
}

// ---- preview ----------------------------------------------------------------------------
let previewTimer
function schedulePreview(ms = 180) {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(updatePreview, ms)
}

// Pasted images aren't deployed until saved: show them from memory.
function localizeImages(html) {
  for (const [path, img] of S.images) {
    const url = path.startsWith("assets/projects/") ? `/static/projects/${path.slice(16)}` : `/data/${path.slice(13)}`
    html = html.split(`"${url}"`).join(`"${dataUrl(img)}"`)
  }
  return html
}

function updatePreview() {
  const doc = S.current
  if (!doc || (previewHidden() && !narrow() && !document.body.classList.contains("view-only"))) return
  let out
  try {
    out = S.render(doc.path, textOf)
  } catch (e) {
    out = { html: `<!doctype html><pre>${esc(e.stack || e.message)}</pre>` }
  }
  const html = localizeImages(out.html)
    // no analytics from previews
    .replace(/<script defer src="https:\/\/umami[^>]*><\/script>/, "")
  const frame = $("#preview")
  const fdoc = frame.contentDocument
  if (S.previewPath !== doc.path || !fdoc?.querySelector("main")) {
    S.previewPath = doc.path
    frame.onload = () => { setPreviewLang(); syncScroll() }
    frame.srcdoc = html
    return
  }
  const next = new DOMParser().parseFromString(html, "text/html")
  for (const a of ["data-en-title", "data-es-title"]) {
    const v = next.documentElement.getAttribute(a)
    if (v == null) fdoc.documentElement.removeAttribute(a)
    else fdoc.documentElement.setAttribute(a, v)
  }
  fdoc.querySelector("main").innerHTML = next.querySelector("main").innerHTML
  const h = fdoc.querySelector(".site-header"), nh = next.querySelector(".site-header")
  if (h && nh) h.innerHTML = nh.innerHTML
  setPreviewLang()
}

function setPreviewLang() {
  const root = $("#preview").contentDocument?.documentElement
  if (!root) return
  const hasEs = root.hasAttribute("data-es-title")
  root.lang = hasEs ? S.previewLang : root.lang
}

function syncScroll() {
  if (!view) return
  const sc = view.scrollDOM
  const frac = sc.scrollTop / Math.max(1, sc.scrollHeight - sc.clientHeight)
  const w = $("#preview").contentWindow
  if (!w?.document?.documentElement) return
  const max = w.document.documentElement.scrollHeight - w.innerHeight
  w.scrollTo({ top: frac * max, behavior: "instant" })
}

// Narrow screens swap editor and preview; wide ones can hide the preview to write
// with the full width, remembered in this browser.
const narrow = () => matchMedia("(max-width: 760px)").matches
const previewHidden = () => { try { return localStorage.getItem("preview") === "hidden" } catch { return false } }
function applyPreviewPref() {
  document.body.classList.toggle("hide-preview", previewHidden())
  $("#toggle-preview").setAttribute("aria-pressed", String(!previewHidden()))
}
function togglePreview() {
  if (narrow()) return document.body.classList.toggle("show-preview")
  localStorage.setItem("preview", previewHidden() ? "shown" : "hidden")
  applyPreviewPref()
  if (!previewHidden()) schedulePreview(0)
}
applyPreviewPref()

// ---- images --------------------------------------------------------------------------------
function imageFiles(e) {
  return [...(e.clipboardData || e.dataTransfer)?.files || []].filter((f) => f.type.startsWith("image/"))
}

function onPaste(e, v) {
  const files = imageFiles(e)
  if (files.length) {
    e.preventDefault()
    addImages(files, v)
    return true
  }
  // Pasting a URL over selected text makes a link.
  const text = e.clipboardData?.getData("text/plain")?.trim()
  const r = v.state.selection.main
  if (text && !r.empty && /^https?:\/\/\S+$/.test(text) && !/^https?:\/\//.test(v.state.sliceDoc(r.from, r.to))) {
    e.preventDefault()
    v.dispatch({ changes: { from: r.from, to: r.to, insert: `[${v.state.sliceDoc(r.from, r.to)}](${text})` } })
    return true
  }
  return false
}

function onDrop(e, v) {
  const files = imageFiles(e)
  if (!files.length) return false
  e.preventDefault()
  const pos = v.posAtCoords({ x: e.clientX, y: e.clientY })
  if (pos != null) v.dispatch({ selection: { anchor: pos } })
  addImages(files, v)
  return true
}

$("#image-input").addEventListener("change", (e) => {
  addImages([...e.target.files], view)
  e.target.value = ""
})

async function addImages(files, v) {
  const doc = S.current
  if (!doc || doc.readOnly) return
  const project = doc.kind === "projects"
  for (const file of files) {
    try {
      const img = await processImage(file, { project })
      const base = (project ? file.name.replace(/\.[^.]+$/, "") : fileSlug(originalPath(doc.path).split("/").pop().replace(/\.md$/, ""))).toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "") || "image"
      const dir = project ? "assets/projects/" : "content/data/"
      const taken = new Set([...S.dataFiles.map((f) => dir + f), ...S.images.keys(), ...(project ? S.index.projectImages.map((f) => dir + f) : [])])
      let n = 1, path
      do path = `${dir}${base}${project && n === 1 ? "" : `-${n}`}.${img.ext}`, n++
      while (taken.has(path))
      S.images.set(path, img)
      await store.put({ path, image: img })
      const name = path.split("/").pop()
      const insert = project ? name : `![${file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}](/data/${name})\n`
      v.dispatch(v.state.replaceSelection(insert))
      toast(`Imagen lista: ${name} (${Math.round(img.base64.length * 0.75 / 1024)} KB). Se sube al guardar.`)
    } catch (e) {
      toast(e.message, true)
    }
  }
}

// ---- new files ---------------------------------------------------------------------------
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

function createDoc(path, data, body = "") {
  const doc = newDoc(path, null, null, joinFrontMatter(data, body))
  S.docs.set(path, doc)
  persist(doc)
  return doc
}

$("#new-post").addEventListener("click", () => {
  const dlg = $("#new-dialog")
  const f = dlg.querySelector("form")
  f.reset()
  f.month.value = today().slice(0, 7)
  updateNewHint()
  dlg.showModal()
})
$("#new-dialog form").addEventListener("input", updateNewHint)

function newTarget() {
  const f = $("#new-dialog form")
  if (f.kind.value === "update") {
    const m = f.month.value
    return m && { path: `content/updates/${m}.md`, url: "/updates" }
  }
  const name = fileNameFor(f.title.value)
  return name && { path: `content/writings/${name}.md`, url: `/writings/${fileSlug(name)}` }
}

function updateNewHint() {
  const f = $("#new-dialog form")
  f.classList.toggle("is-update", f.kind.value === "update")
  const t = newTarget()
  const exists = t && allPaths().includes(t.path)
  $("#new-hint").textContent = !t ? "" : exists ? `Ya existe ${t.path}` : `${t.path} → ${t.url}`
  f.querySelector("button[value=ok]").disabled = !t || exists
}

$("#new-dialog form").addEventListener("submit", (e) => {
  const f = e.target
  if (e.submitter?.value !== "ok") return
  const t = newTarget()
  if (!t) return
  if (f.kind.value === "update") {
    const [y, m] = f.month.value.split("-")
    createDoc(t.path, { title: `${MONTHS[Number(m) - 1]} ${y}`, date: today(), draft: true })
  } else {
    createDoc(t.path, {
      title: f.title.value.trim(), summary: "", date: today(), tags: [],
      ...(f.lang.value === "es" && { lang: "es" }), draft: true,
    })
  }
  renderSidebar()
  open(t.path)
})

// The sibling translation, starting from the original's text to translate in place.
$("#translate").addEventListener("click", () => {
  const doc = S.current
  const orig = S.docs.get(originalPath(doc.path))
  const path = orig.kind === "update" ? orig.path.replace(/\.md$/, ".en.md") : translationPath(orig.path, orig.data?.lang)
  const data = { title: orig.data?.title || "", ...(orig.kind === "writing" && { summary: orig.data?.summary || "" }) }
  createDoc(path, data, orig.body)
  toast("Traducción creada con el texto original: tradúcelo encima.")
  open(path)
})

$("#swap").addEventListener("click", () => {
  const doc = S.current
  if (/\.(es|en)\.md$/.test(doc.path)) return open(originalPath(doc.path))
  const sib = [".es.md", ".en.md"].map((e) => doc.path.replace(/\.md$/, e)).find((p) => allPaths().includes(p))
  if (sib) open(sib)
})

// ---- review & save -----------------------------------------------------------------------------
function pendingDocs() {
  const docs = [...S.docs.values()].filter((d) => !d.readOnly && dirty(d))
  // autosaved files not opened in this session
  for (const [path, e] of S.local) if (!S.docs.has(path) && e.text != null) docs.push({ path, notLoaded: true })
  return docs
}

function referencedImages(docs) {
  const text = docs.map((d) => d.text || "").join("\n")
  return [...S.images.keys()].filter((p) => text.includes(p.split("/").pop()))
}

function diffHtml(a, b) {
  const parts = diffLines(a || "", b)
  const out = []
  for (const [i, p] of parts.entries()) {
    const lines = p.value.replace(/\n$/, "").split("\n")
    if (p.added || p.removed) {
      out.push(...lines.map((l) => `<div class="${p.added ? "add" : "del"}">${p.added ? "+" : "−"} ${esc(l)}</div>`))
    } else if (lines.length > 6) {
      const head = i === 0 ? [] : lines.slice(0, 3)
      const tail = i === parts.length - 1 ? [] : lines.slice(-3)
      out.push(...head.map((l) => `<div>  ${esc(l)}</div>`), `<div class="skip">⋯ ${lines.length - head.length - tail.length} líneas sin cambios</div>`, ...tail.map((l) => `<div>  ${esc(l)}</div>`))
    } else out.push(...lines.map((l) => `<div>  ${esc(l)}</div>`))
  }
  return out.join("")
}

// Notes for a writing about to be saved: publishing, newsletter, translations, `updated`.
function notesFor(doc, pending) {
  const notes = []
  if (doc.kind !== "writing" || !doc.data) return notes
  let before = {}
  try { before = doc.remote ? splitFrontMatter(doc.remote).data : {} } catch {}
  const wasLive = doc.remote != null && before.draft !== true
  const live = doc.data.draft !== true
  if (live && !wasLive) {
    if (doc.data.unlisted) notes.push("Se publica <b>sin listar</b>: accesible por URL, fuera de listas, RSS y newsletter.")
    else notes.push("<b>Se publica</b>: aparecerá en Escritos y el RSS y, si el newsletter está activado, se enviará por email.")
  }
  if (live && wasLive && before.unlisted === true && !doc.data.unlisted) notes.push("<b>Deja de estar sin listar</b>: aparecerá en Escritos y el RSS y se enviará el newsletter si está activado.")
  if (doc.remote != null && live && wasLive) {
    const bodyChanged = splitFrontMatter(doc.remote).body !== doc.body
    if (bodyChanged && (doc.data.updated || "") === (before.updated || "")) {
      notes.push(`<label><input type="checkbox" data-updated="${esc(doc.path)}"> Poner <code>updated: ${today()}</code> (si es una revisión importante)</label>`)
    }
  }
  const sibling = translationPath(doc.path, doc.data.lang)
  const remoteBody = doc.remote != null ? splitFrontMatter(doc.remote).body : null
  if (allPaths().includes(sibling) && remoteBody !== doc.body && !pending.some((d) => d.path === sibling)) {
    notes.push(`No has tocado la traducción (${esc(sibling.split("/").pop())}).`)
  }
  return notes
}

async function review() {
  await persist(S.current)
  // load autosaved files that weren't opened, so they can be diffed
  for (const d of pendingDocs().filter((d) => d.notLoaded)) await loadDoc(d.path).catch(() => {})
  const pending = pendingDocs().filter((d) => !d.notLoaded)
  if (!pending.length) return toast("No hay cambios que guardar.")
  const images = referencedImages(pending)
  const unused = S.images.size - images.length
  const dlg = $("#review")
  const titles = pending.map((d) => d.data?.title || d.path.split("/").pop())
  const verb = pending.length === 1 && pending[0].remote == null
    ? (pending[0].data?.draft ? "Nuevo borrador" : "Nuevo")
    : pending.some((d) => notesFor(d, pending).some((n) => n.includes("Se publica"))) ? "Publicar" : "Editar"
  dlg.querySelector("[name=message]").value = `${verb}: ${[...new Set(titles)].join(", ")}`
  $("#review-target").textContent = "Commit en main: el sitio se actualiza en 1–2 minutos (los borradores no salen)."
  $("#review-files").innerHTML = pending.map((d) => {
    const errs = problems(d)
    const notes = notesFor(d, pending)
    return `<section class="rv-file" data-path="${esc(d.path)}">
      <label class="rv-head"><input type="checkbox" checked data-include="${esc(d.path)}"> <b>${esc(d.path.replace(/^content\//, ""))}</b>${d.remote == null ? ' <span class="badge new">nuevo</span>' : ""}</label>
      ${errs.length ? `<ul class="problems">${errs.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${notes.length ? `<ul class="notes">${notes.map((n) => `<li>${n}</li>`).join("")}</ul>` : ""}
      <details${pending.length === 1 ? " open" : ""}><summary>Diferencias</summary><div class="diff">${diffHtml(d.remote, d.text)}</div></details>
    </section>`
  }).join("") +
    (images.length ? `<p>Imágenes: ${images.map((p) => `<code>${esc(p)}</code>`).join(", ")}</p>` : "") +
    (unused > 0 ? `<p class="muted">${unused} imagen(es) pegadas que ya no se usan no se subirán.</p>` : "")
  $("#review-error").textContent = ""
  updateReviewButton()
  dlg.showModal()
}

function updateReviewButton() {
  const included = [...document.querySelectorAll("#review-files [data-include]")].filter((c) => c.checked).map((c) => c.dataset.include)
  const blocked = included.some((p) => problems(S.docs.get(p)).length)
  const btn = $("#review button[value=ok]")
  btn.disabled = !included.length || blocked
  btn.textContent = blocked ? "Corrige los errores" : "Guardar"
}
$("#review-files").addEventListener("change", updateReviewButton)

$("#review form").addEventListener("submit", async (e) => {
  if (e.submitter?.value !== "ok") return
  e.preventDefault()
  const btn = e.submitter
  const included = [...document.querySelectorAll("#review-files [data-include]")].filter((c) => c.checked).map((c) => S.docs.get(c.dataset.include))
  for (const c of document.querySelectorAll("#review-files [data-updated]")) {
    const doc = S.docs.get(c.dataset.updated)
    if (c.checked && included.includes(doc)) {
      doc.data.updated = today()
      doc.fmDirty = true
      doc.text = compose(doc)
    }
  }
  const images = referencedImages(included)
  const files = [
    ...included.map((d) => ({ path: d.path, content: d.text, baseSha: d.sha })),
    ...images.map((p) => ({ path: p, base64: S.images.get(p).base64, baseSha: null })),
  ]
  btn.disabled = true
  btn.textContent = "Guardando…"
  try {
    const res = await api("commit", { body: { message: $("#review [name=message]").value, files } })
    for (const d of included) {
      d.remote = d.text
      d.sha = res.files[d.path]
      d.restored = null
      S.remote.set(d.path, d.sha)
      S.local.delete(d.path)
      await store.remove(d.path)
    }
    for (const p of images) {
      S.images.delete(p)
      await store.remove(p)
      if (p.startsWith("content/data/")) S.dataFiles.push(p.slice(13))
      else S.index.projectImages.push(p.slice(16))
    }
    $("#review").close()
    if (S.current && included.includes(S.current)) {
      // keep the editor in sync if `updated` was set on save
      if (view.state.doc.toString() !== (S.current.body ?? S.current.text)) {
        S.current.state = makeState(S.current)
        view.setState(S.current.state)
      }
      renderForm()
      renderBanner()
    }
    const page = S.current && pageUrl(S.current.path)
    toast(`Guardado. <a href="${esc(res.url)}" target="_blank" rel="noopener">commit</a>${page != null && !isDraft(originalPath(S.current.path)) ? ` · <a href="${SITE}${page}/" target="_blank" rel="noopener">ver página</a> (en 1–2 min)` : ""}`, false, true)
    renderSidebar()
    renderStatus()
    renderProblems()
    renderActions()
  } catch (err) {
    $("#review-error").textContent = err.message
    updateReviewButton()
  }
})

$("#save").addEventListener("click", review)

// ---- misc UI ------------------------------------------------------------------------------------
let toastTimer
function toast(msg, error = false, html = false) {
  const el = $("#toast")
  el.className = error ? "error" : ""
  el[html ? "innerHTML" : "textContent"] = msg
  el.hidden = false
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.hidden = true }, html ? 15000 : 5000)
}

$("#filter").addEventListener("input", renderSidebar)
$("#files").addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='#']")
  if (!a) return
  e.preventDefault()
  open(decodeURIComponent(a.getAttribute("href").slice(1)))
})
// Wide screens hide the file list (remembered); narrow ones open it over the editor.
const filesHidden = () => { try { return localStorage.getItem("files") === "hidden" } catch { return false } }
document.body.classList.toggle("hide-files", filesHidden())
$("#toggle-files").addEventListener("click", () => {
  if (matchMedia("(max-width: 1100px)").matches) return document.body.classList.toggle("show-files")
  localStorage.setItem("files", filesHidden() ? "shown" : "hidden")
  document.body.classList.toggle("hide-files", filesHidden())
})

// Focus mode: only the text, the current paragraph highlighted.
function toggleFocus(on = !document.body.classList.contains("focus")) {
  document.body.classList.toggle("focus", on)
  view?.requestMeasure()
  view?.focus()
}
$("#focus").addEventListener("click", () => toggleFocus())
$("#focus-exit").addEventListener("click", () => toggleFocus(false))
$("#toggle-preview").addEventListener("click", togglePreview)
$("#preview-lang").addEventListener("click", () => {
  S.previewLang = S.previewLang === "es" ? "en" : "es"
  setPreviewLang()
})
$("#toolbar").addEventListener("click", (e) => {
  const cmd = e.target.closest("button")?.dataset.cmd
  if (!cmd || !view) return
  const cmds = {
    bold: wrapSel("**"), italic: wrapSel("*"), link, footnote, code: wrapSel("`"),
    h2: linePrefix("## "), h3: linePrefix("### "), quote: linePrefix("> "), list: linePrefix("- "),
    image: () => $("#image-input").click(),
    spell: () => {
      localStorage.setItem("spell", spellOn() ? "off" : "on")
      applyLang()
    },
  }
  cmds[cmd]?.(view)
})
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
    e.preventDefault()
    review()
  }
  // Esc leaves focus mode unless something else (search, a dialog) used it
  if (e.key === "Escape" && !e.defaultPrevented && document.body.classList.contains("focus") && !document.querySelector("dialog[open], .cm-panels, .spell-menu")) toggleFocus(false)
})
addEventListener("pagehide", () => { if (S.current) persist(S.current) })
addEventListener("hashchange", () => {
  const p = decodeURIComponent(location.hash.slice(1))
  if (p && p !== S.current?.path) open(p)
})

boot()
