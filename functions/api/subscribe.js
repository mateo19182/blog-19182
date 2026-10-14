// Resend stores the list; the blog needs no database.
export async function onRequestPost({ request, env }) {
  const json = request.headers.get('Content-Type')?.includes('application/json')
  const reply = (status, ok) => json
    ? Response.json({ ok }, { status, headers: { 'Cache-Control': 'no-store' } })
    : new Response(ok ? "You're on the list. / Ya estás en la lista.\n" : 'Could not subscribe. Please go back and try again. / No se pudo guardar. Vuelve e inténtalo de nuevo.\n', { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, false)
  if (!env.RESEND_API_KEY || !env.RESEND_SEGMENT_ID) return reply(503, false)
  try {
    if (Number(request.headers.get('Content-Length')) > 2048) return reply(413, false)
    const body = await request.text()
    if (body.length > 2048) return reply(413, false)
    let data
    try {
      data = json ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body))
    } catch { return reply(400, false) }
    if (!data || typeof data !== 'object') return reply(400, false)
    if (data.website) return reply(200, true)
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, false)
    const result = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      // Omit unsubscribed so a repeated signup cannot undo an unsubscribe.
      body: JSON.stringify({ email, segments: [{ id: env.RESEND_SEGMENT_ID }] }),
      signal: AbortSignal.timeout(10000),
    })
    return reply(result.ok ? 200 : 502, result.ok)
  } catch {
    return reply(502, false)
  }
}
