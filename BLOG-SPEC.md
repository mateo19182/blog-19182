# blog-19182 — rebuild spec

A framework-agnostic inventory of everything the blog at **https://blog.m19182.dev**
currently does, written so it can be rebuilt from scratch on any stack (or a fresh
Quartz). Current implementation: **Quartz v4** (fork of `jackyzha0/quartz`), deployed
on **Cloudflare Pages**.

---

## 1. Site identity & config

| Setting | Value |
| --- | --- |
| Page title | `blog-19182` |
| Base URL | `https://blog.m19182.dev` |
| Author | Mateo |
| Locale | `en-US` |
| SPA navigation | enabled (client-side route transitions) |
| Link popovers | disabled |
| Default date | `created` |
| Ignore patterns | `private`, `templates`, `.obsidian` |

**Analytics:** self-hosted **Umami** — host `https://umami.m19182.dev`, website id
`23e4acbd-b580-49f5-8582-40c77218c6cc`. Loaded as a deferred script; must re-track on
SPA navigation.

---

## 2. Theme

**Fonts (Google Fonts):**
- Header: **Merriweather**
- Body: **Archivo**
- Code: **Space Mono**

**Color palette:**

| Token | Light | Dark |
| --- | --- | --- |
| light (bg) | `#f5f5f5` | `#0c0c0c` |
| lightgray | `#e6e6e6` | `#1e1e1e` |
| gray | `#a0a0a0` | `#b0b0b0` |
| darkgray | `#707070` | `#e0e0e0` |
| dark (text) | `#303030` | `#f5f5f5` |
| secondary | `#505050` | `#1a8c4a` (green) |
| tertiary | `#707070` | `#606060` |
| highlight | `rgba(64,64,64,0.1)` | `rgba(255,255,255,0.15)` |
| textHighlight | `#fff23688` | `#b3aa0288` |

Dark mode toggle is present; dark mode uses a green accent (`#1a8c4a`).

---

## 3. Content model

Markdown files (Obsidian-style vault: `[[wikilinks]]`, tags, frontmatter). Structure:

```
content/
  index.md            # Home — short intro + links to the main sections
  now.md              # /now page — current work + a "consuming" table (reading/watching/listening)
  projects.md         # Projects — custom inline HTML/CSS card list (see §4)
  things-i-like.md     # Curated lists (software, etc.), tag-grouped
  link-archive.md      # ~2600 archived links (see §4 — has a custom filter UI)
  writings/           # 22 essays/posts
  data/               # binary assets (2022.jpeg, Embodied_Evolution.pdf)
```

### Frontmatter conventions
- `title:` (string)
- `date:` (ISO `YYYY-MM-DD`; a few legacy entries are freeform — normalize on rebuild)
- `tags:` (list). Tag vocabulary in use: `writing`, `computers`, `complex systems`,
  `music`, `policy`, `personal`, `rambling`. Most posts carry `writing` + one topic tag.

### Writings (22 posts, oldest→newest topics span 2023–2026)
Music (4: yearly faves 2023/24/25, hi-fi paradox, "mapping music's search space" pt.1/2),
complex systems (cybernetics, consciousness, models, antimemetics, looping effect,
determining-humanity loss function), policy (georgism, copyright+AI, the case against
marketing), computers (homelab, embodied evolution, Arcus CTF write-up), personal/rambling
(hobbies, cogsec, time-tracking, "stick your head out the pond").

---

## 4. Custom features (the differentiators — these are what make it *this* blog)

These are the non-default pieces. Anything here must be re-implemented (or consciously
dropped) on a new stack.

### 4.1 Link archive + live filter
- `link-archive.md` is a flat bulleted list of ~2,600 links, one per line, format:
  ```
  - [Title](url) `Category` *YYYY-MM-DD*
  ```
- Categories (the `` `Category` `` code badge): **Tech** (~670), **Reads** (~650),
  **Ideas** (~280), **Wikis** (~170), **Arts** (~90), **Weird** (~80),
  **Publications** (~45), **Blogs** (~17).
- A **client-side filter widget** is injected only on this page: a text search box +
  a category dropdown (populated from the `<code>` badges) + a results count. It
  filters the rendered `<li>` items live. Date is parsed from the trailing `*...*`.
- Updated ~weekly from a personal collection.

### 4.2 Footer sand-garden easter egg
- Footer shows: `CC0 1.0` license link · "Created with Quartz v{version}" · © year.
- A collapsible `<details>` reveals a **falling-sand automata** on a 200×150 canvas
  (5px cells). Click/drag drops sand; it piles up with left/right settling.
- When the grid fills completely, it draws out a pixel **"gj"** pattern, then (in the
  latest iteration) a celebratory **winner screen** (confetti + glowing "gj / YOU WIN").
  A **Clear** button resets it.
- Desktop-only. Script should run after DOM ready *and re-init on SPA navigation*.

### 4.3 Projects page
- `projects.md` hand-rolls a **card layout** with inline `<style>` + `<div class="project-card">`
  blocks (title, description, links). ~96 lines of embedded HTML/CSS. Uses theme CSS vars
  (`--light` etc.). On a new framework, model this as a proper component/collection.

### 4.4 Raw-markdown content negotiation (for agents/LLMs)
- A custom emitter writes a raw `.md` copy of every page next to its `.html`
  (skipping tag listing pages).
- A **Cloudflare Pages middleware** (`functions/_middleware.ts`) does content negotiation:
  when a client sends `Accept: text/markdown`, it serves the `.md` (with
  `X-Markdown-Tokens` header + `Vary: Accept`); browsers still get HTML.
- Implements the convention at `isitagentready.com/.well-known/agent-skills/markdown-negotiation`.
- **Reusable as-is** on any host that supports edge middleware / redirects, as long as
  the build emits the `.md` files.

### 4.5 "Now" page consuming-table
- `now.md` has a markdown table tracking current Reading / Watching / Listening / Other,
  updated over time (monthly-ish entries).

---

## 5. Layout (current v4 arrangement)

- **Header (top bar):** page title · search · dark-mode toggle (mobile adds a spacer).
- **beforeBody:** breadcrumbs (spacer `->`, current page hidden) · article title ·
  content meta (date/reading time) · tag list · *[link-archive filter on that page only]*.
- **Left sidebar:** Recent Notes (limit 3) — **home page only**.
- **Right sidebar:** table of contents (desktop only).
- **Footer:** custom footer (§4.2), desktop only.
- **Deliberately OFF:** graph view, explorer/file tree, backlinks (all commented out in v4).

Search (full-text), tags pages, and folder listing pages are standard Quartz features in use.

---

## 6. Markdown / rendering features in use
- Obsidian-flavored markdown: `[[wikilinks]]`, callouts, embeds (HTML embed disabled).
- GitHub-flavored markdown.
- **LaTeX** via KaTeX.
- Syntax highlighting (`github-light` / `github-dark`, no background box).
- Table of contents, breadcrumbs, reading time, descriptions/excerpts.
- **Footnotes**: standard `[^n]` markers + `[^n]: …` definitions (`markdown-it-footnote`). Don't add a manual `---` or `## Footnotes` heading — the plugin emits its own `<hr class="footnotes-sep">` and list. `scripts/footnotes.js` enhances them: Tufte margin sidenotes ≥1400px, hover-preview popovers on narrower hover screens, plain `:target`-highlighted bottom notes otherwise.
- Link crawling with `shortest` markdown-link resolution.
- Drafts removed from output (`RemoveDrafts`).

---

## 7. Output / infra
- **RSS feed** (`index.xml`) and **sitemap.xml**.
- **OpenGraph images** auto-generated per page.
- **Favicon**.
- **Alias redirects** (frontmatter `aliases`).
- **Deploy:** Cloudflare Pages (git integration), output dir `public/`, plus the
  `functions/` Pages middleware (§4.4). License: CC0 1.0.

---

## 8. Rebuild priority checklist

**Must-have (core identity):**
- [ ] All `content/` markdown migrated, frontmatter normalized (fix the few freeform dates).
- [ ] Writings index + per-tag browsing.
- [ ] Link archive page + the live search/category filter (§4.1).
- [ ] Now page, Projects page (as proper components), Things-I-like, Home.
- [ ] Theme: the exact fonts + light/dark palette (§2).
- [ ] Umami analytics (§1), SPA-safe.
- [ ] RSS + sitemap + OG images.

**Signature extras (keep if the stack allows):**
- [ ] Footer sand-garden easter egg + winner screen (§4.2) — pure canvas JS, portable.
- [ ] Raw-markdown emit + `Accept: text/markdown` negotiation (§4.4) — portable to any edge host.

**Drop / reconsider:**
- The dead `memeticGraph` component (unwired, placeholder URL) — do not port.
- Graph/explorer/backlinks were intentionally disabled — only add back if wanted.

---

## 9. Notes from the abandoned Quartz v5 attempt
A v5 migration was prototyped on the `v5-migration` branch and abandoned. Lessons worth
carrying:
- v5 moves all plugins to external `github:quartz-community/*` repos + a `quartz.config.yaml`
  + lockfile; custom components must be standalone built plugins (heavier than v4).
- Local plugins load under plain Node (native TS stripping, **no JSX**), so custom JSX
  components/scripts had to be pre-transpiled to `.js` — clunky for a few small customizations.
- If staying on Quartz, v4 is simpler for this amount of customization. If switching
  frameworks, the three portable assets above (filter JS, sand-garden canvas, markdown
  negotiation) carry over cleanly; everything else is content + theming.
