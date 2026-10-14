import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import matter from 'gray-matter'
import { fileSlug } from '../lib/slug.mjs'
import { SITE } from '../lib/templates.mjs'
import { newsletterHtml } from '../lib/newsletter.mjs'

// Compare published URLs, rather than file changes, so edits and translations
// don't send mail. Aliases also keep renamed posts from being announced again.
export function newPosts(posts, previousUrls) {
  return posts.filter(p => !previousUrls.has(p.url))
}

function previousUrls(ref) {
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' })
  const files = git('ls-tree', '-r', '--name-only', '-z', ref, '--', 'content/writings').split('\0')
  const urls = new Set()
  for (const file of files) {
    if (!file.endsWith('.md') || /\.(en|es)\.md$/.test(file)) continue
    const { data } = matter(git('show', `${ref}:${file}`))
    if (data.unlisted === true) continue
    const name = file.slice('content/writings/'.length, -3)
    urls.add(`/writings/${fileSlug(name)}`)
    for (const alias of [data.aliases || []].flat()) urls.add('/' + String(alias).replace(/^\/+|\/+$/g, ''))
  }
  return urls
}

export function broadcastBody(post, segment, from) {
  return {
    name: `writing:${createHash('sha256').update(post.url).digest('hex').slice(0, 40)}`,
    segment_id: segment,
    from,
    subject: `New post: ${post.title}`,
    html: newsletterHtml(post),
  }
}

export async function sendPost(post, { api, segment, from }) {
  const body = broadcastBody(post, segment, from)
  let after = ''
  let existing
  do {
    const page = await api(`/broadcasts?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`)
    existing = page.data.find(b => b.name === body.name && b.segment_id === segment)
    if (existing || !page.has_more) break
    after = page.data.at(-1)?.id
    if (!after) throw new Error('Invalid broadcast pagination')
  } while (true)
  if (existing && existing.status !== 'draft') {
    console.log(`Already announced: ${post.url} (${existing.status})`)
    return
  }
  const draft = existing || await api('/broadcasts', body)
  await api(`/broadcasts/${draft.id}/send`, {})
  console.log(`Announced: ${post.url}`)
}

async function main() {
  const before = process.env.NEWSLETTER_BEFORE
  if (!before || /^0+$/.test(before)) throw new Error('NEWSLETTER_BEFORE must be an existing commit; refusing to announce the archive.')
  const posts = JSON.parse(await readFile('public/newsletter.json', 'utf8'))
  const previous = previousUrls(before)
  // New aliases in this commit suppress announcements for renamed posts.
  const current = execFileSync('git', ['ls-files', '-z', 'content/writings'], { encoding: 'utf8' }).split('\0')
  for (const file of current) {
    if (!file.endsWith('.md') || /\.(en|es)\.md$/.test(file)) continue
    const { data } = matter(await readFile(file, 'utf8'))
    if ([data.aliases || []].flat().some(a => previous.has('/' + String(a).replace(/^\/+|\/+$/g, '')))) {
      previous.add(`/writings/${fileSlug(file.slice('content/writings/'.length, -3))}`)
    }
  }
  const added = newPosts(posts, previous)
  if (!added.length) return console.log('No new writings.')
  if (!process.argv.includes('--send')) {
    console.log(JSON.stringify(added, null, 2))
    return
  }
  const { RESEND_API_KEY: key, RESEND_SEGMENT_ID: segment, NEWSLETTER_FROM: from } = process.env
  if (!key || !segment || !from) throw new Error('Missing Resend newsletter configuration')

  // Cloudflare deploys independently of Actions. Wait up to ten minutes until
  // the public manifest contains these posts before sending links to readers.
  let deployed = false
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(`${SITE.baseUrl}/newsletter.json?t=${Date.now()}`, { signal: AbortSignal.timeout(10000) })
      const live = response.ok ? await response.json() : []
      deployed = added.every(p => live.some(l => l.url === p.url && l.title === p.title && l.summary === p.summary && l.excerpt === p.excerpt))
      if (deployed) break
    } catch { /* Deployment may still be in progress. */ }
    await new Promise(resolve => setTimeout(resolve, 15000))
  }
  if (!deployed) throw new Error('New writings are not live yet. Rerun this workflow after deployment.')
  const api = async (route, body) => {
    // Resend's default rate limit is two requests per second.
    await new Promise(resolve => setTimeout(resolve, 600))
    const response = await fetch(`https://api.resend.com${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`Resend ${route}: HTTP ${response.status}`)
    return response.json()
  }
  for (const post of added) await sendPost(post, { api, segment, from })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
