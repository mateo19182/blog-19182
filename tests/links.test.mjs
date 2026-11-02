import { test } from "node:test"
import assert from "node:assert/strict"
import { cleanUrl, cleanLinks } from "../lib/links.mjs"

test("strips tracking and other people's referrals", () => {
  assert.equal(cleanUrl("https://www.astralcodexten.com/p/bayes?utm_source=%2Finbox&utm_medium=reader2"), "https://www.astralcodexten.com/p/bayes")
  assert.equal(cleanUrl("https://open.substack.com/pub/x/p/y?r=bdhc9&utm_campaign=post-expanded-share&utm_medium=post%20viewer"), "https://open.substack.com/pub/x/p/y")
  assert.equal(cleanUrl("https://cooperative-individualism.org/?ref=thebrowser.com"), "https://cooperative-individualism.org/")
  assert.equal(cleanUrl("https://dispatch-media.com/a/?ref=dispatch-articles-newsletter&action=signin&success=true"), "https://dispatch-media.com/a/")
  assert.equal(cleanUrl("https://youtu.be/abc?si=xyz"), "https://youtu.be/abc")
  assert.equal(cleanUrl("https://ericjmichaud.com/quanta/?referrer=luma"), "https://ericjmichaud.com/quanta/")
})

test("keeps parameters that make the link work", () => {
  const keep = [
    "https://www.economist.com/a?giftId=NTBm&utm_campaign=gifted_article",
    "https://www.nytimes.com/a.html?unlocked_article_code=1.ZVA&smid=tw-share",
    "https://music.youtube.com/playlist?list=OLAK5uy&si=Qq",
    "https://github.com/o/r/blob/x.py?ref=main",
    "https://example.com/search?q=a&r=2",
    "https://www.ft.com/img?source=next-article&width=700",
  ]
  assert.deepEqual(keep.map(cleanUrl), [
    "https://www.economist.com/a?giftId=NTBm",
    "https://www.nytimes.com/a.html?unlocked_article_code=1.ZVA",
    "https://music.youtube.com/playlist?list=OLAK5uy",
    "https://github.com/o/r/blob/x.py?ref=main",
    "https://example.com/search?q=a&r=2",
    "https://www.ft.com/img?source=next-article&width=700",
  ])
})

test("keeps fragments, HTML escapes and surrounding Markdown", () => {
  assert.equal(cleanUrl("https://a.com/x?utm_source=y#part"), "https://a.com/x#part")
  assert.equal(cleanUrl("https://a.com/x?id=1&amp;utm_source=y"), "https://a.com/x?id=1")
  assert.equal(
    cleanLinks("[t](https://a.com/x?utm_source=y \"title\") and https://b.com/?ref=c.com. <a href=\"https://d.com/?utm_medium=e\" rel=\"noopener noreferrer\">"),
    "[t](https://a.com/x \"title\") and https://b.com/. <a href=\"https://d.com/\" rel=\"noopener\">",
  )
})
