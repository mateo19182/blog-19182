# Working on this blog

## Feijoo draft preview

The author edits the canonical draft at `../inv/feijoo/blog/post/draft.md`.
`content/writings/El reto de Feijoo (borrador).md` is a generated copy for the
public preview. Do not make editorial changes only in that copy; they will be
overwritten on the next sync.

From this repository:

```sh
npm run sync:feijoo
npm run build
```

For a local browser preview, `npm run preview:feijoo` syncs, builds, and serves
the site at `http://localhost:8080`. To update the live preview, commit the
synced blog files and push to `main`; Cloudflare Pages deploys that branch. The
preview URL is `https://blog.m19182.dev/writings/El-reto-de-Feijoo-borrador/`.

The sync command copies referenced local images, PDFs and text files into
`content/data/feijoo-preview/` and maps their URLs. Repository-only Markdown
links and directory links become plain labels. It removes author-only comments
and TODOs from the published copy. Prefer public sources in the draft. The page uses
`unlisted: true`: it has a public URL but stays out of listings, feeds, and the
sitemap, with `noindex` in the HTML.
