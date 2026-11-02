// Outbound links are often pasted with the tracking and referral parameters of
// wherever they were found (newsletters, share buttons, other blogs). The build
// strips those so the links credit nobody else and leak nothing about the reader
// who copied them. Only the query string is touched, and kept parameters stay
// byte for byte, so gift links, playlists and the like keep working.

const ANY_HOST = [
  /^utm_/, /^mc_[ce]id$/, /^_hsmi$/, /^_hsenc$/, /^_bhlid$/, /^fbclid$/, /^gclid$/, /^igshid$/,
  /^smid$/, /^bxid$/, /^cndid$/, /^hash[abc]$/, /^esrc$/, /^_src_ref$/,
]
// Substack, on substack.com or a custom domain (posts live under /p/).
const SUBSTACK = [
  /^r$/, /^triedRedirect$/, /^publication_id$/, /^post_id$/, /^isFreemail$/, /^showWelcomeOnShare$/,
  /^shareImageVariant$/, /^hide_intro_popup$/, /^inbox$/, /^embedding_publication_id$/, /^source$/,
]
const SHARE_ID = /(^|\.)(youtube\.com|youtu\.be|spotify\.com)$/
// `ref` names a git ref on code hosts; everywhere else it credits a referrer.
const CODE_HOST = /(^|\.)(github\.com|gitlab\.com|codeberg\.org|bitbucket\.org|sr\.ht)$/

function dropper(host, pathname) {
  const substack = /(^|\.)substack\.com$/.test(host) || /^\/(p|pub)\//.test(pathname)
  return (key, params) =>
    ANY_HOST.some((re) => re.test(key)) ||
    (substack && SUBSTACK.some((re) => re.test(key))) ||
    (key === "si" && SHARE_ID.test(host)) ||
    (key === "share" && /(^|\.)vimeo\.com$/.test(host)) ||
    ((key === "ref" || key === "referrer") && !CODE_HOST.test(host)) ||
    // left over from signing in to a Ghost site
    ((key === "action" || key === "success") && params.get("action") === "signin")
}

export function cleanUrl(url) {
  const q = url.indexOf("?")
  if (q < 0 || !/^https?:\/\//i.test(url)) return url
  let parsed
  try { parsed = new URL(url) } catch { return url }
  const hash = url.indexOf("#", q)
  const query = url.slice(q + 1, hash < 0 ? undefined : hash)
  const fragment = hash < 0 ? "" : url.slice(hash)
  // Raw HTML attributes may write the separator as &amp;.
  const sep = query.includes("&amp;") ? "&amp;" : "&"
  const parts = query.split(sep)
  const keys = (p) => { try { return decodeURIComponent(p.split("=")[0]) } catch { return p.split("=")[0] } }
  const drop = dropper(parsed.hostname.toLowerCase(), parsed.pathname)
  const kept = parts.filter((p) => p && !drop(keys(p), parsed.searchParams))
  if (kept.length === parts.length) return url
  return url.slice(0, q) + (kept.length ? "?" + kept.join(sep) : "") + fragment
}

// Every http(s) URL in Markdown or raw HTML source. A URL stops at whitespace,
// quotes, angle brackets and the brackets that close Markdown links.
const URL_RE = /https?:\/\/[^\s"'<>\]\)]+/gi

export function cleanLinks(text) {
  return text
    .replace(URL_RE, (match) => {
      if (!match.includes("?")) return match
      // Sentence punctuation after a bare URL is not part of it.
      const [, url, tail] = match.match(/^(.*?)([.,;:!?]*)$/s)
      return cleanUrl(url) + tail
    })
    // Let linked sites see the blog as the referrer.
    .replace(/\brel="noopener noreferrer"/g, 'rel="noopener"')
}
