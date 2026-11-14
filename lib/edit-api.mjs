// API behind the web editor (functions/api/edit/[[path]].js). Reads content
// from GitHub and saves edits as one commit on main, so Cloudflare Pages
// rebuilds the site. Every request must carry a Cloudflare Access JWT for
// the editor's email; the Access policy alone is not trusted.
//
// Env: GITHUB_TOKEN (fine-grained, Contents read/write on this repo only),
// ACCESS_TEAM_DOMAIN, ACCESS_AUD, EDITOR_EMAIL; optional GITHUB_REPO, and
// EDIT_BRANCH to point local tests at a throwaway branch.
import { pathError, isImagePath, validateFile, splitFrontMatter, fileKind, MAX_IMAGE_BYTES } from "./content.mjs"

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } })

class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra }
}

export async function handle(request, env, { fetch = globalThis.fetch, now = Date.now } = {}) {
  try {
    const email = await authenticate(request, env, fetch, now)
    const url = new URL(request.url)
    const route = url.pathname.replace(/^\/api\/edit\/?/, "")
    if (request.method === "POST" && route === "commit") {
      if (request.headers.get("Origin") !== url.origin) throw new HttpError(403, "origen no permitido")
      if (!request.headers.get("Content-Type")?.includes("application/json")) throw new HttpError(415, "se espera JSON")
      return json(await github(env, fetch).commit(await request.json(), email))
    }
    if (request.method !== "GET") throw new HttpError(405, "método no permitido")
    const gh = github(env, fetch)
    if (route === "me") return json({ email, branch: gh.branch, repo: gh.repo })
    if (route === "files") return json(await gh.listFiles())
    if (route === "file") return json(await gh.readFile(url.searchParams.get("path")))
    throw new HttpError(404, "no existe")
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, ...e.extra }, e.status)
    console.error(e)
    return json({ error: "error interno" }, 500)
  }
}

// ---- Cloudflare Access ------------------------------------------------------
let certs = { url: "", keys: null, at: 0 }

async function accessKeys(team, fetch, now, kid) {
  const url = `https://${team}/cdn-cgi/access/certs`
  const stale = certs.url !== url || now() - certs.at > 3600_000 || !certs.keys.some((k) => k.kid === kid)
  if (stale) {
    const res = await fetch(url)
    if (!res.ok) throw new HttpError(503, "no se pudieron obtener las claves de Access")
    certs = { url, keys: (await res.json()).keys || [], at: now() }
  }
  return certs.keys
}

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))
const decodePart = (s) => JSON.parse(new TextDecoder().decode(b64url(s)))

async function authenticate(request, env, fetch, now) {
  // Local development only: `wrangler pages dev` on localhost with EDIT_DEV_EMAIL set.
  const host = new URL(request.url).hostname
  if (env.EDIT_DEV_EMAIL && (host === "localhost" || host === "127.0.0.1")) return env.EDIT_DEV_EMAIL
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.EDITOR_EMAIL) throw new HttpError(503, "editor sin configurar")
  const cookie = /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(request.headers.get("Cookie") || "")
  const token = request.headers.get("Cf-Access-Jwt-Assertion") || cookie?.[1]
  if (!token) throw new HttpError(401, "falta el token de Cloudflare Access")
  const [h, p, sig] = token.split(".")
  let header, claims
  try { header = decodePart(h); claims = decodePart(p) } catch { throw new HttpError(401, "token no válido") }
  if (header.alg !== "RS256" || !sig) throw new HttpError(401, "token no válido")
  const jwk = (await accessKeys(env.ACCESS_TEAM_DOMAIN, fetch, now, header.kid)).find((k) => k.kid === header.kid)
  if (!jwk) throw new HttpError(401, "clave de token desconocida")
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"])
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(sig), new TextEncoder().encode(`${h}.${p}`))
  if (!ok) throw new HttpError(401, "firma no válida")
  const t = now() / 1000
  const aud = [claims.aud].flat()
  if (!aud.includes(env.ACCESS_AUD)) throw new HttpError(403, "audiencia incorrecta")
  if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) throw new HttpError(403, "emisor incorrecto")
  if (!(claims.exp > t) || (claims.nbf && claims.nbf > t + 60)) throw new HttpError(401, "token caducado")
  if (String(claims.email || "").toLowerCase() !== env.EDITOR_EMAIL.toLowerCase()) throw new HttpError(403, "usuario no autorizado")
  return claims.email
}

// ---- GitHub -------------------------------------------------------------------
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/")
const utf8ToB64 = (s) => {
  const bytes = new TextEncoder().encode(s)
  let bin = ""
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
const b64ToUtf8 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g, "")), (c) => c.charCodeAt(0)))

export function github(env, fetch) {
  const repo = env.GITHUB_REPO || "mateo19182/blog-19182"
  const branch = env.EDIT_BRANCH || "main"
  if (!env.GITHUB_TOKEN) throw new HttpError(503, "falta GITHUB_TOKEN")

  async function api(method, route, body) {
    const res = await fetch(`https://api.github.com/repos/${repo}${route}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "blog-19182-editor",
        ...(body && { "Content-Type": "application/json" }),
      },
      body: body && JSON.stringify(body),
    })
    if (res.status === 404 && method === "GET") {
      if (/^\/git\/ref\//.test(route)) throw new HttpError(404, `no existe la rama ${branch}`)
      return null
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw Object.assign(new Error(`GitHub ${method} ${route}: ${res.status} ${text.slice(0, 200)}`), { status: res.status })
    }
    return res.json()
  }

  const head = async () => (await api("GET", `/git/ref/heads/${encodeURIComponent(branch)}`)).object.sha
  const meta = (p, ref) => api("GET", `/contents/${encPath(p)}?ref=${ref}`)

  return {
    repo, branch,

    async listFiles() {
      const sha = await head()
      const dirs = await Promise.all(["content", "content/writings", "content/updates", "content/data"].map((d) => meta(d, sha)))
      const files = dirs.flat().filter((f) => f && f.type === "file")
        .filter((f) => f.path.endsWith(".md") || f.path === "content/projects.yml")
        .map(({ path, sha }) => ({ path, sha, readOnly: !!pathError(path) }))
      const dataFiles = (dirs[3] || []).map((f) => f.name)
      return { head: sha, files, dataFiles }
    },

    async readFile(p) {
      if (typeof p !== "string" || !/^content\//.test(p) || p.includes("..")) throw new HttpError(400, "ruta no válida")
      const f = await meta(p, await head())
      if (!f || f.type !== "file") throw new HttpError(404, "no existe")
      // The contents API inlines files up to 1 MB, plenty for Markdown.
      if (f.encoding !== "base64") throw new HttpError(413, "archivo demasiado grande")
      return { path: p, sha: f.sha, content: b64ToUtf8(f.content), readOnly: pathError(p) }
    },

    // files: [{ path, content } | { path, base64 }] each with `baseSha` (null for
    // a new file). Refuses if any file changed on the branch since it was read.
    async commit(body, email) {
      const files = Array.isArray(body?.files) ? body.files : []
      const message = String(body?.message || "").trim()
      if (!files.length || files.length > 30) throw new HttpError(400, "nada que guardar")
      if (!message) throw new HttpError(400, "falta el mensaje del commit")
      if (new Set(files.map((f) => f.path)).size !== files.length) throw new HttpError(400, "ruta repetida")
      for (const f of files) {
        const err = pathError(f.path)
        if (err) throw new HttpError(400, `${f.path}: ${err}`)
        if (isImagePath(f.path)) {
          if (typeof f.base64 !== "string") throw new HttpError(400, `${f.path}: falta la imagen`)
          if (f.base64.length * 0.75 > MAX_IMAGE_BYTES) throw new HttpError(413, `${f.path}: imagen de más de 10 MB`)
        } else {
          if (typeof f.content !== "string") throw new HttpError(400, `${f.path}: falta el contenido`)
          const problems = validateFile(f.path, f.content)
          if (problems.length) throw new HttpError(422, `${f.path}: ${problems.join("; ")}`, { problems })
        }
      }
      const parent = await head()
      const current = await Promise.all(files.map((f) => meta(f.path, parent)))
      const conflicts = files.filter((f, i) => (current[i]?.sha ?? null) !== (f.baseSha ?? null)).map((f) => f.path)
      if (conflicts.length) throw new HttpError(409, `cambiado en ${branch} desde que lo abriste: ${conflicts.join(", ")}`, { conflicts })
      const missing = await missingSoundtracks(files, parent)
      if (missing.length) throw new HttpError(422, `no existe content/data/soundtrack/${missing.join(", ")}`)

      const blobs = await Promise.all(files.map((f) => api("POST", "/git/blobs", {
        content: f.base64 ?? utf8ToB64(f.content), encoding: "base64",
      })))
      const base = await api("GET", `/git/commits/${parent}`)
      const tree = await api("POST", "/git/trees", {
        base_tree: base.tree.sha,
        tree: files.map((f, i) => ({ path: f.path, mode: "100644", type: "blob", sha: blobs[i].sha })),
      })
      const commit = await api("POST", "/git/commits", {
        message: `${message}\n\nVia the web editor (${email}).`, tree: tree.sha, parents: [parent],
      })
      try {
        await api("PATCH", `/git/refs/heads/${encodeURIComponent(branch)}`, { sha: commit.sha, force: false })
      } catch (e) {
        if (e.status === 422) throw new HttpError(409, `${branch} ha cambiado mientras guardabas; vuelve a intentarlo`)
        throw e
      }
      return {
        commit: commit.sha,
        url: `https://github.com/${repo}/commit/${commit.sha}`,
        files: Object.fromEntries(files.map((f, i) => [f.path, blobs[i].sha])),
      }
    },
  }

  async function missingSoundtracks(files, ref) {
    const wanted = new Set(files
      .filter((f) => fileKind(f.path) === "writing")
      .map((f) => splitFrontMatter(f.content).data.soundtrack?.file)
      .filter(Boolean))
    const found = await Promise.all([...wanted].map((w) => meta(`content/data/soundtrack/${w}`, ref)))
    return [...wanted].filter((_, i) => !found[i])
  }
}
