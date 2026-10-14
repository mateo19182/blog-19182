// Clicking a heading copies its link and puts it in the address bar without
// scrolling. The § beside it turns into a check mark for a moment.
;(function () {
  document.addEventListener("click", e => {
    const link = e.target.closest?.(".prose .header-anchor")
    if (!link || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    history.replaceState(history.state, "", link.hash)
    navigator.clipboard?.writeText(link.href).then(() => {
      link.classList.add("copied")
      clearTimeout(link.copiedTimer)
      link.copiedTimer = setTimeout(() => link.classList.remove("copied"), 1500)
    }, () => {})
  })
})()
