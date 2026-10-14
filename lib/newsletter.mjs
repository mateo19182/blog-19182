import MarkdownIt from 'markdown-it'
import { SITE, esc } from './templates.mjs'

const markdown = new MarkdownIt({ html: true })
const inline = new MarkdownIt({ html: false })
inline.renderer.rules.image = () => ''
inline.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
  const href = tokens[index].attrGet('href')
  if (href) tokens[index].attrSet('href', new URL(href, SITE.baseUrl + env.url + '/').href)
  tokens[index].attrSet('style', 'color:#505050;text-decoration:underline;')
  return renderer.renderToken(tokens, index, options)
}

export function newsletterExcerpt(source, url, count = 5) {
  const tokens = markdown.parse(source, {})
  const paragraphs = []
  for (let i = 0; i < tokens.length && paragraphs.length < count; i++) {
    if (tokens[i].type !== 'paragraph_open' || tokens[i].level !== 0) continue
    const text = tokens[i + 1]?.content?.replace(/\[\^[^\]]+\]/g, '') || ''
    const html = inline.renderInline(text, { url })
    if (!html.trim()) continue
    paragraphs.push(`<p style="margin:0 0 18px;">${html}</p>`)
  }
  return paragraphs.join('\n')
}

export function newsletterHtml(post) {
  const safe = value => esc(value).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
  const excerpt = (post.excerpt || '').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>New post: ${safe(post.title)}</title></head>
<body style="margin:0;background:#e9e7e1;color:#2b2926;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9e7e1;"><tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:17px;line-height:1.65;color:#2b2926;"><tr><td>
<p style="margin:0 0 32px;font-size:13px;"><a href="${SITE.baseUrl}" style="color:#6a655c;text-decoration:none;">blog.m19182.dev</a></p>
<h1 style="margin:0 0 24px;font-size:30px;font-weight:700;line-height:1.2;letter-spacing:-0.5px;">New post: ${safe(post.title)}</h1>
${excerpt || `<p style="margin:0 0 18px;">${safe(post.summary)}</p>`}
<p style="margin:24px 0 36px;"><a href="${safe(SITE.baseUrl + post.url)}" style="color:#505050;text-decoration:underline;">Continue reading</a></p>
<p style="margin:0;padding-top:16px;border-top:1px solid #d8d5cd;font-size:12px;color:#6a655c;"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#6a655c;text-decoration:underline;">Unsubscribe</a></p>
</td></tr></table>
</td></tr></table>
</body>
</html>`
}
