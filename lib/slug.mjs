// Slug helpers — replicate the URL shape the old Quartz site used so inbound
// links keep working (spaces -> hyphens, case preserved).

export function fileSlug(name) {
  // name = filename without extension. Keep case + dots (e.g. "pt.1"),
  // drop quotes/brackets/other punctuation, spaces -> hyphens.
  return name
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[()[\]{}]/g, "")
    .replace(/[^\w.\- ]/g, "")
    .replace(/\s+/g, "-")
}

// Normalize a wikilink/page target to a comparable key (lowercased, hyphenless).
export function linkKey(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\.md$/, "")
    .replace(/[-\s]+/g, " ")
}

export function stripMdExt(p) {
  return p.replace(/\.md$/, "")
}
