// Historical scan annotations are drawn over intact originals.
;(async function () {
  const response = await fetch('/data/feijoo-scan-annotations.json')
  if (!response.ok) return
  const annotations = await response.json()
  const hover = matchMedia('(hover: hover)').matches
  const records = new WeakMap()
  let active = null, pinned = false, timer
  const panel = document.createElement('div')
  panel.className = 'scan-hover-panel'
  panel.hidden = true
  panel.setAttribute('role', 'dialog')
  panel.setAttribute('aria-label', 'Pasaje del libro con subrayados')
  document.body.append(panel)

  function surface(src, alt, lines) {
    const span = document.createElement('span')
    span.className = 'scan-surface'
    const img = document.createElement('img')
    img.src = src; img.alt = alt; img.decoding = 'async'
    span.append(img)
    if (lines.length) {
      const ns = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(ns, 'svg')
      svg.setAttribute('viewBox', '0 0 1000 1000')
      svg.setAttribute('preserveAspectRatio', 'none')
      svg.setAttribute('aria-hidden', 'true')
      for (const [x1, x2, y] of lines) {
        const line = document.createElementNS(ns, 'line')
        for (const [key, value] of Object.entries({x1:x1*1000,x2:x2*1000,y1:y*1000,y2:y*1000})) line.setAttribute(key,value)
        svg.append(line)
      }
      span.append(svg)
    }
    return span
  }
  function close() {
    panel.hidden = true; pinned = false
    if (active) active.setAttribute('aria-expanded', 'false')
    active = null
  }
  function hideSoon() { clearTimeout(timer); if (!pinned) timer = setTimeout(close, 180) }
  function show(link, lock = false) {
    clearTimeout(timer)
    if (active && active !== link) active.setAttribute('aria-expanded', 'false')
    const {src, alt, cfg} = records.get(link)
    active = link; pinned = lock; link.setAttribute('aria-expanded','true')
    panel.replaceChildren()
    const bar = document.createElement('div'); bar.className = 'scan-preview-bar'
    const original = document.createElement('a'); original.href=src; original.target='_blank'; original.rel='noopener noreferrer'; original.textContent='Abrir original sin anotaciones'
    const button = document.createElement('button'); button.type='button'; button.textContent='Cerrar'; button.addEventListener('click',()=>{close();link.focus()})
    bar.append(original,button)
    panel.append(bar,surface(src,alt,cfg.lines))
    panel.hidden=false
    function position() {
      const rect=link.getBoundingClientRect(), margin=16
      panel.style.left = `${Math.max(margin, Math.min(rect.left, innerWidth-panel.offsetWidth-margin))}px`
      panel.style.top = `${lock ? margin : Math.max(margin, Math.min(rect.top+24, innerHeight-panel.offsetHeight-margin))}px`
    }
    position()
    panel.querySelector('img').addEventListener('load',position,{once:true})
    if (lock) button.focus({preventScroll:true})
  }
  for (const img of document.querySelectorAll('.prose img')) {
    const src=img.getAttribute('src') || ''
    const cfg=annotations[src.replace(/^\/data\//,'')]
    if (!cfg) continue
    const link=img.closest('a')
    if (!link) continue
    records.set(link,{src,alt:img.alt,cfg})
    link.classList.add('scan-marked'); link.setAttribute('aria-haspopup','dialog'); link.setAttribute('aria-expanded','false')
    if (cfg.auxiliary) {link.textContent=`Ver pasaje: ${img.alt}`;link.classList.add('scan-auxiliary')}
    else { const annotated=surface(src,img.alt,cfg.lines); annotated.querySelector("img").loading="lazy"; link.replaceChildren(annotated) }
    if (hover) link.addEventListener('mouseenter',()=>{clearTimeout(timer); if(!pinned) timer=setTimeout(()=>show(link),280)})
    link.addEventListener('mouseleave',hideSoon)
    link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();if(active===link&&pinned)close();else show(link,true)})
  }
  panel.addEventListener('mouseenter',()=>clearTimeout(timer))
  panel.addEventListener('mouseleave',hideSoon)
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})
  document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!e.target.closest('.scan-marked'))close()})
  window.addEventListener('resize',close)
})().catch(error=>console.warn('Scan previews unavailable:',error))
