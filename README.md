# blog-19182

Mateo's personal blog — [blog.m19182.dev](https://blog.m19182.dev).

A small, dependency-light static site generator (no framework). Markdown in,
HTML out. Clean and minimal: black/white in light mode, dark-green/black in dark.

## Stack

- `build.mjs` — the generator. Reads `content/`, renders `public/`.
- `lib/` — markdown pipeline (markdown-it + wikilinks + KaTeX + Shiki),
  HTML templates, OG-image rendering (satori + resvg), RSS/sitemap.
- `assets/` — `styles.css`, fonts, and what gets copied to `/static`.
- `scripts/` — client JS: theme toggle, site search, link-archive filter, sand-garden easter egg.
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
- Site search: `build.mjs` indexes writings plus Now, Projects and Things I like
  with [Pagefind](https://pagefind.app/) into `public/pagefind/` at the end of every
  build. Each language of a page is its own record (one shared index), so results
  show the text that matched and link with `?lang=` to open that language. The
  header button, `/` or Ctrl/Cmd-K opens `scripts/search.js`, which loads the
  index on first use.
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
- Footer sand-garden easter egg (fill the canvas to win).
- Self-hosted Umami analytics.

## Deploy

Cloudflare Pages (git integration):

- Build command: `npm run build`
- Output directory: `public`
- `functions/` is picked up automatically for the markdown-negotiation middleware.

## Newsletter

A small English/Spanish signup form lives at `/subscribe`, linked as Email next
to RSS. It has three lists, each a Resend segment: blog posts (checked by
default), life updates, and a one-time email from
[posthumail](https://github.com/mateo19182/posthumail) if I die.
`?posts=0`, `?updates=1` and `?killswitch=1` preselect them.
`functions/api/subscribe.js` adds the email to the chosen segments and sends a
short welcome email immediately, with no confirmation step. Resend stores the
subscribers and handles the unsubscribe link in each broadcast. There is no
database or additional npm dependency.

To activate it:

1. In Resend, verify your sending domain, create a segment for blog readers,
   and create a full-access API key for contacts and broadcasts.
2. In Cloudflare Pages **production** settings, set `RESEND_API_KEY` as a secret
   and `RESEND_SEGMENT_ID` to that segment's ID, then redeploy.
   Set `RESEND_UPDATES_SEGMENT_ID` and `RESEND_KILLSWITCH_SEGMENT_ID` for the
   other two lists. You can also set `NEWSLETTER_FROM` to customize the sender.
3. In GitHub Actions settings, add the secret `RESEND_API_KEY` and the variables
   `RESEND_SEGMENT_ID` and `NEWSLETTER_FROM`, for example
   `blog.m19182.dev <writings@m19182.dev>` using your verified domain. Set the repository
   variable `NEWSLETTER_ENABLED` to `true` when ready to send.

On pushes to `main` that change writings, the newsletter action compares
published URLs against the commit before the push. It sends each new writing's
title, summary and link after the public `newsletter.json` manifest shows the
post is live. Edits, translations, and unlisted posts don't send mail. Making an
unlisted post public does. When renaming a post, keep its old URL in `aliases`
to avoid announcing it again. Enabling the action does not send the archive.

The action reuses an existing Resend draft on retry and skips broadcasts already
sent or queued. Keep these broadcasts in Resend so retries retain that history.
If deployment or Resend fails, rerun the failed workflow in GitHub Actions.
Emails are English-only and include the title and first five paragraphs, then
a continue-reading link and an unsubscribe link. Spanish originals use their
English translation. The HTML uses the website's warm background, dark text
and understated links, with system font fallbacks for email clients.
Repeated signups don't reset an existing unsubscribe.

Life updates live here, in Spanish. Each is `content/updates/<yyyy-mm>.md`
(`title`, `date`, short body); the build lists them newest first in their own
section under Bio at the bottom of the Now page, in both languages. They are not
writings, so they don't trigger the newsletter action. On the 1st of each month
`.github/workflows/monthly-reminder.yml` opens an issue to update the Now table
and write one. An email to the updates segment, if any, is
`private/updates/<name>.md` (gitignored; `subject:` frontmatter, plain-text
body), sent by posthumail with `bun cli update send <name>`.

Preview what a push would announce without sending any email:

```sh
npm run build
NEWSLETTER_BEFORE=<commit-before-your-post> npm run newsletter:preview
npm run test:newsletter
```

The normal local server serves static files only. To test the signup endpoint
locally, run `npx wrangler pages dev public` with `RESEND_API_KEY` and
`RESEND_SEGMENT_ID` in an untracked `.dev.vars` file. Use a separate test segment.

API references: [contacts](https://resend.com/docs/api-reference/contacts/create-contact)
and [broadcasts](https://resend.com/docs/api-reference/broadcasts/create-broadcast).

## License

Content & code released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
