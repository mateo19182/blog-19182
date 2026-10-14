// Favicons for external links, read from the cache in assets/favicons/.
// `manifest.json` maps each host to a cached PNG, or to null when no icon was
// found; tools/fetch-favicons.mjs fills it. The build never touches the network.
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

export const FAVICON_DIR = "assets/favicons"

export function faviconHost(href) {
  try {
    const { protocol, hostname } = new URL(href)
    if (protocol !== "http:" && protocol !== "https:") return null
    return hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return null
  }
}

export function loadFavicons(root) {
  const file = path.join(root, FAVICON_DIR, "manifest.json")
  const manifest = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {}
  const seen = new Set()
  return {
    // URL of the cached icon for a link, or null to fall back to the ↗ marker.
    lookup(href) {
      const host = faviconHost(href)
      if (!host) return null
      seen.add(host)
      return manifest[host] ? `/static/favicons/${manifest[host]}` : null
    },
    seen,
    unknown: () => [...seen].filter((h) => !(h in manifest)).sort(),
  }
}
