// Track the heading above the reading position, including language changes.
;(() => {
  const sidebar = document.querySelector('.article-toc')
  if (!sidebar) return
  const wide = matchMedia('(min-width: 1280px)')
  const links = [...sidebar.querySelectorAll('.toc a')]
  const entries = links.map(link => ({
    link,
    heading: [...document.querySelectorAll('.prose h2[id], .prose h3[id]')]
      .find(heading => heading.id === decodeURIComponent(link.hash.slice(1)) &&
        heading.closest('.i18n')?.lang === link.closest('.i18n')?.lang)
  })).filter(entry => entry.heading)
  let scheduled = false
  let current
  function update() {
    scheduled = false
    const visible = entries.filter(entry => entry.heading.getClientRects().length)
    const offset = Math.max(
      (document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 32,
      visible[0] ? parseFloat(getComputedStyle(visible[0].heading).scrollMarginTop) + 2 : 0
    )
    let active = visible[0]
    for (const entry of visible) {
      if (entry.heading.getBoundingClientRect().top <= offset) active = entry
    }
    if (active === current) return
    current = active
    links.forEach(link => link.removeAttribute('aria-current'))
    if (!active) return
    active.link.setAttribute('aria-current', 'location')
    // Keep the current section visible without moving the article itself.
    if (wide.matches) {
      const item = active.link.getBoundingClientRect()
      const box = sidebar.getBoundingClientRect()
      if (item.top < box.top || item.bottom > box.bottom) {
        sidebar.scrollTop += item.top - box.top - sidebar.clientHeight / 2
      }
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update) }
  }
  function responsive() {
    sidebar.querySelectorAll('details').forEach(details => { details.open = wide.matches })
    schedule()
  }
  sidebar.addEventListener('toggle', () => {
    if (wide.matches) sidebar.querySelectorAll('details').forEach(details => { details.open = true })
  }, true)
  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule)
  document.querySelector('.prose')?.addEventListener('toggle', schedule, true)
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
  wide.addEventListener('change', responsive)
  responsive()
})()
