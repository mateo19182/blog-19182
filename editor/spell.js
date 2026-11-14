// Spell checking with Hunspell dictionaries (British English, Spanish), so it
// works the same in any browser. Spanish text also accepts English words, since
// posts mix in English terms. Skips code, URLs, HTML, maths and link
// targets, and capitalised words mid-sentence (names). Right-click (or long
// press) a marked word for suggestions or to add it to your dictionary, which
// lives in this browser.
import { ViewPlugin, Decoration, EditorView } from "@codemirror/view"
import { Facet, RangeSetBuilder, StateEffect } from "@codemirror/state"
import { syntaxTree } from "@codemirror/language"
import nspell from "nspell"

const DICTS = { en: "en-gb", es: "es" }
const loaded = {}
const WORDS_KEY = "spell-words"
const refresh = StateEffect.define()

export const spellLang = Facet.define({ combine: (v) => v[v.length - 1] || "en" })

const personal = () => { try { return JSON.parse(localStorage.getItem(WORDS_KEY)) || [] } catch { return [] } }

// The dictionary for a language, loaded once; the view redraws when it's ready.
function load(lang, view) {
  if (!loaded[lang]) {
    loaded[lang] = { spell: null }
    Promise.all(["aff", "dic"].map((ext) => fetch(`/edit/dict/${DICTS[lang]}.${ext}`).then((r) => {
      if (!r.ok) throw new Error(`diccionario ${lang}: ${r.status}`)
      return r.text()
    }))).then(([aff, dic]) => {
      const spell = nspell(aff, dic)
      for (const w of personal()) spell.add(w)
      loaded[lang].spell = spell
      view.dispatch({ effects: refresh.of(null) })
    }).catch((e) => console.warn(e))
  }
}

const SKIP = new Set(["FencedCode", "CodeBlock", "InlineCode", "CodeText", "URL", "HTMLTag", "HTMLBlock", "Comment", "CommentBlock", "Autolink", "LinkLabel", "ProcessingInstruction"])
const WORD = /[\p{L}][\p{L}'’]*[\p{L}]|[\p{L}]/gu
const mark = Decoration.mark({ class: "cm-misspelled" })

// Ranges the checker ignores: syntax nodes above plus maths, wikilinks and footnote labels.
function skipped(state, from, to) {
  const out = []
  syntaxTree(state).iterate({ from, to, enter: (n) => { if (SKIP.has(n.name)) { out.push([n.from, n.to]); return false } } })
  const text = state.sliceDoc(from, to)
  for (const m of text.matchAll(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\[\[[^\]]*\]\]|\[\^[^\]]*\]|https?:\/\/\S+|<[^>\n]+>/g)) out.push([from + m.index, from + m.index + m[0].length])
  return out
}

function misspelled(spells, word, before) {
  if (word.length < 2 || /\d/.test(word)) return false
  const w = word.replace(/’/g, "'").replace(/^'+|'+$/g, "")
  if (!w || /^\p{Lu}+$/u.test(w)) return false // acronyms
  if (/[^\p{Script=Latin}']/u.test(w)) return false // other scripts (Greek, CJK…)
  // a capitalised word not starting a sentence is probably a name
  if (/^\p{Lu}/u.test(w) && !/(^|[.!?:]\s*|^[\s#>*+\-\d.]*)$/.test(before)) return false
  return !spells.some((s) => s.correct(w))
}

function build(view) {
  const lang = view.state.facet(spellLang)
  const builder = new RangeSetBuilder()
  const spell = loaded[lang]?.spell
  if (!spell) return builder.finish()
  const spells = [spell, ...(lang === "es" && loaded.en?.spell ? [loaded.en.spell] : [])]
  for (const { from, to } of view.visibleRanges) {
    const skips = skipped(view.state, from, to)
    const text = view.state.sliceDoc(from, to)
    for (const m of text.matchAll(WORD)) {
      const start = from + m.index, end = start + m[0].length
      if (skips.some(([a, b]) => start < b && end > a)) continue
      const line = view.state.doc.lineAt(start)
      if (misspelled(spells, m[0], view.state.sliceDoc(line.from, start))) builder.add(start, end, mark)
    }
  }
  return builder.finish()
}

export const spellChecker = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = Decoration.none
    this.load(view)
  }
  load(view) {
    const lang = view.state.facet(spellLang)
    load(lang, view)
    if (lang === "es") load("en", view)
  }
  update(u) {
    if (u.startState.facet(spellLang) !== u.state.facet(spellLang)) this.load(u.view)
    if (u.docChanged || u.viewportChanged || u.transactions.some((t) => t.effects.some((e) => e.is(refresh))) || u.startState.facet(spellLang) !== u.state.facet(spellLang)) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => { this.decorations = build(u.view); u.view.dispatch({}) }, u.docChanged ? 400 : 0)
    }
  }
  destroy() { clearTimeout(this.timer) }
}, {
  decorations: (p) => p.decorations,
  eventHandlers: {
    contextmenu(e, view) {
      const el = e.target.closest?.(".cm-misspelled")
      if (!el) return false
      e.preventDefault()
      const pos = view.posAtDOM(el)
      const range = this.decorations.iter(pos)
      let from = pos, to = pos
      for (; range.value; range.next()) { if (range.from <= pos && range.to >= pos) { from = range.from; to = range.to; break } if (range.from > pos) break }
      menu(view, e.clientX, e.clientY, from, to)
      return true
    },
  },
})

// nspell misses swapped neighbours ("teh"), the commonest typo: try those first.
function suggest(spell, word) {
  const swaps = []
  for (let i = 0; i < word.length - 1; i++) {
    const w = word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2)
    if (w !== word && spell.correct(w)) swaps.push(w)
  }
  return [...new Set([...swaps, ...spell.suggest(word)])].slice(0, 6)
}

function menu(view, x, y, from, to) {
  document.querySelector(".spell-menu")?.remove()
  const lang = view.state.facet(spellLang)
  const spell = loaded[lang]?.spell
  const word = view.state.sliceDoc(from, to)
  if (!spell) return
  const el = document.createElement("div")
  el.className = "spell-menu"
  const suggestions = suggest(spell, word)
  el.innerHTML = (suggestions.length ? suggestions.map((s) => `<button data-s="${s.replace(/"/g, "&quot;")}">${s}</button>`).join("") : '<span class="muted">Sin sugerencias</span>') +
    `<hr><button data-add>Añadir «${word}» al diccionario</button>`
  Object.assign(el.style, { left: `${Math.min(x, innerWidth - 240)}px`, top: `${Math.min(y, innerHeight - 260)}px` })
  document.body.append(el)
  const close = () => { el.remove(); removeEventListener("mousedown", outside, true); removeEventListener("keydown", esc, true) }
  const outside = (e) => { if (!el.contains(e.target)) close() }
  const esc = (e) => { if (e.key === "Escape") close() }
  addEventListener("mousedown", outside, true)
  addEventListener("keydown", esc, true)
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button")
    if (!b) return
    if (b.dataset.s) view.dispatch({ changes: { from, to, insert: b.dataset.s } })
    else if (b.hasAttribute("data-add")) {
      const words = [...new Set([...personal(), word])]
      localStorage.setItem(WORDS_KEY, JSON.stringify(words))
      for (const l of Object.keys(loaded)) loaded[l].spell?.add(word)
      view.dispatch({ effects: refresh.of(null) })
    }
    close()
    view.focus()
  })
}

export const spellTheme = EditorView.baseTheme({
  ".cm-misspelled": { textDecoration: "underline wavy #d33", textUnderlineOffset: "3px", textDecorationSkipInk: "none" },
})
