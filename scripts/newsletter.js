;(function () {
  const form = document.querySelector('.newsletter form')
  if (!form) return
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = form.querySelector('button')
    const status = form.querySelector('[role="status"]')
    const es = document.documentElement.lang === 'es'
    button.disabled = true
    status.textContent = ''
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      if (!response.ok) throw new Error('Signup failed')
      status.textContent = es ? 'Ya estás en la lista. Gracias.' : "You're on the list. Thanks."
      form.reset()
    } catch {
      status.textContent = es ? 'No se pudo guardar. Inténtalo de nuevo más tarde.' : 'Could not subscribe. Please try again later.'
    } finally {
      button.disabled = false
    }
  })
})()
