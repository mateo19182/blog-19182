import assert from "node:assert/strict"
import test from "node:test"
import { linkUpdates, updatesPage } from "../lib/updates.mjs"

const updates = [
  { title: "Septiembre 2026", date: "2026-09-20", content: "Antes." },
  { title: "Octubre 2026", date: "2026-10-20", content: "Después.\n", en: { title: "October 2026", content: "Later." } },
]

test("one /updates page, newest first, Spanish original with English fallback", () => {
  const page = updatesPage(updates)
  assert.equal(page.url, "/updates")
  assert.ok(page.es.rawContent.indexOf("## Octubre 2026") < page.es.rawContent.indexOf("## Septiembre 2026"))
  assert.match(page.en.rawContent, /## October 2026\n\nLater\./)
  assert.match(page.en.rawContent, /## Septiembre 2026\n\nAntes\./)
})

test("the Now page gets a small link in both languages", () => {
  const page = { lang: "en", rawContent: "Now.", es: { rawContent: "Ahora." } }
  linkUpdates(page)
  assert.match(page.rawContent, /<a href="\/updates">Life updates →<\/a>/)
  assert.match(page.es.rawContent, /<a href="\/updates">Actualizaciones →<\/a>/)
})
