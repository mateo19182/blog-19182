import assert from "node:assert/strict"
import test from "node:test"
import { appendUpdates, updatesMarkdown } from "../lib/updates.mjs"

const updates = [
  { title: "Septiembre 2026", date: "2026-09-20", content: "Older." },
  { title: "Octubre 2026", date: "2026-10-20", content: "Newer.\n" },
]

test("lists updates newest first under a localized heading", () => {
  const md = updatesMarkdown(updates, "en")
  assert.match(md, /^\n\n## Life updates\n/)
  assert.ok(md.indexOf("Octubre 2026") < md.indexOf("Septiembre 2026"))
  assert.match(updatesMarkdown(updates, "es"), /## Actualizaciones/)
  assert.equal(updatesMarkdown([], "en"), "")
})

test("appends to both language slots of the Now page", () => {
  const page = { lang: "en", rawContent: "Now.", es: { rawContent: "Ahora." } }
  appendUpdates(page, updates)
  assert.match(page.rawContent, /Now\.\n\n## Life updates/)
  assert.match(page.es.rawContent, /Ahora\.\n\n## Actualizaciones/)
})
