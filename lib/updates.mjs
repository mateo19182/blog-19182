// Life updates (content/updates/*.md, in Spanish) get their own section at the
// bottom of the Now page, under Bio, newest first in both languages.
export function updatesMarkdown(updates, lang) {
  if (!updates.length) return ""
  const heading = lang === "es" ? "Actualizaciones" : "Life updates"
  const items = [...updates]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((u) => `### ${u.title}\n\n${u.content.trim()}`)
  return `\n\n## ${heading}\n\n${items.join("\n\n")}\n`
}

export function appendUpdates(page, updates) {
  if (!page || !updates.length) return
  page.rawContent += updatesMarkdown(updates, page.lang)
  if (page.es) page.es.rawContent += updatesMarkdown(updates, "es")
  if (page.en) page.en.rawContent += updatesMarkdown(updates, "en")
}
