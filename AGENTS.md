# Working on this blog

## Feijoo post

`content/writings/El reto de Feijoo.md` used to be synced from a draft in
`../inv`; it is now an ordinary post, edited here (or in `/edit`) like any
other. Its date stays `2026-10-05`.
Its images, PDFs and research materials live in `content/data/feijoo-preview/`
and `content/data/feijoo-evidence/`. Keep `El reto de Feijoo.en.md` in step.

## Translations

An English post can have a Spanish sibling `Name.es.md`; a Spanish post
(`lang: es`) can have an English sibling `Name.en.md`. Each holds only a `title:`
frontmatter (plus a translated `summary:` for writings) and the translated body,
with the same links, footnote labels and markup as the original. Translated articles show a one-line notice linking back to
the original. Update the translation when you change the original.
`link-archive.es.md` only translates the intro; the build appends the link list.
Each language has its own URL: the original at its path, the translation under
`/es/` (or `/en/` for a Spanish original), linked with `hreflang`. Links between
pages are rewritten to the reader's language and the trailing slash. Old URLs
don't redirect: when renaming a post, its old URL is gone (and the newsletter
announces it again).

## Writings and projects

Every writing has a one-line `summary:` shown in the writings list, and 1–3
topical `tags:` (no catch-all `writing` tag). Add both when you add a post.
`draft: true` keeps a writing, page or update off the site entirely (the web
editor creates new posts that way); `unlisted: true` publishes at its URL only.
When you substantially revise a post, set `updated: YYYY-MM-DD`; the meta line
shows it (only if later than `date`) and the sitemap uses it as `lastmod`. It is
never filled in from git.

Posts that form a series share `series: <name>` with a Spanish `series_es:`, on
the original file only (translations hold just `title`/`summary`). Parts are
ordered by date unless you set `series_order: <n>`. The build adds the series
list under the title and previous/next links at the end. It also lists the
writings that link to a post ("Linked from"), leaving out links within the
same series. Word counts are computed for each language. Do not display reading times.
A writing may have a `soundtrack:` (`artist`, `title`, `file`) on the original
file only. The player loops it, so any length works. The build fails if
`content/data/soundtrack/<file>` is missing. Encode from the library
(`/mnt/data/music-library/library`) as Opus:
`ffmpeg -i <src> -vn -map_metadata -1 -c:a libopus -b:a 64k <file>.webm`, then
run `npm run soundtrack:peaks` (needs ffmpeg) and commit `peaks.json`: the player
draws its waveform and length from it before any audio loads.
Cloudflare Pages rejects files over 25 MiB, about 40 minutes at this rate.
Projects are data in `content/projects.yml`, with English and Spanish fields side
by side; edit that file, not `projects.md`. The page lists them newest first by
`date` under year headings. Each project has 1–3 `tags:` from `PROJECT_TAGS` in
`lib/templates.mjs` (the build fails on unknown ones), and the page filters by them.
`highlight: true` gives a project a framed card; `image: name.webp` (in
`assets/projects/`, 16:10) adds a thumbnail, highlighted or not. For live sites, `npm run screenshots`
(network, needs Chrome) captures missing images; add repo-only ones by hand. Commit
the images.

`![alt](src "wide")` (or a raw `<figure class="wide">`) makes an image use the
full available width. External links show their site's favicon from the cache in
`assets/favicons/`; after adding links to new sites, run `npm run favicons`
(network) and commit the cache. The normal build never fetches; uncached hosts
fall back to the `↗` marker. The build strips tracking and referral parameters
(`utm_*`, Substack `r=`, `?ref=`, share `si=`…) from links in content files via
`lib/links.mjs`, so paste links as they come; gift and unlock parameters stay.

## Web editor

Mateo can also edit content in the browser at `/edit` (see README), which
commits to `main`. Pull before editing the same files
locally. `lib/content.mjs` holds the editor's copy of the rules above:
`READ_ONLY`, writable paths and `validateFile`. Update it when a convention
changes, and keep `npm test` passing (it checks every file in `content/`).
