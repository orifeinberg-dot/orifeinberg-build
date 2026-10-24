// build.mjs — turns content/projects/*.md into project pages + homepage cards.
// Zero dependencies on purpose: nothing to install, nothing that can drift.
// Vercel runs it on every push (see vercel.json). Locally: `node build.mjs`.
//
//   src/                    → copied to dist/ (index.html gets the project cards injected)
//   public/                 → copied to dist/ as-is (project assets live in public/projects/<slug>/)
//   templates/project.html  → the one page template every project uses
//   content/projects/*.md   → one file per project (files starting with "_" are ignored)
//
// The build also runs the pre-deploy checklist. Errors stop the deploy (the live site
// stays as it was); warnings are printed but don't block.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE_URL = 'https://build.orifeinberg.com';
const DIST = path.join(ROOT, 'dist');
const SECTIONS = ['hook', 'insight', 'visual payoff', 'how it works', 'what i learned'];
const PLACEHOLDER = /\b(TODO|TBD|lorem ipsum)\b|\[your /i;

let errorCount = 0;
const log = (slug, kind, msg) => {
  if (kind === 'error') errorCount++;
  console.log(`  ${kind === 'error' ? '✗ ERROR' : kind === 'warn' ? '! warn ' : '  ok   '}  [${slug}] ${msg}`);
};

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isExternal = (href) => /^(https?:|mailto:|tel:|#|\/)/i.test(href);

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    e.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

// Frontmatter: simple "key: value" lines. Lists are comma-separated.
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) continue;
    data[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: m[2] };
}
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

// Inline markdown: **bold**, *italic*, `code`, [text](href)
function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
    const ext = /^https?:/i.test(href);
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return t;
}

// Block markdown → structured blocks: paragraph | ul | ol | images
const IMG = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
function parseBlocks(md) {
  const blocks = [];
  for (const chunk of md.trim().split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    if (lines.every((l) => IMG.test(l))) {
      blocks.push({ type: 'images', items: lines.map((l) => { const [, alt, src, title] = l.match(IMG); return { alt, src, title: title || '' }; }) });
    } else if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({ type: 'ul', items: lines.map((l) => l.replace(/^[-*]\s+/, '')) });
    } else if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      blocks.push({ type: 'ol', items: lines.map((l) => l.replace(/^\d+[.)]\s+/, '')) });
    } else {
      blocks.push({ type: 'p', text: lines.join(' ') });
    }
  }
  return blocks;
}

function splitSections(body) {
  const parts = body.split(/^##\s+(.+)$/m);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) out.push({ heading: parts[i].trim(), md: parts[i + 1] || '' });
  return out;
}

const wordCount = (s) => (s.replace(/!\[[^\]]*\]\([^)]*\)/g, '').match(/[A-Za-z0-9'’-]+/g) || []).length;

// ---------- render one project ----------
function renderProject(slug, data, sections, template, report) {
  const assetDir = path.join(ROOT, 'public', 'projects', slug);
  const checkLocal = (href) => {
    if (isExternal(href)) return;
    if (!fs.existsSync(path.join(assetDir, href.split('#')[0]))) report('error', `missing file: public/projects/${slug}/${href}`);
  };
  const external = [];
  const sec = Object.fromEntries(sections.map((s, i) => [SECTIONS[i], s.md]));

  // 1. Hook
  const hookText = parseBlocks(sec['hook']).map((b) => b.text || '').join(' ').trim();
  if (!hookText.endsWith('?')) report('error', 'hook should be a question (end with "?")');

  // 2. Insight
  const insightHtml = parseBlocks(sec['insight']).filter((b) => b.type === 'p').map((b) => `<p>${inline(b.text)}</p>`).join('\n');

  // 3. Visual payoff
  const pb = parseBlocks(sec['visual payoff']);
  const firstMedia = pb.findIndex((b) => b.type === 'images');
  const intro = pb.filter((b, i) => b.type === 'p' && (firstMedia === -1 || i < firstMedia)).map((b) => inline(b.text)).join(' ');
  const caption = pb.filter((b, i) => b.type === 'p' && firstMedia !== -1 && i > firstMedia).map((b) => `<p>${inline(b.text)}</p>`).join('');
  const allMedia = pb.filter((b) => b.type === 'images').flatMap((b) => b.items);
  const isPhone = (m) => /\bphone\b/.test(m.title) && /\.html?$/i.test(m.src);
  const phones = allMedia.filter(isPhone);
  const media = allMedia.filter((m) => !isPhone(m));
  const linkLists = pb.filter((b) => b.type === 'ul').map((b) => b.items);
  const ctas = linkLists[0] || [];      // first list → buttons
  const moreLinks = linkLists.slice(1).flat(); // any further lists → small text links
  if (!allMedia.length) report('error', 'visual payoff has no image, GIF, video or playable demo');
  if (!intro) report('warn', 'visual payoff has no setup line above it');

  const mediaTag = (m, eager) => {
    checkLocal(m.src);
    try { const kb = fs.statSync(path.join(assetDir, m.src)).size / 1024; if (kb > 600) report('warn', `${m.src} is ${Math.round(kb)} KB — resize for phone speed (aim < 400 KB)`); } catch {}
    if (/\.html?$/i.test(m.src)) {
      try { return `<div class="tile-html">${fs.readFileSync(path.join(assetDir, m.src), 'utf8')}</div>`; } catch { return ''; }
    }
    if (/\.(mp4|webm)$/i.test(m.src)) return `<video src="${esc(m.src)}" autoplay muted loop playsinline aria-label="${esc(m.alt)}"></video>`;
    return `<img src="${esc(m.src)}" alt="${esc(m.alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
  };
  let payoffHtml = '';
  if (media.length === 0) {
    payoffHtml = '';
  } else if (media.length === 1) {
    payoffHtml = `<figure class="hero-media">${mediaTag(media[0], true)}${media[0].alt ? `<figcaption>${esc(media[0].alt)}</figcaption>` : ''}</figure>`;
  } else if ((data.layout || '').toLowerCase() === 'carousel') {
    // a swipeable row (slides, carousels): scroll-snap track + prev/next + counter; click to enlarge
    payoffHtml = `<div class="carousel" id="sheet">
  <div class="track" tabindex="0" aria-label="Slides — scroll sideways or use the buttons">
${media.map((m) => `    <figure class="frame"><button type="button">${mediaTag(m)}</button><figcaption>${esc(m.alt)}</figcaption></figure>`).join('\n')}
  </div>
  <div class="car-nav"><button type="button" class="car-prev" aria-label="Previous slide">←</button><span class="car-count" aria-live="polite">1 / ${media.length}</span><button type="button" class="car-next" aria-label="Next slide">→</button></div>
</div>`;
  } else {
    let pos = 0; // grid cells used so far
    payoffHtml = `<div class="sheet" id="sheet">\n` + media.map((m, idx) => {
      const wide = /\bwide\b/.test(m.title);
      const last = idx === media.length - 1;
      let style = '';
      if (wide) {
        // last tile: fill the rest of its row (or the whole row) so the grid ends without gaps;
        // otherwise: double width where it fits
        const spans = [2, 3, 4].map((c) => { const r = pos % c; return last ? (r === 0 ? c : c - r) : Math.min(2, c - r); });
        style = ` style="--span-2:${spans[0]};--span-3:${spans[1]};--span-4:${spans[2]}"`;
        pos += 2;
      } else pos += 1;
      const inner = /\.html?$/i.test(m.src) ? mediaTag(m) : `<button type="button">${mediaTag(m)}</button>`;
      return `  <figure class="frame${wide ? ' wide' : ''}"${style}>${inner}<figcaption>${esc(m.alt)}</figcaption></figure>`;
    }).join('\n') + `\n</div>`;
  }
  const ctaHtml = ctas.map((item, i) => {
    const m = item.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!m) { report('warn', `payoff link isn't a plain [text](link): "${item}"`); return ''; }
    const [, txt, href] = m;
    checkLocal(href);
    if (/^https?:/i.test(href)) external.push(href);
    const dl = /\.(pdf|zip)$/i.test(href) ? ' download' : /^https?:|\.(html?|png|jpe?g|webp|gif)$/i.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a class="cta ${i === 0 ? 'primary' : 'ghost'}" href="${esc(href)}"${dl}>${inline(txt)}</a>`;
  }).join('\n');
  const moreLinksHtml = moreLinks.length ? `<ul class="more-links">${moreLinks.map((item) => {
    const m = item.match(/^\[([^\]]+)\]\(([^)\s]+)\)(.*)$/);
    if (!m) return `<li>${inline(item)}</li>`;
    const [, txt, href, rest] = m; checkLocal(href); if (/^https?:/i.test(href)) external.push(href);
    const tgt = /^https?:|\.(html?|png|jpe?g|webp|gif)$/i.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<li><a href="${esc(href)}"${tgt}>${inline(txt)}</a>${inline(rest)}</li>`;
  }).join('')}</ul>` : '';

  // phone demo: a playable page in a phone frame, with the rest of the payoff in a column beside it
  let captionOut = caption, ctasOut = ctaHtml + moreLinksHtml;
  if (phones.length) {
    const ph = phones[0];
    checkLocal(ph.src);
    payoffHtml = `<div class="demo">
  <figure class="phone-frame"><div class="phone"><iframe src="${esc(ph.src)}" title="${esc(ph.alt)}" loading="lazy"></iframe></div><figcaption>${esc(ph.alt)}</figcaption></figure>
  <div class="demo-side">${payoffHtml}<div class="payoff-caption">${caption}</div><div class="cta-row">${ctaHtml}</div>${moreLinksHtml}</div>
</div>`;
    captionOut = ''; ctasOut = '';
  }

  // 4. How it works
  const steps = parseBlocks(sec['how it works']).filter((b) => b.type === 'ol').flatMap((b) => b.items);
  if (!steps.length) report('error', '"How it works" needs a numbered list (1. 2. 3.)');
  else if (steps.length < 3 || steps.length > 5) report('warn', `"How it works" has ${steps.length} steps (aim for 3–5)`);
  const stepsHtml = steps.map((s) => `<li><div>${inline(s)}</div></li>`).join('\n');
  const stepsIntro = parseBlocks(sec['how it works']).filter((b) => b.type === 'p').map((b) => `<p class="steps-intro">${inline(b.text)}</p>`).join('');

  // 5. What I learned + stack + code
  const learnedHtml = parseBlocks(sec['what i learned']).filter((b) => b.type === 'p').map((b) => `<p>${inline(b.text)}</p>`).join('\n');
  const stack = list(data.stack).length ? list(data.stack) : list(data.tags);
  let codeHtml = '';
  if (data.code && /^https?:/i.test(data.code)) { codeHtml = `<a class="code-link" href="${esc(data.code)}" target="_blank" rel="noopener">View the code${/github\.com/i.test(data.code) ? ' on GitHub' : ''}</a>`; external.push(data.code); }
  else if (data.code && data.code.toLowerCase() !== 'none') { checkLocal(data.code); codeHtml = `<a class="code-link" href="${esc(data.code)}">View the code</a>`; }
  else if (!data.code) report('warn', 'no "code:" link — set a public repo URL, or "code: none" to silence this');

  // links inside paragraphs
  for (const k of ['hook', 'insight', 'how it works', 'what i learned']) for (const [, href] of sec[k].matchAll(/(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g)) {
    if (/^https?:/i.test(href)) external.push(href); else checkLocal(href);
  }

  // page-level checks
  const words = wordCount(sections.map((s) => s.md).join(' '));
  if (words < 250 || words > 450) report('warn', `${words} words (aim for 250–450)`);
  for (const s of sections) if (PLACEHOLDER.test(s.md)) report('error', `placeholder text left in "${s.heading}"`);
  for (const [k, v] of Object.entries(data)) if (PLACEHOLDER.test(v)) report('error', `placeholder text left in "${k}:"`);
  [...new Set(external)].forEach((u) => report('ok', `external link (check it's public): ${u}`));

  const firstImg = media.find((m) => !/\.(mp4|webm|html?)$/i.test(m.src));
  if (data.share_image) checkLocal(data.share_image);
  const vars = {
    TITLE: esc(data.title), HEADING: inline(data.heading || data.title), SUMMARY: esc(data.summary), HOOK: inline(hookText),
    PAYOFF_CAPTION: captionOut, STEPS_INTRO: stepsIntro, STACK_NOTE: data.stack_note ? `<p class="stack-note">${inline(data.stack_note)}</p>` : '',
    INSIGHT: insightHtml, PAYOFF_INTRO: intro, PAYOFF: payoffHtml, CTAS: ctasOut,
    STEPS: stepsHtml, LEARNED: learnedHtml,
    STACK: stack.map((t) => `<li>${esc(t)}</li>`).join(''), CODE: codeHtml,
    URL: `${SITE_URL}/projects/${slug}/`,
    OG_IMAGE: data.share_image ? `${SITE_URL}/projects/${slug}/${data.share_image}` : firstImg ? `${SITE_URL}/projects/${slug}/${firstImg.src}` : '',
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : ''));
}

// ---------- main ----------
console.log('Building build.orifeinberg.com\n');
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(ROOT, 'public'), DIST);
copyDir(path.join(ROOT, 'src'), DIST);

const template = fs.readFileSync(path.join(ROOT, 'templates', 'project.html'), 'utf8');
const contentDir = path.join(ROOT, 'content', 'projects');
const files = fs.existsSync(contentDir) ? fs.readdirSync(contentDir).filter((f) => f.endsWith('.md') && !f.startsWith('_')) : [];
const published = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const parsed = parseFrontmatter(fs.readFileSync(path.join(contentDir, file), 'utf8'));
  const data = parsed.data;
  const body = parsed.body.replace(/<!--[\s\S]*?-->/g, ''); // notes in <!-- --> never reach the page
  const draft = /^(true|yes)$/i.test(data.draft || '');
  // drafts are checked but never block the build and never go live
  const report = (kind, msg) => log(slug, draft && kind === 'error' ? 'warn' : kind, msg);
  if (draft) console.log(`• ${slug}  (draft — checked, not published)`); else console.log(`• ${slug}`);

  const before = errorCount;
  if (!/^[a-z0-9-]+$/.test(slug)) report('error', 'file name must be lowercase-with-dashes (it becomes the URL)');
  for (const k of ['title', 'summary', 'tags']) if (!data[k]) report('error', `missing "${k}:" in the header`);
  if (list(data.tags).length !== 3) report('error', `card needs exactly 3 tags (has ${list(data.tags).length})`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '')) report('error', 'missing "date: YYYY-MM-DD" in the header (the day it first went live on the site)');

  const sections = splitSections(body);
  const headings = sections.map((s) => s.heading.toLowerCase());
  const okOrder = SECTIONS.every((h, i) => headings[i] && headings[i].startsWith(h)) && sections.length === SECTIONS.length;
  if (!okOrder) {
    report('error', `sections must be exactly: ${SECTIONS.map((s) => '## ' + s.replace(/\b\w/g, (c) => c.toUpperCase())).join(', ')} — found: ${sections.map((s) => s.heading).join(', ') || 'none'}`);
    continue;
  }

  const html = renderProject(slug, data, sections, template, report);
  if (draft) { fs.rmSync(path.join(DIST, 'projects', slug), { recursive: true, force: true }); continue; }
  if (errorCount > before) continue;

  fs.mkdirSync(path.join(DIST, 'projects', slug), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'projects', slug, 'index.html'), html);
  published.push({ slug, ...data });
}

// homepage cards — every card (hand-written ones in src/index.html + generated ones)
// is shown newest first. Catalog numbers follow first-published order, so a project
// keeps its number forever. A hand-written card with data-slug="x" disappears once
// content/projects/x.md is published (that's how old cards get migrated).
const homePath = path.join(DIST, 'index.html');
let home = fs.readFileSync(homePath, 'utf8');
const START = /<!-- CARDS:START[^>]*-->/, END = '<!-- CARDS:END -->';
const sm = home.match(START);
if (!sm || !home.includes(END)) { console.log('\n✗ ERROR  src/index.html is missing the <!-- CARDS:START --> / <!-- CARDS:END --> markers'); errorCount++; }
else {
  const a = sm.index + sm[0].length, b = home.indexOf(END);
  const publishedSlugs = new Set(published.map((p) => p.slug));
  const cards = [];
  let seq = 0;
  for (const m of home.slice(a, b).matchAll(/<article class="work-item"([^>]*)>[\s\S]*?<\/article>/g)) {
    const date = (m[1].match(/data-date="([^"]+)"/) || [])[1];
    const slug = (m[1].match(/data-slug="([^"]+)"/) || [])[1];
    if (!date) { console.log('\n✗ ERROR  a hand-written card in src/index.html has no data-date="YYYY-MM-DD"'); errorCount++; }
    if (slug && publishedSlugs.has(slug)) { console.log(`  (hand-written card "${slug}" replaced by its published content file)`); continue; }
    cards.push({ date: date || '0000-00-00', seq: seq++, html: m[0] });
  }
  for (const p of published.sort((x, y) => x.slug.localeCompare(y.slug))) {
    cards.push({ date: p.date, seq: seq++, html: `<article class="work-item">
        <div class="label">
          <div class="cat">cat. 00</div>
          <h3><a class="card-title" href="projects/${p.slug}/">${esc(p.title)}</a></h3>
          <ul class="tags">${list(p.tags).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        </div>
        <div class="work-body">
          <p>${inline(p.summary)}</p>
          <a class="read-more" href="projects/${p.slug}/">Read the case study</a>
        </div>
      </article>` });
  }
  cards.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.seq - y.seq)); // oldest first
  cards.forEach((c, n) => { c.html = c.html.replace(/<div class="cat">cat\. \d+<\/div>/, `<div class="cat">cat. ${String(n + 1).padStart(2, '0')}</div>`); });
  const out = cards.reverse().map((c) => c.html).join('\n\n      '); // newest first
  home = home.slice(0, a) + '\n      ' + out + '\n      ' + home.slice(b);
  fs.writeFileSync(homePath, home);
}

console.log(`\n${published.length} project page(s) published. ${errorCount ? `${errorCount} error(s) — build failed, the live site is unchanged.` : 'No errors.'}`);
process.exit(errorCount ? 1 : 0);
