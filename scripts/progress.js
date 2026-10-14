// A thin line at the top of the viewport showing how far through the article you are.
;(() => {
  const bar = document.querySelector('.reading-progress')
  const prose = document.querySelector('.article-page .prose')
  if (!bar || !prose) return
  let scheduled = false
  function update() {
    scheduled = false
    const box = prose.getBoundingClientRect()
    const span = box.height - innerHeight
    const progress = span > 0 ? -box.top / span : box.bottom <= innerHeight ? 1 : 0
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update) }
  }
  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule)
  // language switches, opened <details> and late images all change the length
  new ResizeObserver(schedule).observe(prose)
  update()
})()
