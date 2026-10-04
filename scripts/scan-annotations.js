// Draw annotations over historical originals without interactive previews.
;(async function () {
  const response = await fetch('/data/feijoo-scan-annotations.json')
  if (!response.ok) return
  const annotations = await response.json()
  for (const img of document.querySelectorAll('.prose img')) {
    const key = (img.getAttribute('src') || '').replace(/^\/data\//, '')
    const cfg = annotations[key]
    if (!cfg || !cfg.lines.length) continue
    const surface = document.createElement('span')
    surface.className = 'scan-surface'
    img.replaceWith(surface)
    surface.append(img)
    const ns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('viewBox', '0 0 1000 1000')
    svg.setAttribute('preserveAspectRatio', 'none')
    svg.setAttribute('aria-hidden', 'true')
    for (const [x1, x2, y] of cfg.lines) {
      const line = document.createElementNS(ns, 'line')
      for (const [key, value] of Object.entries({x1:x1*1000,x2:x2*1000,y1:y*1000,y2:y*1000})) line.setAttribute(key,value)
      svg.append(line)
    }
    surface.append(svg)
  }
})().catch(error => console.warn('Scan annotations unavailable:', error))
