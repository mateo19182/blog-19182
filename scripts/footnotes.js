// Footnotes — progressive enhancement over markdown-it-footnote output.
//   wide screens (≥1400px) → Tufte-style sidenotes cloned into the right margin
//   hover-capable, narrower → hover preview popover next to the [n] marker
//   touch / no JS         → plain bracketed [n] anchors that jump to the
//                           bottom list, which CSS :target highlights
;(function () {
  const WIDE = "(min-width: 1400px)"
  const prose = document.querySelector("article.prose")
  if (!prose) return
  const refs = [...prose.querySelectorAll(".footnote-ref > a[href^='#fn']")]
  if (!refs.length) return

  // A footnote's inner HTML from the bottom list, minus the ↩︎ backref.
  function noteHtml(id) {
    const li = document.getElementById(id)
    if (!li) return null
    const clone = li.cloneNode(true)
    clone.querySelectorAll(".footnote-backref").forEach((el) => el.remove())
    return clone.innerHTML.trim()
  }

  // ---- Tier 3: margin sidenotes -------------------------------------------
  let sidenotes = []

  function buildSidenotes() {
    teardownSidenotes()
    for (const a of refs) {
      const html = noteHtml(a.getAttribute("href").slice(1))
      if (!html) continue
      const num = a.textContent.replace(/[[\]]/g, "")
      const aside = document.createElement("aside")
      aside.className = "sidenote"
      aside.innerHTML = `<sup class="sidenote-num">${num}</sup>${html}`
      prose.appendChild(aside)
      sidenotes.push({ aside, ref: a })
    }
    prose.classList.add("has-sidenotes")
    positionSidenotes()
  }

  // Place each note level with its marker, pushing later ones down so stacked
  // notes never overlap.
  function positionSidenotes() {
    const proseTop = prose.getBoundingClientRect().top + window.scrollY
    let lastBottom = 0
    for (const { aside, ref } of sidenotes) {
      const refTop = ref.getBoundingClientRect().top + window.scrollY - proseTop
      const top = Math.max(refTop, lastBottom)
      aside.style.top = top + "px"
      lastBottom = top + aside.offsetHeight + 14
    }
  }

  function teardownSidenotes() {
    sidenotes.forEach(({ aside }) => aside.remove())
    sidenotes = []
    prose.classList.remove("has-sidenotes")
  }

  // ---- Tier 2: hover preview popover --------------------------------------
  let pop = null
  let hideTimer = null

  function ensurePop() {
    if (pop) return pop
    pop = document.createElement("div")
    pop.className = "popover footnote-popover"
    pop.addEventListener("mouseenter", () => clearTimeout(hideTimer))
    pop.addEventListener("mouseleave", hidePop)
    document.body.appendChild(pop)
    return pop
  }

  function showPop(a) {
    const html = noteHtml(a.getAttribute("href").slice(1))
    if (!html) return
    const p = ensurePop()
    p.innerHTML = `<div class="popover-body">${html}</div>`
    // measure, then place above the marker (flip below if it would clip the top)
    p.style.left = "0px"
    p.style.top = "0px"
    p.classList.add("visible")
    const r = a.getBoundingClientRect()
    const pw = p.offsetWidth
    const ph = p.offsetHeight
    const margin = 12
    let left = r.left + r.width / 2 - pw / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - pw - margin))
    let top = r.top - ph - 8
    if (top < margin) top = r.bottom + 8 // not enough room above → drop below
    p.style.left = left + "px"
    p.style.top = top + "px"
  }

  function hidePop() {
    hideTimer = setTimeout(() => pop && pop.classList.remove("visible"), 120)
  }

  // Listeners attached once; they no-op unless we're in popover mode.
  let mode = "" // "side" | "pop" | "none"
  for (const a of refs) {
    a.addEventListener("mouseenter", () => {
      if (mode !== "pop") return
      clearTimeout(hideTimer)
      showPop(a)
    })
    a.addEventListener("mouseleave", () => {
      if (mode !== "pop") return
      hidePop()
    })
  }

  // ---- mode switching ------------------------------------------------------
  function refresh() {
    const wasSide = mode === "side"
    if (window.matchMedia(WIDE).matches) mode = "side"
    else mode = window.matchMedia("(hover: none)").matches ? "none" : "pop"

    if (mode === "side") buildSidenotes()
    else if (wasSide) teardownSidenotes()
  }

  refresh()
  // images/fonts can change note heights after first paint → re-measure
  window.addEventListener("load", () => mode === "side" && positionSidenotes())
  let resizeTimer = null
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(refresh, 150)
  })
})()
