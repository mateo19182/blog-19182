// Open prose images that are shown smaller than their real size in a full-view
// dialog. Annotated scans are cloned with their overlay. Click the image to see
// it at full size, anywhere else (or Esc) to close.
;(function () {
  const images = [...document.querySelectorAll(".prose img:not(.favicon)")].filter(img => !img.closest("a"))
  if (!images.length) return
  const es = () => document.documentElement.lang === "es"

  const dialog = document.createElement("dialog")
  dialog.className = "lightbox"
  dialog.innerHTML = '<button type="button" class="lightbox-close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><figure><div class="lightbox-media"></div><figcaption></figcaption></figure>'
  document.body.append(dialog)
  const media = dialog.querySelector(".lightbox-media")
  const caption = dialog.querySelector("figcaption")
  const close = dialog.querySelector(".lightbox-close")

  function bigger(img) {
    return img.complete && img.clientWidth > 0 &&
      (img.naturalWidth > img.clientWidth * 1.1 || img.naturalHeight > img.clientHeight * 1.1)
  }
  function mark(img) {
    const on = bigger(img)
    img.classList.toggle("zoomable", on)
    if (on) {
      img.tabIndex = 0
      img.setAttribute("role", "button")
      img.setAttribute("aria-label", (es() ? "Ampliar imagen" : "Enlarge image") + (img.alt ? ": " + img.alt : ""))
    } else if (img.getAttribute("role") === "button") {
      img.removeAttribute("tabindex")
      img.removeAttribute("role")
      img.removeAttribute("aria-label")
    }
  }
  const resized = new ResizeObserver(entries => entries.forEach(e => mark(e.target)))
  images.forEach(img => {
    resized.observe(img)
    img.addEventListener("load", () => mark(img))
  })
  new MutationObserver(() => images.forEach(mark)).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] })

  function open(img) {
    const surface = img.parentElement.classList.contains("scan-surface") ? img.parentElement : null
    const copy = (surface || img).cloneNode(true)
    const big = surface ? copy.querySelector("img") : copy
    big.classList.remove("zoomable")
    for (const attr of ["tabindex", "role", "aria-label", "loading", "width", "height", "style"]) big.removeAttribute(attr)
    big.src = img.currentSrc || img.src
    media.replaceChildren(copy)
    const figcaption = (surface || img).closest("figure")?.querySelector("figcaption")
    caption.innerHTML = figcaption ? figcaption.innerHTML : ""
    if (!figcaption) caption.textContent = img.alt
    close.setAttribute("aria-label", es() ? "Cerrar" : "Close")
    dialog.setAttribute("aria-label", img.alt || (es() ? "Imagen" : "Image"))
    dialog.classList.remove("is-zoomed")
    dialog.showModal()
    dialog.style.setProperty("--caption-h", caption.offsetHeight + "px")
    const zoomable = () => dialog.classList.toggle("can-zoom", bigger(big))
    big.complete ? zoomable() : big.addEventListener("load", zoomable, { once: true })
    dialog.scrollTo(0, 0)
  }

  function zoom(e) {
    const img = media.querySelector("img")
    const before = img.getBoundingClientRect()
    const fx = (e.clientX - before.left) / before.width
    const fy = (e.clientY - before.top) / before.height
    dialog.classList.toggle("is-zoomed")
    const after = img.getBoundingClientRect()
    dialog.scrollLeft += after.left + fx * after.width - e.clientX
    dialog.scrollTop += after.top + fy * after.height - e.clientY
  }

  document.addEventListener("click", e => {
    const img = e.target.closest?.(".prose img.zoomable")
    if (img && !img.closest("a")) open(img)
  })
  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".prose img.zoomable")) {
      e.preventDefault()
      open(e.target)
    }
  })
  dialog.addEventListener("click", e => {
    if (e.target.closest("figcaption a")) return
    if (e.target.closest(".lightbox-media") && (dialog.classList.contains("can-zoom") || dialog.classList.contains("is-zoomed"))) zoom(e)
    else if (!e.target.closest("figcaption")) dialog.close()
  })
  close.addEventListener("click", e => { e.stopPropagation(); dialog.close() })
  dialog.addEventListener("close", () => media.replaceChildren())
})()
