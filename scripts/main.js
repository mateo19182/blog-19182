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
// the button is disabled on pages that only exist in English.
;(function () {
  const btn = document.getElementById("lang-toggle")
  if (!btn || btn.disabled) return
  btn.addEventListener("click", function () {
    const root = document.documentElement
    const next = root.lang === "es" ? "en" : "es"
    root.lang = next
    document.title = next === "es" ? root.dataset.esTitle : root.dataset.enTitle
    try {
      localStorage.setItem("lang", next)
    } catch (e) {}
  })
})()
