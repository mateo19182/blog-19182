import assert from "node:assert/strict"
import test from "node:test"
import { handle } from "../lib/edit-api.mjs"

const TEAM = "team.cloudflareaccess.com"
const AUD = "aud-tag"
const EMAIL = "me@example.com"
const env = { ACCESS_TEAM_DOMAIN: TEAM, ACCESS_AUD: AUD, EDITOR_EMAIL: EMAIL, GITHUB_TOKEN: "t" }
const NOW = Date.UTC(2026, 10, 14) // fixed clock

const { publicKey, privateKey } = await crypto.subtle.generateKey(
  { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
  true, ["sign", "verify"],
)
const jwk = { ...(await crypto.subtle.exportKey("jwk", publicKey)), kid: "k1" }
const b64 = (x) => Buffer.from(typeof x === "string" ? x : JSON.stringify(x)).toString("base64url")

async function token(claims = {}, { kid = "k1", key = privateKey } = {}) {
  const body = `${b64({ alg: "RS256", kid })}.${b64({
    aud: [AUD], iss: `https://${TEAM}`, email: EMAIL, exp: NOW / 1000 + 600, ...claims,
  })}`
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(body))
  return `${body}.${Buffer.from(sig).toString("base64url")}`
}

// A fake GitHub holding one branch; records writes.
function fakeGitHub(files = {}, { head = "c0" } = {}) {
  const calls = []
  const fetch = async (url, init = {}) => {
    const u = new URL(url)
    const method = init.method || "GET"
    calls.push(`${method} ${u.pathname}`)
    if (u.hostname === TEAM) return Response.json({ keys: [jwk] })
    const route = decodeURIComponent(u.pathname.replace("/repos/mateo19182/blog-19182", ""))
    const body = init.body && JSON.parse(init.body)
    if (route === "/git/ref/heads/main") return Response.json({ object: { sha: head } })
    if (route.startsWith("/git/ref/heads/")) return new Response("", { status: 404 })
    if (route.startsWith("/contents/")) {
      const p = route.slice(10)
      if (p in files) return Response.json({ type: "file", path: p, sha: files[p].sha, encoding: "base64", content: Buffer.from(files[p].text).toString("base64") })
      return new Response("", { status: 404 })
    }
    if (route === "/git/blobs") return Response.json({ sha: `blob${calls.length}` })
    if (route === `/git/commits/${head}`) return Response.json({ tree: { sha: "tree0" } })
    if (route === "/git/trees") return Response.json({ sha: "tree1", body })
    if (route === "/git/commits") return Response.json({ sha: "c1" })
    if (route === "/git/refs/heads/main") return Response.json({ object: { sha: body.sha } })
    return new Response("unexpected", { status: 500 })
  }
  return { fetch, calls }
}

const req = async (path, { tok, method = "GET", body, origin = "https://blog.m19182.dev", host = "blog.m19182.dev" } = {}) =>
  new Request(`https://${host}/api/edit/${path}`, {
    method,
    headers: {
      ...(tok && { "Cf-Access-Jwt-Assertion": tok }),
      ...(body && { "Content-Type": "application/json", Origin: origin }),
    },
    body: body && JSON.stringify(body),
  })

const call = async (r, gh = fakeGitHub(), e = env) => {
  const res = await handle(await r, e, { fetch: gh.fetch, now: () => NOW })
  return { status: res.status, data: await res.json() }
}

test("a valid Access token for the editor's email gets in", async () => {
  const { status, data } = await call(req("me", { tok: await token() }))
  assert.equal(status, 200)
  assert.equal(data.email, EMAIL)
  assert.equal(data.branch, "main")
})

test("missing, forged, expired or foreign tokens are refused", async () => {
  const other = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign"])
  const cases = [
    [undefined, 401],
    [await token({}, { key: other.privateKey }), 401],
    [await token({ exp: NOW / 1000 - 1 }), 401],
    [await token({ aud: ["someone-else"] }), 403],
    [await token({ iss: "https://evil.cloudflareaccess.com" }), 403],
    [await token({ email: "intruder@example.com" }), 403],
    [await token({}, { kid: "unknown" }), 401],
    ["not.a.jwt", 401],
  ]
  for (const [tok, status] of cases) assert.equal((await call(req("me", { tok }))).status, status, String(tok).slice(0, 20))
})

test("the localhost bypass needs EDIT_DEV_EMAIL and a local host", async () => {
  const dev = { ...env, EDIT_DEV_EMAIL: "dev@local" }
  assert.equal((await call(req("me", { host: "localhost:8788" }), undefined, dev)).status, 200)
  assert.equal((await call(req("me", { host: "blog.m19182.dev" }), undefined, dev)).status, 401)
})

const post = "content/writings/Hello.md"
const valid = "---\ntitle: Hello\nsummary: One line.\ndate: 2026-11-14\ntags: [ml]\n---\n\nBody.\n"

test("saves several files as one commit on the branch", async () => {
  const gh = fakeGitHub({ [post]: { sha: "s1", text: "old" } })
  const { status, data } = await call(req("commit", {
    tok: await token(), method: "POST",
    body: { message: "Edit", files: [
      { path: post, content: valid, baseSha: "s1" },
      { path: "content/data/hello-1.webp", base64: "AAAA", baseSha: null },
    ] },
  }), gh)
  assert.equal(status, 200, JSON.stringify(data))
  assert.equal(data.commit, "c1")
  assert.deepEqual(Object.keys(data.files), [post, "content/data/hello-1.webp"])
  assert.ok(gh.calls.includes("PATCH /repos/mateo19182/blog-19182/git/refs/heads/main"))
})

test("refuses to overwrite a file changed since it was opened", async () => {
  const gh = fakeGitHub({ [post]: { sha: "s2", text: "newer" } })
  const { status, data } = await call(req("commit", {
    tok: await token(), method: "POST", body: { message: "Edit", files: [{ path: post, content: valid, baseSha: "s1" }] },
  }), gh)
  assert.equal(status, 409)
  assert.deepEqual(data.conflicts, [post])
  assert.ok(!gh.calls.some((c) => c.startsWith("PATCH")))
})

test("refuses generated files, odd paths, invalid posts and cross-site posts", async () => {
  const tok = await token()
  const commit = (files, origin) => call(req("commit", { tok, method: "POST", body: { message: "x", files }, origin }))
  assert.equal((await commit([{ path: "content/writings/El reto de Feijoo.md", content: valid, baseSha: "s" }])).status, 400)
  assert.equal((await commit([{ path: "functions/api/subscribe.js", content: "x", baseSha: null }])).status, 400)
  assert.equal((await commit([{ path: "content/../build.mjs", content: "x", baseSha: null }])).status, 400)
  const bad = await commit([{ path: post, content: "---\ntitle: Hello\n---\nNo summary or tags", baseSha: null }])
  assert.equal(bad.status, 422)
  assert.match(bad.data.error, /summary/)
  assert.equal((await commit([{ path: post, content: valid, baseSha: null }], "https://evil.example")).status, 403)
})

test("refuses a soundtrack file the repo doesn't have", async () => {
  const withSound = valid.replace("tags: [ml]", "tags: [ml]\nsoundtrack:\n  artist: A\n  title: B\n  file: missing.webm")
  const { status, data } = await call(req("commit", {
    tok: await token(), method: "POST", body: { message: "x", files: [{ path: post, content: withSound, baseSha: null }] },
  }))
  assert.equal(status, 422)
  assert.match(data.error, /missing\.webm/)
})
