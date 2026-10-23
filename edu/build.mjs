// Builds the education-only Peptides Nepal site into edu/dist.
// No shop, no prices, no dosing. Data comes from ../data/posts.json and ../data/guide.json.
// Run: node edu/build.mjs   (or `node build.mjs` from inside edu/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'dist');
const SITE = (process.env.EDU_SITE_URL || 'https://learnpeptides.anup-katuwal.com.np').replace(/\/$/, '');
const IG = 'https://www.instagram.com/peptidesnepal/';
const EMAIL = 'contact@anup-katuwal.com.np';
const OLD_MEDIA_HOST = 'peptides.anup-katuwal.com.np';

const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/posts.json'), 'utf8'));
const guide = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/guide.json'), 'utf8'));

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const linkify = s => esc(s).replace(/https?:\/\/[^\s<)]+[^\s<).,;]/g, u => `<a href="${u}" rel="noopener" target="_blank">${u}</a>`);
const stripEmoji = s => s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/\s+/g, ' ').trim();
const slugify = s => {
  const full = stripEmoji(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (full.length <= 64) return full || 'post';
  const cut = full.slice(0, 65);
  return cut.slice(0, cut.lastIndexOf('-')) || full.slice(0, 64);
};
const fmtDate = iso => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kathmandu' });
const isVideo = u => /\.(mp4|mov|webm|m4v)(\?|$)/i.test(u);
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return 0;
  let n = 0;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) n += copyDir(s, d); else { fs.copyFileSync(s, d); n++; }
  }
  return n;
}

// Lines that only make sense inside Instagram, or that we add ourselves.
const DROP = [/^follow @peptidesnepal/i, /^visit (our website|https?:)/i, /^education only/i, /^⚠️ education only/i, /^(📌|📤)/u, /^#\S+(\s+#\S+)*\s*$/];

function parsePost(p) {
  const lines = (p.caption || '').split('\n');
  const first = lines.findIndex(l => l.trim());
  const title = stripEmoji(lines[first] || 'Untitled');
  const body = lines.slice(first + 1).filter(l => !DROP.some(r => r.test(l.trim())));
  const sources = (p.firstComment || '').split('\n').map(l => l.trim().replace(/^[•\-–]\s*/, '')).filter(l => l && !/^sources\b/i.test(stripEmoji(l)));
  const media = (p.images || []).map(u => {
    try {
      const url = new URL(u);
      if (url.hostname === OLD_MEDIA_HOST && url.pathname.startsWith('/media/')) return url.pathname; // copied locally
    } catch { /* keep as is */ }
    return u;
  });
  return { ...p, title, body, sources, media };
}

const items = posts.map(parsePost).sort((a, b) => b.date.localeCompare(a.date));
const used = new Set();
for (const it of items) {
  let s = slugify(it.title), n = 2;
  while (used.has(s)) s = `${slugify(it.title)}-${n++}`;
  used.add(s); it.slug = s;
}

function bodyHtml(lines) {
  const blocks = [];
  let cur = [];
  for (const l of lines) { if (!l.trim()) { if (cur.length) blocks.push(cur); cur = []; } else cur.push(l.trim()); }
  if (cur.length) blocks.push(cur);
  return blocks.map(b => {
    const bullet = /^(→|•|-\s)/;
    if (b.every(l => bullet.test(l))) return `<ul class="points">${b.map(l => `<li>${esc(l.replace(bullet, '').trim())}</li>`).join('')}</ul>`;
    return b.map(l => bullet.test(l) ? `<p class="point">${esc(l.replace(bullet, '').trim())}</p>` : `<p>${esc(l)}</p>`).join('');
  }).join('\n');
}

// ---------- the signature element: a real peptide drawn as a chain of amino acids ----------
const CHAINS = [
  { seq: 'CYIQNCPLG', name: 'Oxytocin', note: '9 amino acids. Made in the brain.' },
  { seq: 'YGGFM', name: 'Met-enkephalin', note: '5 amino acids. One of the brain’s own painkillers.' },
  { seq: 'CYFQNCPRG', name: 'Vasopressin', note: '9 amino acids. Helps your kidneys hold on to water.' },
  { seq: 'GHK', name: 'GHK', note: '3 amino acids. Glycine, histidine, lysine.' },
  { seq: 'YGGFL', name: 'Leu-enkephalin', note: '5 amino acids. One letter away from met-enkephalin.' },
];
function chainSvg({ seq, name }) {
  const n = seq.length, gap = 104, r = 34, w = (n - 1) * gap + r * 2 + 8, h = 190;
  const pts = [...seq].map((_, i) => [r + 4 + i * gap, i % 2 ? h - r - 8 : r + 8]);
  const line = pts.map(p => p.join(',')).join(' ');
  const beads = [...seq].map((a, i) => `<g class="bead" style="--i:${i}"><circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${r}"/><text x="${pts[i][0]}" y="${pts[i][1]}" dy="0.36em">${a}</text></g>`).join('');
  return `<svg class="chain" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(name)} drawn as a chain of ${n} amino acids: ${seq.split('').join(', ')}"><polyline points="${line}"/>${beads}</svg>`;
}

// ---------- page shell ----------
const CSS = fs.readFileSync(path.join(HERE, 'site.css'), 'utf8');
const LOGO = fs.readFileSync(path.join(ROOT, 'favicon.svg'), 'utf8');
const NAV = [['/posts/', 'Posts'], ['/guide/', 'Status guide'], ['/quiz/', 'Quiz'], ['/about/', 'About']];

function page({ title, desc, pathname, body, extraHead = '', current = '' }) {
  const full = title ? `${title} | Peptides Nepal` : 'Peptides Nepal: peptide science in plain English';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${pathname}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${pathname}">
<meta property="og:site_name" content="Peptides Nepal">
<meta name="theme-color" content="#3E481D">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/bricolage-grotesque-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/site.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <a class="brand" href="/" aria-label="Peptides Nepal home">${LOGO.replace('<svg', '<svg class="mark" aria-hidden="true"')}<span>Peptides Nepal</span></a>
  <nav aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${current === h ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <a class="follow" href="${IG}" rel="noopener">Follow<span class="wide"> on Instagram</span></a>
</header>
<main id="main">
${body}
</main>
<footer class="foot"><div class="inner">
  <p class="promise">Peptides Nepal is an education page. We don’t sell anything, we don’t give doses, and nothing here is medical advice. Talk to a qualified doctor before you use any medicine.</p>
  <p><a href="${IG}" rel="noopener">@peptidesnepal on Instagram</a> <span aria-hidden="true">/</span> <a href="mailto:${EMAIL}">${EMAIL}</a></p>
</div></footer>
</body>
</html>
`;
}

function thumb(it, eager = false) {
  const img = it.media.find(u => !isVideo(u));
  const visual = img
    ? `<img src="${esc(img)}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="1080" height="1350">`
    : `<span class="reel-tile" aria-hidden="true"><span>Reel</span></span>`;
  return `<li class="post-item"><a href="/posts/${it.slug}/">${visual}<span class="meta">${fmtDate(it.date)}${img ? '' : ', reel'}</span><span class="t">${esc(it.title)}</span></a></li>`;
}

// ---------- reset output ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
write('site.css', CSS);
write('logo.svg', LOGO);
copyDir(path.join(HERE, 'fonts'), path.join(OUT, 'fonts'));
copyDir(path.join(HERE, 'static'), OUT);
// media for posts hosted on the old site
const mediaSrc = path.join(ROOT, 'public/media');
if (fs.existsSync(mediaSrc)) {
  for (const d of fs.readdirSync(mediaSrc, { withFileTypes: true })) {
    if (d.isDirectory() && d.name !== 'offers') copyDir(path.join(mediaSrc, d.name), path.join(OUT, 'media', d.name));
  }
}

// ---------- home ----------
const statusCount = s => guide.peptides.filter(p => p.status === s).length;
const q0 = guide.quiz[0];
write('index.html', page({
  pathname: '/',
  desc: 'Short, sourced explainers about peptides from @peptidesnepal. Education only: nothing for sale, no doses, no medical advice.',
  body: `
<section class="hero">
  <h1>Peptide science, in plain English.</h1>
  <p class="lede">Short explainers from @peptidesnepal, with a source for every claim. Nothing here is for sale.</p>
  <figure class="chain-fig" data-chains='${esc(JSON.stringify(CHAINS))}'>
    <div class="chain-wrap">${chainSvg(CHAINS[0])}</div>
    <figcaption><strong>${CHAINS[0].name}.</strong> <span>${CHAINS[0].note}</span> <button type="button" class="next-chain">Show another peptide</button></figcaption>
  </figure>
</section>

<section class="block" aria-labelledby="latest">
  <div class="block-head"><h2 id="latest">Latest posts</h2><a href="/posts/">All ${items.length} posts</a></div>
  <ul class="post-grid">${items.slice(0, 6).map((it, i) => thumb(it, i < 2)).join('')}</ul>
</section>

<section class="block split" aria-labelledby="status">
  <div>
    <h2 id="status">Approved, in trials, or not approved?</h2>
    <p>The same peptide name can mean a licensed medicine or an untested vial. Our status guide checks ${guide.peptides.length} peptides people ask about, with sources.</p>
    <p><a class="button" href="/guide/">Open the status guide</a></p>
  </div>
  <ul class="status-list">
    ${guide.peptides.map(p => `<li><span class="dot ${p.status}" aria-hidden="true"></span><span class="n">${esc(p.name)}</span><span class="s">${esc(p.statusLabel)}</span></li>`).join('')}
  </ul>
</section>

<section class="block quiz-teaser" aria-labelledby="quiz-q">
  <h2 id="quiz-q">Myth or fact?</h2>
  <div class="q" data-answer="${q0.answer}">
    <p class="statement">“${esc(q0.statement)}”</p>
    <div class="choices"><button type="button" data-pick="myth">Myth</button><button type="button" data-pick="fact">Fact</button></div>
    <p class="reveal" hidden><strong class="verdict"></strong> ${esc(q0.explanation)}</p>
  </div>
  <p><a href="/quiz/">Take all ${guide.quiz.length} questions</a></p>
</section>
<script src="/site.js" defer></script>`,
}));

// ---------- posts index ----------
write('posts/index.html', page({
  title: 'All posts', pathname: '/posts/', current: '/posts/',
  desc: `Every @peptidesnepal post in one place: ${items.length} short, sourced explainers about peptides.`,
  body: `<section class="block"><h1 class="page-title">All posts</h1><p class="lede">Every post from @peptidesnepal, newest first. Each one lists its sources.</p>
<ul class="post-grid">${items.map((it, i) => thumb(it, i < 2)).join('')}</ul></section>`,
}));

// ---------- post pages ----------
items.forEach((it, i) => {
  const newer = items[i - 1], older = items[i + 1];
  const gallery = it.media.map((u, k) => isVideo(u)
    ? `<li><video src="${esc(u)}" controls playsinline preload="metadata" aria-label="Reel: ${esc(it.title)}"></video></li>`
    : `<li><img src="${esc(u)}" alt="Slide ${k + 1} of ${it.media.length}: ${esc(it.title)}" loading="${k ? 'lazy' : 'eager'}" width="1080" height="1350"></li>`).join('');
  const desc = stripEmoji(it.body.find(l => l.trim()) || it.title).replace(/^(→|•)\s*/, '').slice(0, 155);
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: it.title, datePublished: it.date, author: { '@type': 'Organization', name: 'Peptides Nepal' }, url: `${SITE}/posts/${it.slug}/` };
  write(`posts/${it.slug}/index.html`, page({
    title: it.title, pathname: `/posts/${it.slug}/`, desc, current: '/posts/',
    extraHead: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
    body: `<article class="post">
  <p class="meta"><a href="/posts/">Posts</a> <span aria-hidden="true">/</span> ${fmtDate(it.date)}</p>
  <h1>${esc(it.title)}</h1>
  ${gallery ? `<ul class="gallery${it.media.length > 1 ? ' many' : ''}" aria-label="Post images">${gallery}</ul>${it.media.length > 1 ? '<p class="hint">Swipe or scroll sideways for all slides.</p>' : ''}` : ''}
  <div class="prose">${bodyHtml(it.body)}</div>
  ${it.sources.length ? `<section class="sources" aria-labelledby="src"><h2 id="src">Sources</h2><ol>${it.sources.map(s => `<li>${linkify(s.replace(/^\d+[.)]\s*/, ''))}</li>`).join('')}</ol></section>` : ''}
  <p class="note">Education only. Not medical advice.</p>
  <p><a href="${esc(it.url)}" rel="noopener">See this post on Instagram</a></p>
  <nav class="pager" aria-label="More posts">${newer ? `<a href="/posts/${newer.slug}/"><span>Newer</span>${esc(newer.title)}</a>` : '<span></span>'}${older ? `<a class="older" href="/posts/${older.slug}/"><span>Older</span>${esc(older.title)}</a>` : ''}</nav>
</article>`,
  }));
});

// ---------- status guide ----------
write('guide/index.html', page({
  title: 'Peptide status guide', pathname: '/guide/', current: '/guide/',
  desc: 'Which peptides are approved medicines, which are still in trials, and which have no licensed human use. With sources.',
  body: `<section class="block"><h1 class="page-title">Peptide status guide</h1>
<p class="lede">Where ${guide.peptides.length} commonly discussed peptides stand today. Last reviewed ${esc(guide.lastReviewed)}.</p>
<ul class="legend">${guide.legend.map(l => `<li><span class="dot ${l.status}" aria-hidden="true"></span><span>${esc(l.text)}</span></li>`).join('')}</ul>
${guide.peptides.map(p => `<article class="entry" id="${esc(p.id)}">
  <header><h2>${esc(p.name)}</h2><span class="pill ${p.status}">${esc(p.statusLabel)}</span></header>
  ${p.aka ? `<p class="aka">Also known as ${esc(p.aka)}</p>` : ''}
  <dl>${p.facts.map(f => `<dt>${esc(f.label)}</dt><dd>${esc(f.text)}</dd>`).join('')}</dl>
  ${p.sources?.length ? `<p class="entry-src">Sources: ${p.sources.map(s => `<a href="${esc(s.url)}" rel="noopener" target="_blank">${esc(s.title)}</a>`).join('; ')}</p>` : ''}
</article>`).join('')}
</section>`,
}));

// ---------- quiz ----------
write('quiz/index.html', page({
  title: 'Myth or fact quiz', pathname: '/quiz/', current: '/quiz/',
  desc: `${guide.quiz.length} common peptide claims. Guess myth or fact, then see the answer.`,
  body: `<section class="block"><h1 class="page-title">Myth or fact?</h1>
<p class="lede">${guide.quiz.length} things people say about peptides. Pick an answer to see the explanation.</p>
<p class="score" aria-live="polite">Score: <span class="got">0</span> of <span class="tried">0</span></p>
<ol class="quiz">${guide.quiz.map(q => `<li class="q" data-answer="${q.answer}"><p class="statement">“${esc(q.statement)}”</p><div class="choices"><button type="button" data-pick="myth">Myth</button><button type="button" data-pick="fact">Fact</button></div><p class="reveal" hidden><strong class="verdict"></strong> ${esc(q.explanation)}</p></li>`).join('')}</ol>
</section><script src="/site.js" defer></script>`,
}));

// ---------- about ----------
write('about/index.html', page({
  title: 'About', pathname: '/about/', current: '/about/',
  desc: 'Peptides Nepal explains peptide research in simple words, with a source for every claim. We do not sell products or give doses.',
  body: `<section class="block narrow"><h1 class="page-title">About Peptides Nepal</h1>
<div class="prose">
<p>Peptides Nepal is a small education project from Kathmandu. We explain peptide research in simple English, for students, gym-goers and anyone who keeps hearing the word “peptides”.</p>
<h2>What we do</h2>
<ul class="points"><li>Explain how peptides work in the body.</li><li>Check claims against studies, regulators and anti-doping rules.</li><li>List the sources under every post.</li></ul>
<h2>What we don’t do</h2>
<ul class="points"><li>Sell anything, or point you to sellers.</li><li>Give doses, cycles or injection advice.</li><li>Give medical advice. For that, see a qualified doctor.</li></ul>
<h2>Found a mistake?</h2>
<p>Tell us and we’ll fix it: <a href="mailto:${EMAIL}">${EMAIL}</a>, or send a DM to <a href="${IG}" rel="noopener">@peptidesnepal</a>.</p>
</div></section>`,
}));

write('404.html', page({ title: 'Page not found', pathname: '/404', desc: 'This page does not exist.', body: `<section class="block narrow"><h1 class="page-title">This page doesn’t exist.</h1><p>The link may be old. Try <a href="/posts/">all posts</a> or the <a href="/guide/">status guide</a>.</p></section>` }));

// ---------- small script: chain switcher + quiz ----------
write('site.js', `(() => {
  const fig = document.querySelector('.chain-fig');
  if (fig) {
    const chains = JSON.parse(fig.dataset.chains); let i = 0;
    const draw = c => { const n = c.seq.length, gap = 104, r = 34, w = (n - 1) * gap + r * 2 + 8, h = 190;
      const pts = [...c.seq].map((_, k) => [r + 4 + k * gap, k % 2 ? h - r - 8 : r + 8]);
      return '<svg class="chain" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + c.name + ' drawn as a chain of ' + n + ' amino acids: ' + c.seq.split('').join(', ') + '"><polyline points="' + pts.map(p => p.join(',')).join(' ') + '"/>' +
        [...c.seq].map((a, k) => '<g class="bead" style="--i:' + k + '"><circle cx="' + pts[k][0] + '" cy="' + pts[k][1] + '" r="' + r + '"/><text x="' + pts[k][0] + '" y="' + pts[k][1] + '" dy="0.36em">' + a + '</text></g>').join('') + '</svg>'; };
    fig.querySelector('.next-chain').addEventListener('click', () => { i = (i + 1) % chains.length; const c = chains[i];
      fig.querySelector('.chain-wrap').innerHTML = draw(c);
      fig.querySelector('figcaption strong').textContent = c.name + '.'; fig.querySelector('figcaption span').textContent = c.note; });
  }
  let got = 0, tried = 0;
  document.querySelectorAll('.q').forEach(q => q.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
    if (q.classList.contains('done')) return; q.classList.add('done');
    const right = b.dataset.pick === q.dataset.answer; tried++; if (right) got++;
    b.classList.add(right ? 'right' : 'wrong'); q.querySelectorAll('[data-pick]').forEach(x => x.disabled = true);
    const v = q.querySelector('.verdict'); v.textContent = (right ? 'Right: ' : 'Not quite: ') + 'it’s a ' + q.dataset.answer + '.';
    q.querySelector('.reveal').hidden = false;
    const s = document.querySelector('.score'); if (s) { s.querySelector('.got').textContent = got; s.querySelector('.tried').textContent = tried; }
  })));
})();
`);

// ---------- seo files ----------
const urls = ['/', '/posts/', '/guide/', '/quiz/', '/about/', ...items.map(it => `/posts/${it.slug}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`edu site: ${items.length} posts, ${guide.peptides.length} guide entries, ${guide.quiz.length} quiz items -> ${path.relative(ROOT, OUT)}`);
