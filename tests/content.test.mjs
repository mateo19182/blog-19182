import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync, readdirSync } from "node:fs"
import {
  validateFile, pathError, fileKind, splitFrontMatter, joinFrontMatter, fileNameFor, translationPath,
} from "../lib/content.mjs"
import { pageMeta } from "../lib/page.mjs"

const soundtracks = readdirSync("content/data/soundtrack")

test("every file in the repository passes the editor's checks", () => {
  const files = [
    ...readdirSync("content").filter((f) => f.endsWith(".md")).map((f) => `content/${f}`),
    ...readdirSync("content/writings").map((f) => `content/writings/${f}`),
    ...readdirSync("content/updates").map((f) => `content/updates/${f}`),
    "content/projects.yml",
  ]
  for (const f of files) assert.deepEqual(validateFile(f, readFileSync(f, "utf8"), { soundtracks }), [], f)
})

test("writing rules from AGENTS.md", () => {
  const p = "content/writings/X.md"
  const fm = (s) => `---\n${s}\n---\n\nBody`
  assert.deepEqual(validateFile(p, fm("title: X\nsummary: S\ndate: 2026-11-14\ntags: [ml]")), [])
  assert.match(validateFile(p, fm("title: X\nsummary: S\ndate: 2026-11-14\ntags: [a, b, c, d]")).join(), /entre 1 y 3/)
  assert.match(validateFile(p, fm("title: X\nsummary: S\ndate: 2026-11-14\ntags: [writing]")).join(), /writing/)
  assert.match(validateFile(p, fm("title: X\ndate: 2026-11-14\ntags: [ml]")).join(), /summary/)
  assert.match(validateFile(p, fm("title: X\nsummary: S\ndate: 2026-11-14\ntags: [ml]\nsoundtrack: {artist: A, title: B, file: nope.webm}"), { soundtracks }).join(), /nope\.webm/)
  assert.match(validateFile("content/writings/X.es.md", fm("title: X\ntags: [ml]")).join(), /solo lleva title y summary/)
  assert.match(validateFile("content/projects.yml", "- title: A\n  tags: [made-up]\n").join(), /made-up/)
  assert.match(validateFile(p, "---\ntitle: [unclosed\n---\n").join(), /front matter/)
})

test("paths the editor may write", () => {
  assert.equal(pathError("content/writings/New post.md"), null)
  assert.equal(pathError("content/writings/New post.es.md"), null)
  assert.equal(pathError("content/updates/2026-11.md"), null)
  assert.equal(pathError("content/projects.yml"), null)
  assert.equal(pathError("content/data/x.webp"), null)
  assert.equal(pathError("content/data/melee/fig.png"), null)
  assert.equal(pathError("assets/projects/x.webp"), null)
  assert.ok(pathError("content/writings/El reto de Feijoo.md"))
  assert.equal(pathError("content/writings/El reto de Feijoo.en.md"), null)
  assert.ok(pathError("content/link-archive.md"))
  for (const p of ["build.mjs", "content/data/x.js", "content/../x.md", "content/a/b/c.md", "functions/x.js", "content/data/a/b/c.png"]) assert.ok(pathError(p), p)
})

test("front matter round-trips; untouched files keep their formatting", () => {
  const src = readFileSync("content/writings/Cybernetics.md", "utf8")
  const { data, body } = splitFrontMatter(src)
  assert.equal(data.date, "2024-01-22")
  assert.equal(src.slice(0, src.length - body.length) + body, src)
  const again = splitFrontMatter(joinFrontMatter({ ...data, draft: true }, body))
  assert.deepEqual(again.data, { ...data, draft: true })
  assert.equal(again.body.trim(), body.trim())
  // false and empty fields are dropped
  assert.doesNotMatch(joinFrontMatter({ title: "T", draft: false, tags: [], updated: "" }, "x"), /draft|tags|updated/)
})

test("kinds, names and siblings", () => {
  assert.equal(fileKind("content/writings/A.md"), "writing")
  assert.equal(fileKind("content/writings/A.es.md"), "translation")
  assert.equal(fileKind("content/now.md"), "page")
  assert.equal(fileKind("content/updates/2026-11.en.md"), "update-translation")
  assert.equal(translationPath("content/writings/A.md"), "content/writings/A.es.md")
  assert.equal(translationPath("content/writings/A.md", "es"), "content/writings/A.en.md")
  assert.equal(fileNameFor('What is "x"? A/B: test'), "What is x AB test")
})

test("draft pages are marked for the build to skip", () => {
  assert.equal(pageMeta("A", "writings", { draft: true }, "").draft, true)
  assert.equal(pageMeta("A", "writings", {}, "").draft, false)
})

test("links to drafts become plain text; cards linking to them are hidden", async () => {
  const { unlinkDrafts, unlinkDraftsMd, visibleProjects } = await import("../lib/page.mjs")
  const drafts = new Set(["/writings/Secret-post"])
  assert.equal(
    unlinkDrafts('<a href="/writings/Secret-post">Post</a>, <a href="https://blog.m19182.dev/writings/Secret-post/#x">again</a>, <a href="/writings/Other">other</a>', drafts),
    'Post, again, <a href="/writings/Other">other</a>',
  )
  assert.equal(unlinkDraftsMd("[Post](/writings/Secret-post), ![img](/writings/Secret-post), [o](/x)", drafts), "Post, ![img](/writings/Secret-post), [o](/x)")
  const cards = visibleProjects([
    { title: "a", url: "https://blog.m19182.dev/writings/Secret-post", date: "2026-01" },
    { title: "b", url: "https://x.dev", date: "2026-02" },
    { title: "c", hidden: true },
    { title: "d", date: "2026-03" },
  ], [...drafts])
  assert.deepEqual(cards.map((p) => p.title), ["d", "b"])
})
