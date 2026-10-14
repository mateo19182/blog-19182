// Site search over the Pagefind index (built by build.mjs into /pagefind/).
// The header button, "/" and Ctrl/Cmd-K open a dialog; the index loads on first open.
;(function () {
  const root = document.documentElement
  const TEXT = {
    placeholder: ["Search", "Buscar"],
    empty: ["No results", "Sin resultados"],
    more: ["More results", "Más resultados"],
    failed: ["Search is unavailable", "La búsqueda no está disponible"],
    hint: ["↑↓ to move · ↵ to open · esc to close", "↑↓ para moverte · ↵ para abrir · esc para cerrar"],
  }
  const PAGE = 8
  const es = () => root.lang === "es"
  const tr = (key) => TEXT[key][es() ? 1 : 0]

  let dialog, input, list, status, more, hint
  let pagefind = null
  let found = [] // pagefind results for the current query
  let loaded = 0 // how many of them have their data loaded
  let items = [] // loaded results, one per page
  let active = -1
  let query = ""

  function create() {
    dialog = document.createElement("dialog")
    dialog.className = "search-dialog"
    dialog.innerHTML = `<div class="search-box">
  <label class="search-field">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
    <input type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-results" autocomplete="off" spellcheck="false" enterkeyhint="search">
  </label>
  <p class="search-status" role="status" aria-live="polite"></p>
  <div class="search-scroll">
    <ol class="search-results" id="search-results" role="listbox"></ol>
    <button type="button" class="search-more" hidden></button>
  </div>
  <p class="search-hint" aria-hidden="true"></p>
</div>`
    document.body.append(dialog)
    input = dialog.querySelector("input")
    list = dialog.querySelector(".search-results")
    status = dialog.querySelector(".search-status")
    more = dialog.querySelector(".search-more")
    hint = dialog.querySelector(".search-hint")

    input.addEventListener("input", () => search(input.value))
    input.addEventListener("keydown", onKey)
    more.addEventListener("click", () => loadMore().then(() => input.focus()))
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close() })
    list.addEventListener("mousemove", (e) => {
      const li = e.target.closest("li")
      if (li) select(items.indexOf(li._item), false)
    })
  }

  async function load() {
    if (pagefind) return pagefind
    const pf = await import("/pagefind/pagefind.js")
    await pf.options({ excerptLength: 22 })
    await pf.init()
    return (pagefind = pf)
  }

  function open() {
    if (!dialog) create()
    if (dialog.open) return
    input.placeholder = tr("placeholder")
    input.setAttribute("aria-label", tr("placeholder"))
    more.textContent = tr("more")
    hint.textContent = tr("hint")
    dialog.showModal()
    input.select()
    load().then(() => search(input.value), () => setStatus(tr("failed")))
  }

  function setStatus(text) {
    status.textContent = text
  }

  async function search(q) {
    query = q.trim()
    if (!pagefind) return
    if (!query) return show([])
    const res = await pagefind.debouncedSearch(query, {}, 120)
    if (res === null || q.trim() !== query) return
    found = res.results
    loaded = 0
    items = []
    active = 0
    await loadMore(q.trim())
  }

  async function loadMore(q = query) {
    const batch = found.slice(loaded, loaded + PAGE)
    const data = await Promise.all(batch.map((r) => r.data()))
    if (q !== query) return
    loaded += batch.length
    for (const d of data) add(d)
    // Keep filling while duplicates (the other language of a page) ate the batch.
    if (items.length < PAGE && loaded < found.length) return loadMore(q)
    show(items)
  }

  const fold = (s) => s.normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()

  // Pagefind also matches index words that are mere prefixes of a query word
  // ("bloop" finds "B."); drop results whose only matches are such fragments.
  function relevant(d) {
    const terms = query.split(/\s+/).map(fold).filter(Boolean)
    const html = [d.excerpt, ...(d.sub_results || []).map((s) => s.excerpt)].join(" ")
    const marks = [...html.matchAll(/<mark>(.*?)<\/mark>/g)].map((m) => fold(m[1]))
    return marks.some((m) => terms.some((t) => {
      let n = 0
      while (n < m.length && m[n] === t[n]) n++
      return n >= Math.min(t.length, 3)
    }))
  }

  // A page can match in both languages: keep one entry, preferring the UI language.
  function add(d) {
    if (!relevant(d)) return
    const lang = d.meta.lang
    const path = d.url.replace(/\?.*$/, "")
    const prev = items.find((it) => it.path === path)
    const item = { path, lang, data: d }
    if (!prev) items.push(item)
    else if (lang === root.lang && prev.lang !== root.lang) items[items.indexOf(prev)] = item
  }

  function show(list_) {
    list.replaceChildren(...list_.map(render))
    more.hidden = loaded >= found.length || !query
    setStatus(query && !list_.length && loaded >= found.length ? tr("empty") : "")
    input.setAttribute("aria-expanded", String(list_.length > 0))
    select(list_.length ? Math.max(0, Math.min(active, list_.length - 1)) : -1, false)
  }

  function render(item, i) {
    const d = item.data
    // The best-matching section, when it is one of the page's headings.
    const sub = (d.sub_results || []).find((s) => s.anchor && s.anchor.element !== "h1")
    const best = sub && d.sub_results[0] === sub ? sub : null
    const li = document.createElement("li")
    li.id = `search-result-${i}`
    li.setAttribute("role", "option")
    li._item = item
    const a = document.createElement("a")
    a.href = best ? best.url : d.url
    a.tabIndex = -1
    const head = document.createElement("span")
    head.className = "search-result-head"
    const title = document.createElement("span")
    title.className = "search-result-title"
    title.textContent = d.meta.title
    head.append(title)
    if (best) {
      const section = document.createElement("span")
      section.className = "search-result-section"
      section.textContent = best.title
      head.append(section)
    }
    if (item.lang !== root.lang) {
      const tag = document.createElement("span")
      tag.className = "search-result-lang"
      tag.lang = item.lang
      tag.textContent = item.lang.toUpperCase()
      head.append(tag)
    }
    if (d.meta.date) {
      const date = document.createElement("span")
      date.className = "search-result-date"
      date.textContent = d.meta.date.slice(0, 4)
      head.append(date)
    }
    const excerpt = document.createElement("span")
    excerpt.className = "search-result-excerpt"
    excerpt.innerHTML = (best || d).excerpt // Pagefind escapes the text and adds <mark>
    if (!best) dropLeading(excerpt, d.meta.title)
    a.append(head, excerpt)
    li.append(a)
    return li
  }

  // The indexed text starts with the title (or its tail, when Pagefind trims the
  // excerpt's start); don't repeat it under the title.
  function dropLeading(el, title) {
    const text = el.textContent
    const words = title.split(" ")
    const tail = words.map((_, i) => words.slice(i).join(" ")).find((t) => t.length > 3 && text.startsWith(t))
    if (!tail || text.length < tail.length + 40) return
    let n = tail.length + (/^[.:]/.test(text.slice(tail.length)) ? 1 : 0)
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walk.nextNode()) nodes.push(walk.currentNode)
    for (const node of nodes) {
      if (n <= 0) break
      const cut = Math.min(n, node.data.length)
      node.data = node.data.slice(cut)
      n -= cut
      if (!node.data && node.parentNode !== el) node.parentNode.remove()
    }
    const first = el.firstChild
    if (first?.nodeType === Node.TEXT_NODE) first.data = first.data.trimStart()
  }

  function select(i, scroll = true) {
    active = i
    const lis = list.children
    for (let j = 0; j < lis.length; j++) lis[j].setAttribute("aria-selected", String(j === i))
    if (i < 0) return input.removeAttribute("aria-activedescendant")
    input.setAttribute("aria-activedescendant", lis[i].id)
    if (scroll) lis[i].scrollIntoView({ block: "nearest" })
  }

  function onKey(e) {
    const n = list.children.length
    if (e.key === "ArrowDown" && n) select((active + 1) % n)
    else if (e.key === "ArrowUp" && n) select((active - 1 + n) % n)
    else if (e.key === "Enter" && active >= 0) {
      const a = list.children[active].querySelector("a")
      if (e.metaKey || e.ctrlKey) return window.open(a.href, "_blank")
      return (location.href = a.href)
    } else return
    e.preventDefault()
  }

  function typing(el) {
    return el.closest?.("input, textarea, select, [contenteditable]:not([contenteditable=false])")
  }

  document.addEventListener("keydown", (e) => {
    const k = (e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k"
    const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target)
    if (!k && !slash) return
    e.preventDefault()
    if (k && dialog?.open) dialog.close()
    else open()
  })
  document.querySelectorAll(".search-toggle").forEach((btn) => btn.addEventListener("click", open))
})()
