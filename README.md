# orifeinberg — builder site

Static one-page portfolio hub. Deploys to Vercel as-is (no build step).
Target address: **work.orifeinberg.com** (a subdomain of the existing art site).

```
.
├── index.html      the whole site (self-contained: HTML + CSS + a little JS)
├── vercel.json     security headers
├── .gitignore
└── README.md       this file
```

---

## Deploy in three moves

### 1. Put it on GitHub
Create an empty repo (e.g. `orifeinberg-work`), then from this folder:

```bash
git init
git add .
git commit -m "Phase 1 — portfolio hub"
git branch -M main
git remote add origin git@github.com:<you>/orifeinberg-work.git
git push -u origin main
```

### 2. Import to Vercel
- vercel.com → **Add New… → Project** → import the repo.
- Framework preset: **Other** (it's plain static — no build command, no output dir).
- Deploy. You'll get a live `…vercel.app` URL. Confirm the site looks right there first.

### 3. Attach the subdomain (the only fiddly bit)
This is where `work.orifeinberg.com` gets pointed at Vercel **without touching the art site.**

1. In the Vercel project → **Settings → Domains** → add `work.orifeinberg.com`.
2. Vercel shows you a DNS record to create. For a subdomain it's a **CNAME**:
   - **Type:** CNAME
   - **Name/Host:** `work`
   - **Value/Target:** the hostname Vercel gives you (typically `cname.vercel-dns.com` — use the exact one shown).
3. Add that record **wherever the DNS for `orifeinberg.com` is managed** — this is your registrar *or* the host of the art site (e.g. Squarespace/Wix/Cloudflare, if that's where the paintings site lives). You need to know where that is; see the note below.
4. Save. Vercel auto-issues the HTTPS certificate once the record resolves (usually minutes, up to a couple of hours).

**Nothing about the art site changes.** You're adding one new `work` record. The apex `orifeinberg.com` keeps its existing records and keeps serving the paintings.

> **Where is your DNS?** Whoever you point `orifeinberg.com`'s nameservers to controls DNS. If the art site is on a website builder, its DNS panel is usually inside that builder's dashboard. If unsure, a WHOIS lookup on `orifeinberg.com` shows the nameservers, which tells you where to add the CNAME.

### Changing the prefix
Want `build.` or `studio.` instead of `work.`? Just use that word as the CNAME **Name** and add that domain in Vercel instead. No code change.

---

## Before you share the URL — fill these in

The site is live-able immediately, but these are still placeholders (all marked in the source):

- [ ] **Contact links** — real LinkedIn URL, email, and book-a-call link (search `data-placeholder` in `index.html`).
- [ ] **Voice agent** — drop the `<elevenlabs-convai>` embed where the comment block is in the hero, once you have an agent ID. Set the cost caps first.
- [ ] **Case study 03** — currently a labelled sample (`sample — swap in a real flow`). Replace with a real n8n workflow, or remove.
- [ ] **Helfy / case study 02** — confirm the anonymized framing stays, or swap for a real client flow.
- [ ] **Loom walkthroughs** — replace the poster placeholder with the real embed when recorded (redact everything first).
- [ ] *(optional)* a favicon, and a cross-link to `orifeinberg.com` in the About section.

None of these block going live — you can ship with placeholders and fill them in as you go, since every push auto-redeploys.
