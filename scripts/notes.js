// Footnotes and link previews on article pages.
// From 1240px each footnote sits in the right margin next to its reference;
// below that, hovering (or tapping) a reference shows the note in a popover.
// Links to other writings preview that post on hover (fine pointers only).
;(() => {
  const prose = document.querySelector('.article-page .prose')
  if (!prose) return
  const root = document.documentElement
  const wide = matchMedia('(min-width: 1240px)')
  const slots = prose.querySelector(':scope > .i18n') ? [...prose.querySelectorAll(':scope > .i18n')] : [prose]
  const lang = el => (el.closest('[lang]') || root).lang === 'es' ? 'es' : 'en'
  const noteFor = a => document.getElementById(decodeURIComponent(a.hash.slice(1)))
  let pointer = 'mouse'
  let lastY = 0

  // Contents of a footnote without its back-links, number first.
  function noteBody(li, num) {
    const frag = document.createDocumentFragment()
    for (const child of li.children) frag.append(child.cloneNode(true))
    frag.querySelectorAll('.footnote-backref').forEach(el => el.remove())
    frag.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'))
    const n = document.createElement('span')
    n.className = 'note-num'
    n.textContent = num
    const first = frag.firstElementChild
    if (first?.tagName === 'P') first.prepend(n, ' ')
    else frag.prepend(n)
    return frag
  }

  // ---- sidenotes -----------------------------------------------------------
  let notes = [] // { aside, body, ref, mark, base, slot, open, more }
  let observer = null
  let queued = false

  function build() {
    if (notes.length) return
    for (const slot of slots) {
      const items = [...slot.querySelectorAll('.footnotes-list > li[id]')]
      const refs = [...slot.querySelectorAll('.footnote-ref > a[href^="#fn"]')]
      const placed = items.map(li => {
        const ref = refs.find(a => noteFor(a) === li)
        if (!ref) return null
        const aside = document.createElement('aside')
        aside.className = 'sidenote'
        aside.dataset.note = li.id
        aside.setAttribute('data-pagefind-ignore', '')
        const body = document.createElement('div')
        body.className = 'sidenote-body'
        body.append(noteBody(li, ref.textContent.trim()))
        aside.append(body)
        // Zero-size marks give the baselines of the reference line and the note.
        const mark = document.createElement('span')
        mark.className = 'sn-mark'
        ref.parentElement.after(mark)
        const base = document.createElement('span')
        base.className = 'sn-base'
        ;(body.querySelector('.note-num') || body).before(base)
        slot.append(aside)
        return { aside, body, ref, mark, base, slot }
      })
      notes.push(...placed.filter(Boolean))
      if (placed.length && placed.every(Boolean)) slot.classList.add('has-sidenotes')
    }
    observer = new ResizeObserver(schedule)
    observer.observe(prose)
    schedule()
    if (/^#fn/.test(location.hash)) {
      const target = notes.find(n => '#' + n.aside.dataset.note === decodeURIComponent(location.hash))
      if (target) requestAnimationFrame(() => {
        layout()
        target.aside.scrollIntoView({ block: 'center' })
        flash(target)
      })
    }
  }

  function teardown() {
    observer?.disconnect()
    for (const n of notes) { n.aside.remove(); n.mark.remove() }
    slots.forEach(slot => { slot.classList.remove('has-sidenotes'); slot.style.paddingBottom = '' })
    notes = []
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(layout) }
  }

  // Each note starts on its reference's baseline, below the previous note and
  // clear of tables, figures or code that reach into the margin.
  function layout() {
    queued = false
    for (const slot of slots) {
      const mine = notes.filter(n => n.slot === slot)
      if (!mine.length || !slot.getClientRects().length) continue
      const top0 = slot.getBoundingClientRect().top
      const gap = parseFloat(getComputedStyle(mine[0].aside).fontSize) * 0.9
      const edge = mine[0].aside.getBoundingClientRect().left - 4
      const blocks = [...slot.children]
        .filter(el => !el.classList.contains('sidenote') && el.getClientRects().length)
        .map(el => el.getBoundingClientRect())
        .filter(r => r.right > edge && r.height)
        .map(r => [r.top - top0 - gap, r.bottom - top0 + gap])
      const wanted = mine.map(n => {
        n.aside.classList.toggle('is-long', false)
        const anchor = n.ref.getClientRects().length ? n.mark : n.ref.closest('details') || n.mark
        const m = anchor.getBoundingClientRect()
        const b = n.base.getBoundingClientRect()
        const ratio = baselineRatio(n)
        const line = anchor === n.mark ? m.top + m.height * ratio : m.top
        return { n, want: line - top0 - (b.bottom - n.aside.getBoundingClientRect().top) }
      }).sort((a, b) => a.want - b.want)
      let y = -Infinity
      for (const { n, want } of wanted) {
        const lineH = parseFloat(getComputedStyle(n.aside).lineHeight)
        if (!n.open && n.body.scrollHeight > lineH * 16) n.aside.classList.add('is-long')
        ensureMore(n)
        const h = n.aside.offsetHeight
        let top = Math.max(want, y + gap)
        for (let moved = true; moved;) {
          moved = false
          for (const [a, b] of blocks) {
            if (top >= b || top + h <= a) continue
            // Finish just above the block if the note still reaches its reference
            // line (or moves only a few lines); otherwise continue below the block.
            const up = a - h
            const near = top - up < lineH * 5 || up + h >= want + lineH
            top = near && up >= y + gap && !blocks.some(([c, d]) => up < d && up + h > c) ? up : b
            moved = top !== up
          }
        }
        n.aside.style.top = top + 'px'
        y = top + h
      }
      const extra = Math.max(0, y - slot.offsetHeight + parseFloat(slot.style.paddingBottom || 0))
      slot.style.paddingBottom = extra ? extra + 'px' : ''
    }
  }

  // Where the baseline sits inside a text box of the note font (same family as
  // the prose): measured once from the note's own marks.
  let ratio = 0
  function baselineRatio(n) {
    if (ratio) return ratio
    const probe = document.createElement('span')
    n.base.after(probe)
    const p = probe.getBoundingClientRect()
    ratio = p.height ? (n.base.getBoundingClientRect().bottom - p.top) / p.height : 0.78
    probe.remove()
    return ratio
  }

  function ensureMore(n) {
    const long = n.aside.classList.contains('is-long') || n.open
    if (!long) return n.more?.remove()
    if (!n.more) {
      n.more = document.createElement('button')
      n.more.type = 'button'
      n.more.className = 'sidenote-more'
      n.more.addEventListener('click', () => { n.open = !n.open; layout() })
    }
    const es = lang(n.slot) === 'es'
    n.more.textContent = n.open ? (es ? 'menos' : 'less') : (es ? 'más' : 'more')
    n.more.setAttribute('aria-expanded', !!n.open)
    if (!n.more.isConnected) n.aside.append(n.more)
  }

  function flash(n) {
    n.aside.classList.remove('is-flash')
    void n.aside.offsetWidth
    n.aside.classList.add('is-flash')
  }

  function setActive(ref, on) {
    const id = decodeURIComponent(ref.hash.slice(1))
    const n = notes.find(x => x.aside.dataset.note === id)
    if (!n) return
    n.aside.classList.toggle('is-active', on)
    prose.querySelectorAll(`.footnote-ref > a[href="${CSS.escape(ref.getAttribute('href'))}"]`)
      .forEach(a => a.classList.toggle('is-active', on))
  }

  // ---- popover ---------------------------------------------------------------
  const pop = document.createElement('div')
  pop.className = 'note-pop'
  pop.id = 'note-pop'
  pop.setAttribute('role', 'tooltip')
  pop.setAttribute('data-pagefind-ignore', '')
  document.body.append(pop)
  let owner = null // trigger of the open popover
  let pending = null // trigger waiting for its delay
  let openTimer = 0
  let closeTimer = 0

  function place(trigger) {
    const rects = [...trigger.getClientRects()]
    const r = rects.reduce((best, x) => Math.abs((x.top + x.bottom) / 2 - lastY) < Math.abs((best.top + best.bottom) / 2 - lastY) ? x : best, rects[0])
    const vw = root.clientWidth
    const w = pop.offsetWidth
    const h = pop.offsetHeight
    const header = document.querySelector('.site-header:not(.is-hidden)')
    const ceiling = (header ? header.getBoundingClientRect().bottom : 0) + 8
    // A wrapped link keeps all its lines visible.
    const above = rects[0].top - h - 8
    const below = rects.at(-1).bottom + 8
    const top = above >= ceiling || rects[0].top - ceiling > innerHeight - rects.at(-1).bottom ? above : below
    const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, vw - w - 12))
    pop.style.left = left + scrollX + 'px'
    pop.style.top = top + scrollY + 'px'
    pop.classList.toggle('is-below', top === below)
  }

  function open(trigger, content, kind) {
    clearTimeout(closeTimer)
    if (owner && owner !== trigger) owner.removeAttribute('aria-describedby')
    owner = trigger
    pop.className = 'note-pop note-pop--' + kind
    pop.lang = lang(trigger)
    pop.replaceChildren(content)
    trigger.setAttribute('aria-describedby', 'note-pop')
    place(trigger)
    const fade = pop.querySelector('.lp-text')
    if (fade) fade.classList.toggle('is-cut', fade.scrollHeight > fade.clientHeight + 1)
    pop.classList.add('is-open')
  }

  function hide() {
    clearTimeout(closeTimer)
    if (!owner) return
    owner.removeAttribute('aria-describedby')
    owner = null
    pop.classList.remove('is-open')
  }

  function close() {
    clearTimeout(openTimer)
    pending = null
    hide()
  }

  // Leaving the trigger or the popover: a short grace period to move between them.
  const later = () => { clearTimeout(closeTimer); closeTimer = setTimeout(hide, 220) }

  function showNote(a) {
    const li = noteFor(a)
    if (!li) return
    const body = document.createElement('div')
    body.className = 'note-pop-body'
    body.append(noteBody(li, a.textContent.trim()))
    open(a, body, 'note')
  }

  // ---- link previews -----------------------------------------------------------
  let previews = null
  const loadPreviews = () => previews ||= fetch('/data/previews.json').then(r => r.ok ? r.json() : {}).catch(() => ({}))
  const here = location.pathname.replace(/\/$/, '')

  function postKey(a) {
    if (a.closest('.footnote-ref, .footnote-backref, .note-pop') || !a.closest('.prose')) return null
    let url
    try { url = new URL(a.href) } catch { return null }
    if (url.host !== location.host && url.host !== 'blog.m19182.dev') return null
    const path = url.pathname.replace(/\/$/, '')
    if (!/^\/writings\/[^/]+$/.test(path) || path === here) return null
    return path
  }

  async function showPreview(a, key) {
    const data = (await loadPreviews())[key]
    if (!data || owner === a || a !== pending) return
    const want = lang(a)
    const text = data[want] || data.en
    const es = (data[want] ? want : 'en') === 'es'
    const box = document.createElement('div')
    const head = document.createElement('a')
    head.className = 'lp-title'
    head.href = a.href
    head.textContent = text.title
    box.append(head)
    if (data.date) {
      const time = document.createElement('time')
      time.className = 'lp-date'
      time.dateTime = data.date
      time.textContent = new Date(data.date + 'T00:00:00Z').toLocaleDateString(es ? 'es-ES' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
      box.append(time)
    }
    if (text.summary) {
      const p = document.createElement('p')
      p.className = 'lp-summary'
      p.textContent = text.summary
      box.append(p)
    }
    if (text.excerpt) {
      const body = document.createElement('div')
      body.className = 'lp-text'
      for (const para of text.excerpt.split('\n')) {
        const p = document.createElement('p')
        p.textContent = para
        body.append(p)
      }
      box.append(body)
    }
    open(a, box, 'link')
  }

  // ---- events --------------------------------------------------------------------
  const refOf = el => el.closest?.('.footnote-ref > a[href^="#fn"]')
  const linkOf = el => el.closest?.('a[href]')

  // Hover or keyboard focus on a trigger; quicker while another popover is open.
  function intent(el, focus) {
    const ref = refOf(el)
    if (ref) {
      if (notes.length) return setActive(ref, true)
      if (ref === owner) return clearTimeout(closeTimer)
      pending = ref
      clearTimeout(openTimer)
      openTimer = setTimeout(() => showNote(ref), focus ? 0 : owner ? 80 : 250)
      return
    }
    const link = linkOf(el)
    const key = link && postKey(link)
    if (!key) return
    if (link === owner) return clearTimeout(closeTimer)
    loadPreviews()
    pending = link
    clearTimeout(openTimer)
    openTimer = setTimeout(() => showPreview(link, key), focus ? 0 : owner ? 80 : 350)
  }

  function leave(el, to) {
    const ref = refOf(el)
    if (ref && notes.length) return setActive(ref, false)
    const trigger = ref || linkOf(el)
    if (!trigger || trigger.contains(to) || pop.contains(to)) return
    if (trigger === pending) { pending = null; clearTimeout(openTimer) }
    if (trigger === owner) later()
  }

  document.addEventListener('pointerdown', e => {
    pointer = e.pointerType
    if (owner && !pop.contains(e.target) && !owner.contains(e.target)) close()
  }, true)

  // Hovering a sidenote highlights its reference, and the other way round.
  function noteHover(e, on) {
    const note = e.target.closest?.('.sidenote')
    if (!note || note.contains(e.relatedTarget)) return
    const ref = prose.querySelector(`.footnote-ref > a[href="#${CSS.escape(note.dataset.note)}"]`)
    if (ref) setActive(ref, on)
  }

  document.addEventListener('pointerover', e => {
    lastY = e.clientY
    if (e.pointerType === 'touch') return
    if (pop.contains(e.target)) return clearTimeout(closeTimer)
    noteHover(e, true)
    intent(e.target)
  })

  document.addEventListener('pointerout', e => {
    if (e.pointerType === 'touch') return
    noteHover(e, false)
    if (pop.contains(e.target)) {
      if (!pop.contains(e.relatedTarget) && !owner?.contains(e.relatedTarget)) later()
      return
    }
    leave(e.target, e.relatedTarget)
  })

  document.addEventListener('focusin', e => {
    if (e.target.matches?.(':focus-visible')) { lastY = e.target.getBoundingClientRect().top; intent(e.target, true) }
  })
  document.addEventListener('focusout', e => {
    const ref = refOf(e.target)
    if (ref && notes.length) return setActive(ref, false)
    if (e.target === owner || e.target === pending) { pending = null; if (!pop.contains(e.relatedTarget)) close() }
  })

  document.addEventListener('click', e => {
    const ref = refOf(e.target)
    if (!ref) return
    if (notes.length) {
      const id = decodeURIComponent(ref.hash.slice(1))
      const n = notes.find(x => x.aside.dataset.note === id)
      if (!n) return
      e.preventDefault()
      flash(n)
      return
    }
    if (pointer !== 'touch') return close()
    e.preventDefault()
    if (owner === ref) return close()
    lastY = ref.getBoundingClientRect().top
    pending = ref
    showNote(ref)
  })

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !owner) return
    const back = pop.contains(document.activeElement) ? owner : null
    close()
    back?.focus()
  })

  // ---- mode ----------------------------------------------------------------------
  function mode() {
    close()
    if (wide.matches) build()
    else teardown()
  }
  wide.addEventListener('change', mode)
  let width = innerWidth
  addEventListener('resize', () => {
    if (innerWidth !== width) { width = innerWidth; close() }
    if (notes.length) schedule()
  })
  new MutationObserver(() => {
    close()
    if (!notes.length) return
    for (const n of notes) if (n.more) n.more.remove(), n.more = null
    schedule()
  }).observe(root, { attributes: true, attributeFilter: ['lang'] })
  prose.addEventListener('toggle', schedule, true)
  prose.addEventListener('load', schedule, true)
  document.fonts?.ready.then(() => { ratio = 0; schedule() })
  mode()
})()
