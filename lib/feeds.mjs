// RSS 2.0 feed + sitemap.xml generation.
import { SITE } from "./templates.mjs"

function xmlEsc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]))
}

export function buildRss(posts) {
  const items = posts
    .slice(0, 30)
    .map((p) => {
      const link = SITE.baseUrl + p.url
      const pub = p.date ? new Date(p.date + "T00:00:00Z").toUTCString() : ""
      return `    <item>
      <title>${xmlEsc(p.title)}</title>
      <link>${xmlEsc(link)}</link>
      <guid>${xmlEsc(link)}</guid>
      ${pub ? `<pubDate>${pub}</pubDate>` : ""}
      ${p.description ? `<description>${xmlEsc(p.description)}</description>` : ""}
      ${(p.tags || []).map((t) => `<category>${xmlEsc(t)}</category>`).join("")}
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEsc(SITE.title)}</title>
    <link>${SITE.baseUrl}</link>
    <description>Mateo's blog.</description>
    <language>${SITE.locale}</language>
    <atom:link href="${SITE.baseUrl}/index.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

export function buildSitemap(urls) {
  const entries = urls
    .map(
      (u) => `  <url>
    <loc>${xmlEsc(SITE.baseUrl + u.url)}</loc>
    ${u.date ? `<lastmod>${u.date}</lastmod>` : ""}
  </url>`,
    )
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}
