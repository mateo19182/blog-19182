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

// Language toggle. The pre-paint script sets <html lang> from the saved choice;
// the button is disabled on pages that only exist in one language. A translated
// article's notice has its own button back to the original.
;(function () {
  document.querySelectorAll(".lang-toggle:not(:disabled), .lang-switch").forEach(btn => btn.addEventListener("click", function () {
    const root = document.documentElement
    const next = root.lang === "es" ? "en" : "es"
    root.lang = next
    document.title = next === "es" ? root.dataset.esTitle : root.dataset.enTitle
    try {
      localStorage.setItem("lang", next)
    } catch (e) {}
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
