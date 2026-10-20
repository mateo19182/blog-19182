// Resend stores the list; the blog needs no database.
export async function onRequestPost({ request, env }) {
  const json = request.headers.get('Content-Type')?.includes('application/json')
  const reply = (status, ok) => json
    ? Response.json({ ok }, { status, headers: { 'Cache-Control': 'no-store' } })
    : new Response(ok ? "You're on the list. / Ya estás en la lista.\n" : 'Could not subscribe. Please go back and try again. / No se pudo guardar. Vuelve e inténtalo de nuevo.\n', { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  if (request.headers.get('Origin') !== new URL(request.url).origin) return reply(403, false)
  if (!env.RESEND_API_KEY) return reply(503, false)
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
    const lists = [
      ['posts', env.RESEND_SEGMENT_ID, 'new writings'],
      ['updates', env.RESEND_UPDATES_SEGMENT_ID, 'life updates'],
      ['killswitch', env.RESEND_KILLSWITCH_SEGMENT_ID, 'one email if I die'],
    ].filter(([name]) => data[name] === 'yes')
    if (!lists.length) return reply(400, false)
    if (lists.some(([, id]) => !id)) return reply(503, false)
    const segments = lists.map(([, id]) => ({ id }))
    const result = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      // Omit unsubscribed so a repeated signup cannot undo an unsubscribe.
      body: JSON.stringify({ email, segments }),
      signal: AbortSignal.timeout(10000),
    })
    if (!result.ok) return reply(502, false)
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${email}:${segments.map(s => s.id).join(',')}`))
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
    const base = new URL(request.url).origin
    const names = lists.map(([, , label]) => label)
    const reading = [
      lists.some(([name]) => name === 'posts') && ['Past writings', `${base}/writings`],
      lists.some(([name]) => name === 'updates') && ['Previous life updates', `${base}/updates`],
    ].filter(Boolean)
    const message = `You'll receive ${names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]}.`
    const welcome = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `welcome:${hash}` },
      body: JSON.stringify({
        from: env.NEWSLETTER_FROM || 'blog.m19182.dev <writings@m19182.dev>',
        to: [email],
        subject: "You're subscribed",
        html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#e9e7e1;color:#2b2926;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="100%" style="max-width:600px;font-family:Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:17px;line-height:1.65;"><tr><td><p style="margin:0 0 32px;font-size:13px;"><a href="${base}" style="color:#6a655c;text-decoration:none;">blog.m19182.dev</a></p><h1 style="font-size:30px;line-height:1.2;">You're subscribed</h1><p>${message}</p>${reading.map(([label, url]) => `<p><a href="${url}" style="color:#505050;text-decoration:underline;">${label}</a></p>`).join('')}</td></tr></table></td></tr></table></body></html>`,
        text: `You're subscribed. ${message}${reading.map(([label, url]) => `\n\n${label}: ${url}`).join('')}`,
      }),
      signal: AbortSignal.timeout(10000),
    })
    return reply(welcome.ok ? 200 : 502, welcome.ok)
  } catch {
    return reply(502, false)
  }
}
