// Copy buttons on code blocks; the icon turns into a check for a moment.
;(() => {
  const blocks = document.querySelectorAll('.prose .code-block')
  if (!blocks.length) return
  const svg = d => `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
  const COPY = svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>')
  const DONE = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>')
  const label = done => document.documentElement.lang === 'es'
    ? (done ? 'Copiado' : 'Copiar código')
    : (done ? 'Copied' : 'Copy code')
  const buttons = []

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true } catch {}
    const area = Object.assign(document.createElement('textarea'), { value: text })
    area.setAttribute('readonly', '')
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.append(area)
    area.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch {}
    area.remove()
    return ok
  }

  blocks.forEach(block => {
    const code = block.querySelector('pre code')
    if (!code) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy'
    button.innerHTML = COPY
    button.setAttribute('aria-label', label(false))
    let timer
    button.addEventListener('click', async () => {
      if (!(await copy(code.textContent))) return
      clearTimeout(timer)
      button.classList.add('is-done')
      button.innerHTML = DONE
      button.setAttribute('aria-label', label(true))
      timer = setTimeout(() => {
        button.classList.remove('is-done')
        button.innerHTML = COPY
        button.setAttribute('aria-label', label(false))
      }, 1500)
    })
    ;(block.querySelector('.code-head') || block).append(button)
    buttons.push(button)
  })

  new MutationObserver(() => buttons.forEach(b => b.setAttribute('aria-label', label(b.classList.contains('is-done')))))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
})()
