// Dark-mode toggle. The pre-paint inline script in <head> sets the initial
// theme; this just wires the button and persists the choice.
;(function () {
  const btn = document.getElementById("theme-toggle")
  if (!btn) return
  btn.addEventListener("click", function () {
    const root = document.documentElement
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark"
    root.setAttribute("data-theme", next)
    try {
      localStorage.setItem("theme", next)
    } catch (e) {}
  })
})()

// On the site each language has its own URL and the toggle is a link. The
// editor preview holds both languages in one page; these buttons switch it.
;(function () {
  document.querySelectorAll("button.lang-toggle:not(:disabled), button.lang-switch").forEach(btn => btn.addEventListener("click", function () {
    const root = document.documentElement
    const next = root.lang === "es" ? "en" : "es"
    root.lang = next
    document.title = next === "es" ? root.dataset.esTitle : root.dataset.enTitle
  }))
})()

// Hide after deliberate downward scrolling, reveal on upward scrolling.
;(function () {
  const header = document.querySelector(".site-header")
  if (!header) return
  let previous = Math.max(0, scrollY)
  let travel = 0
  let queued = false
  addEventListener("scroll", () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      const current = Math.max(0, scrollY)
      const delta = current - previous
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta
      if (current < 80 || travel < -12) header.classList.remove("is-hidden")
      else if (travel > 24) header.classList.add("is-hidden")
      previous = current
      queued = false
    })
  }, { passive: true })
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"))
})()

// Both language slots share heading ids; jump to the copy that is visible.
;(function () {
  function reveal() {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    const all = document.querySelectorAll(`[id="${CSS.escape(id)}"]`)
    const visible = [...all].find((el) => el.getClientRects().length)
    if (visible && visible !== all[0]) visible.scrollIntoView()
  }
  reveal()
  addEventListener("hashchange", reveal)
})()
