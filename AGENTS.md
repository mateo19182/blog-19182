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
Projects are data in `content/projects.yml`, with English and Spanish fields side
by side; edit that file, not `projects.md`.
