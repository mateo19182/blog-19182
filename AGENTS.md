# Working on this blog

## Published Feijoo post

The author edits the canonical draft at `../inv/feijoo/blog/post/draft.md`.
`content/writings/El reto de Feijoo.md` is a generated copy for the
published post. Do not make editorial changes only in that copy; they will be
overwritten on the next sync.

From this repository:

```sh
npm run sync:feijoo
npm run build
```

For a local browser preview, `npm run preview:feijoo` syncs, builds, and serves
the site at `http://localhost:8080`. To update the live preview, commit the
synced blog files and push to `main`; Cloudflare Pages deploys that branch. The
preview URL is `https://blog.m19182.dev/writings/El-reto-de-Feijoo/`.

The sync command copies referenced local images, PDFs and text files into
`content/data/feijoo-preview/` and maps their URLs. Repository-only Markdown
links and directory links become plain labels. It removes author-only comments
and TODOs from the published copy. Prefer public sources in the draft. The post is published normally, with date `2026-10-05`, and appears in listings,
feeds, and the sitemap. Its former draft URL redirects to the published URL.

`content/writings/El reto de Feijoo.en.md` is a hand-made English translation of
the synced copy. Sync does not touch it, so update it whenever the draft changes.

Public research materials are generated from the explicit selection in
`../inv/feijoo/blog/materials/`. When changing that selection or its case sheets,
run `python ../inv/feijoo/blog/materials/build_public_materials.py` before sync.
Sync copies the generated HTML, CSV, source metadata and ZIP into
`content/data/feijoo-evidence/`. Keep the private research notes and agent
transcripts out of this public selection.

## Translations

An English post can have a Spanish sibling `Name.es.md`; a Spanish post
(`lang: es`) can have an English sibling `Name.en.md`. Each holds only a `title:`
frontmatter (plus a translated `summary:` for writings) and the translated body,
with the same links, footnote labels and markup as the original. Translated articles show a one-line notice linking back to
the original. Update the translation when you change the original.
`link-archive.es.md` only translates the intro; the build appends the link list.

## Writings and projects

Every writing has a one-line `summary:` shown in the writings list, and 1–3
topical `tags:` (no catch-all `writing` tag). Add both when you add a post.
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
file only, chosen to last about as long as the read (230 wpm). The build fails if
`content/data/soundtrack/<file>` is missing. Encode from the library
(`/mnt/data/music-library/library`) as Opus:
`ffmpeg -i <src> -vn -map_metadata -1 -c:a libopus -b:a 64k <file>.webm`.
Cloudflare Pages rejects files over 25 MiB, about 40 minutes at this rate.
The Feijoo soundtrack lives in the header of `tools/sync-feijoo-preview.mjs`.
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
fall back to the `↗` marker.
