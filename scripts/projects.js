// Tag filter for the projects page. Chips and #tags link to /projects?tag=x, so
// without JS they just reload the full list; with JS they filter in place, keep
// the URL in sync, hide year headings left with no projects and re-alternate the
// thumbnail sides over the visible rows. Both language
// copies of the list are filtered together.
;(function () {
  const lists = document.querySelectorAll(".project-list")
  if (!lists.length) return

  function apply(tag) {
    for (const chip of document.querySelectorAll(".project-chip")) {
      if (chip.dataset.tag === tag) chip.setAttribute("aria-current", "true")
      else chip.removeAttribute("aria-current")
    }
    for (const list of lists) {
      list.classList.add("js")
      let heading = null
      let shown = 0
      let prev = null
      let thumbs = 0
      const close = () => heading && (heading.hidden = shown === 0)
      for (const el of list.children) {
        if (el.classList.contains("project-year")) {
          close()
          heading = el
          shown = 0
          prev = null
        } else {
          const ok = !tag || el.dataset.tags.split(" ").includes(tag)
          el.hidden = !ok
          if (!ok) continue
          el.classList.toggle("project-sep", !!prev)
          if (el.classList.contains("project-has-thumb")) el.classList.toggle("project-flip", thumbs++ % 2 === 0)
          prev = el
          shown++
        }
      }
      close()
    }
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest(".project-filter a, .project-tags a")
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const tag = link.dataset.tag
    history.replaceState(null, "", tag ? `?tag=${tag}` : location.pathname)
    apply(tag)
    if (link.closest(".project-tags")) document.querySelector(".project-filter")?.scrollIntoView({ block: "nearest" })
  })

  apply(new URLSearchParams(location.search).get("tag") || "")
})()
