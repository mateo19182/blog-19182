// Life updates are content/updates/<yyyy-mm>.md, written in Spanish, each with an
// optional English translation <yyyy-mm>.en.md. They become one /updates page,
// newest first, linked from a small line at the bottom of the Now page.

function updatesMarkdown(updates, slot) {
  return [...updates]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((u) => {
      const v = (slot && u[slot]) || u
      return `## ${v.title}\n\n${v.content.trim()}`
    })
    .join("\n\n") + "\n"
}

export function updatesPage(updates) {
  const es = { title: "Actualizaciones", summary: "", rawContent: updatesMarkdown(updates) }
  return {
    name: "updates", section: null, slug: "updates", url: "/updates", isHome: false,
    title: es.title, lang: "es", unlisted: false, date: "", updated: "",
    series: "", seriesEs: "", seriesOrder: null, summary: "",
    description: "Occasional life updates from Mateo.", tags: [], aliases: [],
    rawContent: es.rawContent, isArticle: false,
    en: { title: "Life updates", summary: "", rawContent: updatesMarkdown(updates, "en") },
    es, translated: "en",
  }
}

export function linkUpdates(page) {
  const line = (label) => `\n\n<p class="updates-link"><a href="/updates">${label} →</a></p>\n`
  page.rawContent += line(page.lang === "es" ? "Actualizaciones" : "Life updates")
  if (page.es) page.es.rawContent += line("Actualizaciones")
  if (page.en) page.en.rawContent += line("Life updates")
}
