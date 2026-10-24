# build.orifeinberg.com

Static site on Vercel. On every push, Vercel runs `node build.mjs`, which builds the site into
`dist/` and serves that. No dependencies, nothing to install, nothing that updates itself.

```
src/index.html              homepage (edit this, not dist/)
templates/project.html      the one template every project page uses
content/projects/<slug>.md  one file per project: card fields + the five blocks
public/projects/<slug>/     that project's images, PDFs, self-contained HTML
build.mjs                   turns the above into dist/
```

## Adding a project

The full process and checklist is in `docs/adding-a-project.md`. The mechanics:

1. Copy `content/projects/_template.md` to `content/projects/<slug>.md` and fill it in.
   The file name becomes the URL: `ad-intelligence.md` → `/projects/ad-intelligence/`.
2. Put its files in `public/projects/<slug>/` and refer to them by name in the content file.
3. Push. The page and the homepage card appear on their own.

Keep `draft: true` in the header while you work. Drafts are checked but never published.

The homepage lists projects newest first by `date` (the day a project first went live).
Hand-written cards in `src/index.html` need a `data-date`; one with `data-slug="x"` is
replaced automatically once `content/projects/x.md` is published.

## What the build checks

The build fails, and the live site stays as it was, if a project has:
- a hook that isn't a question
- missing or out-of-order sections (Hook, Insight, Visual payoff, How it works, What I learned)
- no image, GIF or video in the visual payoff
- a link or image pointing at a file that isn't in its `public/projects/<slug>/` folder
- leftover placeholder text (TODO, TBD, "[your …")
- a card without exactly 3 tags, or no `date: YYYY-MM-DD`

It warns (but still deploys) on: length outside 250–450 words, fewer than 3 or more than 5
steps, images over 600 KB, and no code link. It also lists every external link so you can
confirm none points at a private repo; it can't check that for you.

## Preview locally

`npm run preview`, then open http://localhost:8080 (needs Node 18+ and Python 3).
