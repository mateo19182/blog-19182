// Footnotes — progressive enhancement over markdown-it-footnote output.
// On hover-capable screens, hovering a [n] marker previews the note in a
// popover next to it. With JS off or on touch, the bracketed [n] anchors just
// jump to the bottom list, which CSS :target highlights.
;(function () {
  if (matchMedia("(hover: none)").matches) return // touch → plain anchor jump

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

  let pop = null
  let hideTimer = null

  function ensurePop() {
    if (pop) return pop
    pop = document.createElement("div")
    pop.className = "popover footnote-popover"
    pop.addEventListener("mouseenter", () => clearTimeout(hideTimer))
    pop.addEventListener("mouseleave", hide)
    document.body.appendChild(pop)
    return pop
  }

  function show(a) {
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

  function hide() {
    hideTimer = setTimeout(() => pop && pop.classList.remove("visible"), 120)
  }

  for (const a of refs) {
    a.addEventListener("mouseenter", () => {
      clearTimeout(hideTimer)
      show(a)
    })
    a.addEventListener("mouseleave", hide)
  }
})()
