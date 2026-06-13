// Hover previews for internal links (like the old Quartz popovers).
// On hover over a same-site page link, fetch it, pull out the article body,
// and show it in a small floating card near the link.
;(function () {
  if (matchMedia("(hover: none)").matches) return // skip on touch devices

  const cache = new Map()
  let popover = null
  let showTimer = null
  let hideTimer = null
  let activeLink = null

  function isInternalPage(a) {
    const href = a.getAttribute("href") || ""
    if (!href.startsWith("/")) return false // external or relative anchor
    if (href.startsWith("//")) return false
    if (href.startsWith("#")) return false
    if (/\.(png|jpe?g|gif|svg|webp|pdf|xml|md|txt|ico|avif)$/i.test(href.split("#")[0])) return false
    if (href.startsWith("/static") || href.startsWith("/data")) return false
    // don't preview a link to the page we're already on
    if (href.split("#")[0].replace(/\/$/, "") === location.pathname.replace(/\/$/, "")) return false
    return true
  }

  async function fetchContent(href) {
    if (cache.has(href)) return cache.get(href)
    const p = fetch(href)
      .then((r) => (r.ok ? r.text() : null))
      .then((html) => {
        if (!html) return null
        const doc = new DOMParser().parseFromString(html, "text/html")
        const article = doc.querySelector("article.prose")
        if (!article) return null
        article.querySelectorAll("script, .archive-filter, iframe").forEach((el) => el.remove())
        const titleEl = doc.querySelector(".article-title")
        const title = titleEl ? titleEl.textContent : (doc.querySelector("title")?.textContent || "").split(" · ")[0]
        return { title, body: article.innerHTML }
      })
      .catch(() => null)
    cache.set(href, p)
    return p
  }

  function ensurePopover() {
    if (popover) return popover
    popover = document.createElement("div")
    popover.className = "popover"
    popover.addEventListener("mouseenter", () => clearTimeout(hideTimer))
    popover.addEventListener("mouseleave", hide)
    document.body.appendChild(popover)
    return popover
  }

  function position(link) {
    const r = link.getBoundingClientRect()
    const pop = popover
    pop.style.visibility = "hidden"
    pop.classList.add("visible")
    const pw = pop.offsetWidth
    const ph = pop.offsetHeight
    const margin = 10
    let left = r.left
    let top = r.bottom + 8
    if (left + pw > window.innerWidth - margin) left = window.innerWidth - pw - margin
    if (left < margin) left = margin
    if (top + ph > window.innerHeight - margin) top = r.top - ph - 8 // flip above
    if (top < margin) top = margin
    pop.style.left = left + "px"
    pop.style.top = top + "px"
    pop.style.visibility = ""
  }

  async function show(link) {
    const href = link.getAttribute("href")
    const data = await fetchContent(href)
    if (!data || activeLink !== link) return
    const pop = ensurePopover()
    pop.innerHTML =
      (data.title ? `<div class="popover-title">${data.title}</div>` : "") +
      `<div class="popover-body">${data.body}</div>`
    position(link)
    requestAnimationFrame(() => pop.classList.add("visible"))
  }

  function hide() {
    clearTimeout(showTimer)
    hideTimer = setTimeout(() => {
      if (popover) popover.classList.remove("visible")
      activeLink = null
    }, 120)
  }

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest("a")
    if (!a || !isInternalPage(a) || a.closest(".popover")) return
    if (a === activeLink) {
      clearTimeout(hideTimer)
      return
    }
    activeLink = a
    clearTimeout(hideTimer)
    clearTimeout(showTimer)
    showTimer = setTimeout(() => show(a), 280)
  })

  document.addEventListener("mouseout", (e) => {
    const a = e.target.closest("a")
    if (a && a === activeLink) hide()
  })
})()
