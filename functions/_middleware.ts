// Markdown content negotiation for agents.
// See https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
//
// When a client sends `Accept: text/markdown`, serve the pre-built .md
// counterpart emitted by build.mjs alongside each .html. Browsers and other
// clients still get the HTML response by default.

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

const wantsMarkdown = (accept: string | null) =>
  !!accept && /(^|[,\s])text\/markdown(\s*;|\s*,|$)/i.test(accept)

const hasFileExtension = (pathname: string) => /\.[A-Za-z0-9]{1,8}$/.test(pathname)

const candidatePaths = (pathname: string): string[] => {
  const base = pathname.replace(/\/+$/, "")
  const trailingSlash = pathname !== "/" && pathname.endsWith("/")
  const candidates: string[] = []
  if (base === "") {
    candidates.push("/index.md")
  } else if (trailingSlash) {
    candidates.push(`${base}/index.md`)
    candidates.push(`${base}.md`)
  } else {
    candidates.push(`${base}.md`)
    candidates.push(`${base}/index.md`)
  }
  return candidates
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, next, env } = ctx

  if (request.method !== "GET" && request.method !== "HEAD") {
    return next()
  }
  if (!wantsMarkdown(request.headers.get("accept"))) {
    return next()
  }

  const url = new URL(request.url)
  if (hasFileExtension(url.pathname)) {
    return next()
  }

  for (const candidate of candidatePaths(url.pathname)) {
    const mdUrl = new URL(candidate, url)
    const mdResp = await env.ASSETS.fetch(new Request(mdUrl.toString(), { method: "GET" }))
    if (mdResp.status !== 200) continue

    const body = await mdResp.text()
    const tokenCount = Math.max(1, Math.ceil(body.length / 4))

    const headers = new Headers()
    headers.set("content-type", "text/markdown; charset=utf-8")
    headers.set("x-markdown-tokens", String(tokenCount))
    headers.set("vary", "Accept")
    headers.set("cache-control", "public, max-age=0, must-revalidate")

    return new Response(request.method === "HEAD" ? null : body, {
      status: 200,
      headers,
    })
  }

  return next()
}
