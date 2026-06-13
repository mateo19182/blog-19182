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
- Footer sand-garden easter egg (fill the canvas to win).
- Self-hosted Umami analytics.

## Deploy

Cloudflare Pages (git integration):

- Build command: `npm run build`
- Output directory: `public`
- `functions/` is picked up automatically for the markdown-negotiation middleware.

## License

Content & code released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
