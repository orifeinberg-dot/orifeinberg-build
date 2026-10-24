# Adding a project to build.orifeinberg.com

Every project uses the same page layout and the same steps. The goal is to ship a new
project in under an hour, without redesigning anything.

## 1. The page: five blocks, always in this order

1. **Hook** — one bold question that states the problem. A stranger should know in about
   3 seconds whether they care.
2. **Insight** — the core idea in plain language: how you approached it and why. This is
   where "marketer + builder" shows.
3. **Visual payoff** — the single best output, shown big (contact sheet, demo GIF,
   dashboard, chart), with one setup line above it and links to the full thing below.
4. **How it works** — 3 to 5 numbered steps, one plain verb each.
5. **What I learned + stack** — one paragraph on the non-obvious finding, then
   "Built with: …" and a "View the code" link.

Length: about 250 to 450 words. It should scan in 15 seconds and read fully in about a minute.

## 2. The homepage card

A title, one sentence (what it does + the "how is that possible" hook), 3 stack tags,
and a "Read the case study" link. Nothing else.

## 2b. Order on the homepage

Newest first, like a blog: each project's `date` is the day it first went live on the site.
Catalog numbers (cat. 01, 02 …) follow first-published order, so a project keeps its number.

## 3. One content file and one asset folder per project

- `content/projects/<slug>.md` — the five blocks + card fields (title, summary, tags,
  links, date) in one file.
- `public/projects/<slug>/` — images, downloadable files, any self-contained HTML.

Adding a project = adding those two things. The page template and homepage grid read
from them, so no layout code changes.

## 4. Steps for each project

**In the project's own chat (content):**
1. Write the five blocks and the card.
2. Fresh-eyes check: could someone with no context follow every sentence? Explain or cut
   jargon and insider references.
3. Public check: no secrets/keys, nothing you don't want public about where the project
   came from, no third-party content you can't publish (e.g. a competitor's actual ad),
   other brands' logos removed or clearly labeled as unofficial.
4. Collect the assets and write a handoff: copy, card, assets with paths, links, constraints.
   Write the content in the site's format: paste `content/projects/_template.md` into the
   project chat and have it fill that in, so the file drops in without conversion.

**In the site chat (publishing):**
5. Add the content file and asset folder.
6. Check the page and the card at desktop, tablet and phone widths.
7. Review, then deploy.

## Checklist before deploying
- [ ] Hook is a question; insight is understandable without context
- [ ] Visual payoff shows real output, not placeholders
- [ ] All links work (code repo, full output, downloads), and none goes to a private repo
- [ ] Captions/labels on anything using another brand
- [ ] Looks right on phone
