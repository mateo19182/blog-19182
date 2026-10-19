;(function () {
  const form = document.querySelector('.newsletter form')
  if (!form) return
  const LISTS = ['posts', 'updates', 'killswitch']
  // ?posts=0, ?updates=1, ?killswitch=1 preselect the lists.
  const params = new URLSearchParams(location.search)
  for (const name of LISTS) if (params.has(name)) form.elements[name].checked = params.get(name) === '1'
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = form.querySelector('button')
    const status = form.querySelector('[role="status"]')
    const es = document.documentElement.lang === 'es'
    const data = { email: form.elements.email.value, website: form.elements.website.value }
    for (const name of LISTS) data[name] = form.elements[name].checked ? 'yes' : 'no'
    if (!LISTS.some((name) => data[name] === 'yes')) {
      status.textContent = es ? 'Elige al menos una lista.' : 'Pick at least one list.'
      return
    }
    button.disabled = true
    status.textContent = ''
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Signup failed')
      const links = [
        data.posts === 'yes' && (es ? ['Escritos anteriores', '/writings'] : ['Past writings', '/writings']),
        data.updates === 'yes' && (es ? ['Actualizaciones anteriores', '/now#actualizaciones-trimestrales'] : ['Previous life updates', '/now#quarterly-life-updates']),
      ].filter(Boolean)
      status.textContent = (es ? 'Ya estás en la lista. Gracias.' : "You're on the list. Thanks.") + (links.length ? ' ' : '')
      links.forEach(([label, href], i) => {
        const a = document.createElement('a')
        a.href = href
        a.textContent = label
        status.append(...(i ? [' · ', a] : [a]))
      })
      form.elements.email.value = ''
    } catch {
      status.textContent = es ? 'No se pudo guardar. Inténtalo de nuevo más tarde.' : 'Could not subscribe. Please try again later.'
    } finally {
      button.disabled = false
    }
  })
})()
