# blog-19182

Mateo's personal blog — [blog.m19182.dev](https://blog.m19182.dev).

A small, dependency-light static site generator (no framework). Markdown in,
HTML out. Clean and minimal: black/white in light mode, dark-green/black in dark.

## Stack

- `build.mjs` — the generator. Reads `content/`, renders `public/`.
- `lib/` — markdown pipeline (markdown-it + wikilinks + KaTeX + Shiki),
  HTML templates, OG-image rendering (satori + resvg), RSS/sitemap.
- `assets/` — `styles.css`, fonts, and what gets copied to `/static`.
- `scripts/` — client JS: theme toggle, link-archive filter, sand-garden easter egg.
- `content/` — the markdown vault (Obsidian-style `[[wikilinks]]`, frontmatter, tags).
- `functions/_middleware.ts` — Cloudflare Pages markdown content-negotiation.

## Develop

```sh
npm install
npm run build        # -> public/
npm run serve        # build + serve at http://localhost:8080
```

## Features

- Writings index + per-tag browsing, Now / Projects / Things-I-Like / Home pages.
- Link archive (~2,600 links) with a live search + category filter.
- Per-page OpenGraph images, RSS (`/index.xml`), `sitemap.xml`, `robots.txt`.
- A raw `.md` copy of every page, served to clients sending `Accept: text/markdown`
  via the Cloudflare Pages middleware
  ([markdown negotiation](https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/)).
- English/Spanish toggle in the footer. Add a Spanish version of a page as a sibling
  `foo.es.md` (its frontmatter `title` is used). Both languages go into one HTML page
  and the choice is saved in localStorage. Pages without an `.es.md` use the
  language set in frontmatter, or English by default.
- For a Spanish-only page, set `lang: es` in its frontmatter. Its language toggle
  stays disabled until a translation is added.
- Set `unlisted: true` to serve a writing at its URL without adding it to the
  writings index, tags, RSS, or sitemap. The HTML includes a `noindex` meta tag.
- The Feijoo preview is copied from `../inv/feijoo/blog/post/draft.md` with
  `npm run sync:feijoo`. The command copies referenced images, PDFs and text files to `/data/`,
  keeps repository-only Markdown links as plain labels, and leaves the source untouched. Run `npm run build`
  after syncing, or `npm run preview:feijoo` to sync and serve locally.
- Writings frontmatter: `title`, `date`, `tags` (topical, 1–3 per post), and a
  one-line `summary` shown under the title in the writings list (also the fallback
  meta/RSS description). A translation file may carry its own `summary`.
- Rename a writing's file and list the old URL under `aliases:` (e.g.
  `writings/Old-Slug`); the build emits a redirect page there.
- Projects live in `content/projects.yml` (`title`, `title_es`, `url`, `date`,
  `desc`, `desc_es` as inline Markdown, `hidden: true` to keep an entry off the page).
  `projects.md` / `projects.es.md` only hold the page frontmatter.
- `flag/` is copied verbatim to `/flag/`.
- Footer sand-garden easter egg (fill the canvas to win).
- Self-hosted Umami analytics.

## Deploy

Cloudflare Pages (git integration):

- Build command: `npm run build`
- Output directory: `public`
- `functions/` is picked up automatically for the markdown-negotiation middleware.

## License

Content & code released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
