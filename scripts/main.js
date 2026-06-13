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
