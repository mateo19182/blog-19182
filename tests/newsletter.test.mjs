import { test } from 'node:test'
import assert from 'node:assert/strict'
import { onRequestPost } from '../functions/api/subscribe.js'
import { newPosts, broadcastBody, sendPost } from '../tools/send-newsletter.mjs'
import { newsletterExcerpt, newsletterHtml } from '../lib/newsletter.mjs'

const env = { RESEND_API_KEY: 'test-key', RESEND_SEGMENT_ID: 'blog', RESEND_UPDATES_SEGMENT_ID: 'updates', RESEND_KILLSWITCH_SEGMENT_ID: 'killswitch' }
const post = { url: '/writings/New', title: 'A <title>', summary: 'A {{{template}}} & summary' }
function request(data, origin = 'https://blog.m19182.dev') {
  return new Request('https://blog.m19182.dev/api/subscribe', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  })
}

test('signup rejects invalid input and foreign origins, and ignores the honeypot', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('Must not call Resend') })
  for (const [data, origin, status] of [
    [{ email: 'bad' }, undefined, 400],
    [null, undefined, 400],
    [{ email: 'reader@example.com' }, 'https://elsewhere.test', 403],
    [{ email: 'reader@example.com', website: 'spam' }, undefined, 200],
  ]) assert.equal((await onRequestPost({ request: request(data, origin), env })).status, status)
})

test('signup adds only opted-in segments and sends a welcome email without a confirmation step', async t => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) })
    return Response.json({ id: 'contact-or-email' })
  })
  const cases = [
    [{ posts: 'yes' }, ['blog'], 'new writings.'],
    [{ posts: 'yes', updates: 'yes' }, ['blog', 'updates'], 'new writings and quarterly life updates.'],
    [{ posts: 'no', updates: 'yes', killswitch: 'yes' }, ['updates', 'killswitch'], 'quarterly life updates and one email if I die.'],
  ]
  for (const [lists, segments, message] of cases) {
    calls.length = 0
    assert.equal((await onRequestPost({ request: request({ email: ' Reader@Example.com ', ...lists }), env })).status, 200)
    assert.equal(calls.length, 2)
    assert.equal(calls[0].url, 'https://api.resend.com/contacts')
    assert.deepEqual(calls[0].body, { email: 'reader@example.com', segments: segments.map(id => ({ id })) })
    assert.equal(calls[1].url, 'https://api.resend.com/emails')
    assert.deepEqual(calls[1].body.to, ['reader@example.com'])
    assert.equal(calls[1].body.subject, "You're subscribed")
    assert.ok(calls[1].options.headers['Idempotency-Key'].startsWith('welcome:'))
    assert.ok(calls[1].body.text.includes(message))
    assert.equal(calls[1].body.text.includes('/writings'), segments.includes('blog'))
    assert.equal(calls[1].body.text.includes('/now#quarterly-life-updates'), segments.includes('updates'))
  }
})

test('signup needs at least one list', async t => {
  t.mock.method(globalThis, 'fetch', async () => assert.fail('no request expected'))
  assert.equal((await onRequestPost({ request: request({ email: 'reader@example.com', posts: 'no' }), env })).status, 400)
})

test('signup reports missing configuration and upstream errors', async t => {
  assert.equal((await onRequestPost({ request: request({ email: 'reader@example.com', posts: 'yes' }), env: {} })).status, 503)
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 429 }))
  assert.equal((await onRequestPost({ request: request({ email: 'reader@example.com', posts: 'yes' }), env })).status, 502)
})

test('signup fails safely if optional updates are not configured or welcome sending fails', async t => {
  let calls = 0
  t.mock.method(globalThis, 'fetch', async () => {
    calls++
    return calls === 1 ? Response.json({ id: 'contact' }) : new Response('Unavailable', { status: 500 })
  })
  const missingUpdates = { RESEND_API_KEY: 'test-key', RESEND_SEGMENT_ID: 'blog' }
  assert.equal((await onRequestPost({ request: request({ email: 'reader@example.com', updates: 'yes' }), env: missingUpdates })).status, 503)
  assert.equal(calls, 0)
  assert.equal((await onRequestPost({ request: request({ email: 'reader@example.com', posts: 'yes' }), env })).status, 502)
  assert.equal(calls, 2)
})

test('native form submissions work without JavaScript', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ id: 'contact' }))
  const req = new Request('https://blog.m19182.dev/api/subscribe', {
    method: 'POST', headers: { Origin: 'https://blog.m19182.dev', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'posts=yes&email=reader%40example.com&website=',
  })
  const response = await onRequestPost({ request: req, env })
  assert.equal(response.status, 200)
  assert.match(await response.text(), /You're on the list/)
})

test('only new URLs are selected; email escapes content and retains unsubscribe', () => {
  assert.deepEqual(newPosts([{ url: '/old' }, post], new Set(['/old'])), [post])
  const body = broadcastBody(post, 'blog', 'Mateo <blog@example.com>')
  assert.match(body.html, /&lt;title&gt;/)
  assert.ok(!body.html.includes('{{{template}}}'))
  assert.match(body.html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/)
  assert.equal(body.segment_id, 'blog')
  assert.equal(body.subject, 'New post: A <title>')
})

test('broadcast retries reuse drafts and skip sent emails across paginated history', async () => {
  const name = broadcastBody(post, 'blog', 'sender').name
  for (const status of ['draft', 'sent']) {
    const routes = []
    await sendPost(post, { segment: 'blog', from: 'sender', api: async (route) => {
      routes.push(route)
      if (route === '/broadcasts?limit=100') return { data: [{ id: 'other' }], has_more: true }
      if (route.includes('after=other')) return { data: [{ id: 'existing', name, segment_id: 'blog', status }], has_more: false }
      assert.equal(route, '/broadcasts/existing/send')
      return { id: 'existing' }
    } })
    assert.equal(routes.length, status === 'draft' ? 3 : 2)
  }
})

test('a new announcement creates a draft, then sends it', async () => {
  const calls = []
  await sendPost(post, { segment: 'blog', from: 'sender', api: async (route, body) => {
    calls.push({ route, body })
    return route.startsWith('/broadcasts?') ? { data: [], has_more: false } : { id: 'new' }
  } })
  assert.deepEqual(calls.map(c => c.route), ['/broadcasts?limit=100', '/broadcasts', '/broadcasts/new/send'])
  assert.equal(calls[1].body.segment_id, 'blog')
})

test('excerpt keeps five prose paragraphs and links, omitting headings, images and footnotes', () => {
  const source = '# Intro\n\nFirst **paragraph** [link](/now).\n\n![Image](/image.jpg)\n\n> Quoted text\n\n- List item\n\nSecond paragraph.[^note]\n\nThird paragraph.\n\nFourth paragraph.\n\nFifth paragraph.\n\nSixth paragraph.\n\n[^note]: Footnote text.'
  const excerpt = newsletterExcerpt(source, '/writings/Test')
  assert.equal((excerpt.match(/<p /g) || []).length, 5)
  assert.match(excerpt, /<strong>paragraph<\/strong>/)
  assert.match(excerpt, /href="https:\/\/blog.m19182.dev\/now"/)
  assert.ok(!/Sixth|Quoted|List item|Footnote|\[\^|<img|<h1/.test(excerpt))
})

test('email is English HTML with the excerpt and a reading link', () => {
  const html = newsletterHtml({ ...post, excerpt: newsletterExcerpt('Opening paragraph.\n\nAnother paragraph.', post.url) })
  assert.match(html, /<html lang="en">/)
  assert.match(html, /background:#e9e7e1/)
  assert.match(html, /Opening paragraph/)
  assert.match(html, /Continue reading/)
  assert.match(html, /New post: A &lt;title&gt;/)
  assert.ok(!html.includes("Mateo's writings"))
  assert.ok(!/Nuevo|Leer|Darme|template/.test(html))
})
