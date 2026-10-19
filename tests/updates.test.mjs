import assert from "node:assert/strict"
import test from "node:test"
import { appendUpdates, updatesMarkdown } from "../lib/updates.mjs"

const updates = [
  { title: "Q3 2026", date: "2026-09-22", content: "Older." },
  { title: "Q4 2026", date: "2026-12-21", content: "Newer.\n" },
]

test("lists updates newest first under a localized heading", () => {
  const md = updatesMarkdown(updates, "en")
  assert.match(md, /^\n\n## Quarterly updates\n/)
  assert.ok(md.indexOf("Q4 2026") < md.indexOf("Q3 2026"))
  assert.match(updatesMarkdown(updates, "es"), /## Actualizaciones trimestrales/)
  assert.equal(updatesMarkdown([], "en"), "")
})

test("appends to both language slots of the Now page", () => {
  const page = { lang: "en", rawContent: "Now.", es: { rawContent: "Ahora." } }
  appendUpdates(page, updates)
  assert.match(page.rawContent, /Now\.\n\n## Quarterly updates/)
  assert.match(page.es.rawContent, /Ahora\.\n\n## Actualizaciones trimestrales/)
})
