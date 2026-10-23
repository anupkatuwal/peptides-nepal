#!/usr/bin/env node
// Writes the education pages as plain, pre-rendered HTML into dist/ after
// `vite build`, so search engines and AI search tools read real text without
// running JavaScript:
//
//   /guides/                 every peptide guide
//   /guides/<peptide>/       one page per guide (src/data/education.json)
//   /posts/                  every Instagram post (data/posts.json)
//   /posts/<title>/          one page per post: full caption, slides, sources
//   /myth-or-fact/           the Myth-or-fact cards
//   /sitemap.xml, /llms.txt
//
//   node scripts/build-learn.mjs [outDir]       (default: dist)
//
// The pages only show what is already in the data files; nothing is invented.
// Output is deterministic for the same data.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, process.argv[2] || "dist");
const SITE = "https://peptides.anup-katuwal.com.np";
const IG = "https://www.instagram.com/peptidesnepal/";
const ORG_ID = `${SITE}/#org`;

const { guides, quiz } = JSON.parse(readFileSync(join(root, "src/data/education.json"), "utf8"));
const posts = JSON.parse(readFileSync(join(root, "data/posts.json"), "utf8"))
  .slice()
  .sort((a, b) => new Date(b.date) - new Date(a.date));

if (!existsSync(out)) {
  console.error(`build-learn: ${out} does not exist. Run vite build first.`);
  process.exit(1);
}

// ── Helpers ────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const noEmoji = (s) => s.replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{20E3}\u{200D}]/gu, "").replace(/\s{2,}/g, " ").trim();
const slugify = (s, max = 70) => {
  let x = noEmoji(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (x.length > max) x = x.slice(0, max).replace(/-[^-]*$/, "");
  return x || "post";
};
const clip = (s, n) => {
  s = s.replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "") + "…";
};
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" });
const isVideo = (u) => /\.(mp4|mov|webm)(\?|$)/i.test(u);
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const write = (path, html) => {
  const dir = join(out, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
};
// Bare URLs in caption text become links (only http/https).
const linkify = (s) => esc(s).replace(/https?:\/\/[^\s<]+[^\s<.,;:!?)]/g, (u) => `<a href="${u}" rel="noopener">${u}</a>`);
const paragraphs = (text) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  .map((p) => `<p>${p.split("\n").map(linkify).join("<br>")}</p>`).join("\n");

// ── Data shaping ───────────────────────────────────────────────────────────
// A guide keeps its published URL even if its name changes.
const guideSlug = (g) => g.slug || slugify(g.name);
const hashtagLine = /^\s*(#\S+\s*)+$/;
const shapePost = (p) => {
  const text = p.caption.split("\n").filter((l) => !hashtagLine.test(l)).join("\n").trim();
  const paras = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const firstLine = paras[0] ? paras[0].split("\n")[0] : "Instagram post";
  const title = noEmoji(firstLine).replace(/^[\s:–—-]+|[\s:–—-]+$/g, "") || "Instagram post";
  const rest = [paras[0] ? paras[0].split("\n").slice(1).join(" ") : "", ...paras.slice(1)].join(" ");
  const tags = (p.caption.match(/#[\p{L}\p{N}_]+/gu) || []).map((t) => t.slice(1));
  const pics = p.images.filter((u) => !isVideo(u));
  const cover = pics[0] || p.poster || null;
  return { ...p, text, title, body: text.slice(firstLine.length).trim(), excerpt: clip(noEmoji(rest), 155), tags, cover };
};
const P = posts.map(shapePost);
const used = new Set();
for (const p of P) {
  let s = slugify(p.title);
  if (used.has(s)) s = `${s}-${p.id}`;
  used.add(s);
  p.slug = s;
}
// A guide and a post are related when the post names the peptide.
const mentions = (text, g) => {
  const names = [g.name, ...g.aka.split(",").map((a) => a.trim())].filter((n) => n.length >= 4);
  return names.some((n) => new RegExp(`(^|[^A-Za-z0-9])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z0-9]|$)`, "i").test(text));
};

// ── Layout ─────────────────────────────────────────────────────────────────
const CSS = `
:root{--ink:#0E2A23;--soft:#3F574D;--paper:#F2F5F3;--line:#CBD5CF;--mist:#E4EBE7;--blue:#2152B8;--green:#1F8A5B;--yellow:#B07D0A;--red:#C2362B}
@font-face{font-family:"DM Sans";src:url(/fonts/dm-sans-latin-400-normal.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"DM Sans";src:url(/fonts/dm-sans-latin-700-normal.woff2) format("woff2");font-weight:700;font-display:swap}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.6 "DM Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--blue);text-underline-offset:3px}
.wrap{max-width:760px;margin:0 auto;padding:0 18px}
header.top{border-bottom:1px solid var(--line);background:#fff}
header.top .wrap{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 18px;padding-top:14px;padding-bottom:14px}
.brand{font-weight:700;color:var(--ink);text-decoration:none;font-size:18px}
nav a{color:var(--ink);text-decoration:none;margin-left:16px;font-size:15px}nav a:first-child{margin-left:0}
nav a[aria-current]{text-decoration:underline}
main{padding:28px 0 56px}
h1{font-size:clamp(30px,6vw,44px);line-height:1.1;margin:.2em 0 .4em}
h2{font-size:24px;line-height:1.25;margin:1.6em 0 .5em}
h3{font-size:19px;margin:0 0 .25em}
.crumbs{font-size:14px;color:var(--soft)}.crumbs a{color:var(--soft)}
.lede{font-size:19px;color:var(--soft)}
.chip{display:inline-block;font-size:13px;font-weight:700;padding:2px 10px;border-radius:999px;border:1px solid currentColor;vertical-align:middle}
.chip.approved{color:var(--green)}.chip.trials{color:var(--yellow)}.chip.not{color:var(--red)}
dl.facts{border-top:1px solid var(--line);margin:1.2em 0}
dl.facts div{border-bottom:1px solid var(--line);padding:12px 0}
dl.facts dt{font-weight:700}dl.facts dd{margin:2px 0 0}
.card{display:block;background:#fff;border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:12px 0;color:var(--ink);text-decoration:none}
.card:hover{border-color:var(--ink)}
.card p{margin:.3em 0 0;color:var(--soft)}
.row{display:flex;gap:14px;align-items:flex-start}.row img{width:88px;height:110px;object-fit:cover;border-radius:6px;flex:none;background:var(--mist)}
time{color:var(--soft);font-size:14px}
.slides{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;margin:16px 0;padding-bottom:6px}
.slides figure{margin:0;flex:0 0 min(88%,420px);scroll-snap-align:start}
.slides img,.slides video{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:8px;background:var(--mist);display:block}
.slides figcaption{font-size:13px;color:var(--soft);margin-top:4px}
.note{background:var(--mist);border-radius:8px;padding:12px 16px;font-size:15px}
.sources li{margin:.3em 0}
.answer{font-weight:700}.answer.myth{color:var(--red)}.answer.fact{color:var(--green)}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:2em;font-size:15px}
footer{border-top:1px solid var(--line);padding:24px 0 40px;font-size:14px;color:var(--soft)}
`;

const nav = (active) => `<header class="top"><div class="wrap">
<a class="brand" href="/guides/">Peptides Nepal</a>
<nav aria-label="Main">${[["/guides/", "Guides"], ["/posts/", "Posts"], ["/myth-or-fact/", "Myth or fact"], ["/about/", "About"]].map(([h, t]) => `<a href="${h}"${active === h ? ' aria-current="page"' : ""}>${t}</a>`).join("")}<a href="${IG}" rel="me noopener">Instagram</a></nav>
</div></header>`;

const page = ({ path, title, description, image, type = "website", active, body, schema, extraHead = "" }) => {
  const url = `${SITE}${path}`;
  const img = image || `${SITE}/og-image.png`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0E2A23">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Peptides Nepal">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/dm-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
${extraHead}<style>${CSS.trim()}</style>
${schema.map(ld).join("\n")}
</head>
<body>
${nav(active)}
<main><div class="wrap">
${body}
</div></main>
<footer><div class="wrap">
<p><strong>Education only. Not medical advice.</strong> Talk to a doctor before using any medicine.</p>
<p>Peptides Nepal · <a href="${IG}" rel="me noopener">@peptidesnepal on Instagram</a> · <a href="/guides/">Guides</a> · <a href="/posts/">Posts</a> · <a href="/myth-or-fact/">Myth or fact</a> · <a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p>
</div></footer>
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
<!-- Metricool tracker: counts visits for the peptidesnepal brand in Metricool. -->
<script>function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript",c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"ce3097acabec72e187fee3182ada01d0"})});</script>
</body>
</html>
`;
};

const crumbs = (items) => ({
  html: `<p class="crumbs">${items.map(([n, p], i) => (i < items.length - 1 ? `<a href="${p}">${esc(n)}</a>` : esc(n))).join(" › ")}</p>`,
  schema: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${p}` })),
  },
});
const FOUNDER = { "@type": "Person", name: "Anup Katuwal", url: "https://anup-katuwal.com.np/" };
const ORG = { "@type": "Organization", "@id": ORG_ID, name: "Peptides Nepal", url: `${SITE}/`, logo: `${SITE}/favicon.svg`, sameAs: [IG], founder: FOUNDER, email: "contact@anup-katuwal.com.np" };
const chip = (g) => `<span class="chip ${g.status === "Approved" ? "approved" : g.status === "In trials" ? "trials" : "not"}">${esc(g.badge || g.status)}</span>`;
const STATUS_TEXT = { Approved: "a licensed medicine in at least one country, prescribed by a doctor", "In trials": "being tested in people and not approved as a medicine", "Not approved": "studied mostly in animals or the lab and not approved as a medicine" };

const postCard = (p) => `<a class="card" href="/posts/${p.slug}/"><div class="row">${p.cover ? `<img src="${esc(p.cover)}" alt="" width="88" height="110" loading="lazy" decoding="async">` : ""}<div><time datetime="${esc(p.date)}">${fmtDate(p.date)}</time><h3>${esc(p.title)}</h3>${p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}</div></div></a>`;
const guideCard = (g) => `<a class="card" href="/guides/${guideSlug(g)}/"><h3>${esc(g.name)} ${chip(g)}</h3><p>${esc(clip(g.facts[0]?.text || g.aka, 150))}</p></a>`;

const urls = []; // for the sitemap: [path, lastmod?]

// ── /guides/<peptide>/ ─────────────────────────────────────────────────────
for (const g of guides) {
  const slug = guideSlug(g);
  const path = `/guides/${slug}/`;
  const related = P.filter((p) => mentions(p.caption, g));
  const akaShort = g.aka.split(",").slice(0, 2).map((s) => s.trim()).join(", ");
  const core = `${g.name}: research, WADA status and sources`;
  const title = core.length <= 46 ? `${core} | Peptides Nepal` : core;
  const description = clip(`${g.name} (${akaShort}) in plain language: ${g.facts[0]?.text || ""} Evidence status, anti-doping status and the studies to read.`, 158);
  const bc = crumbs([["Guides", "/guides/"], [g.name, path]]);
  const body = `${bc.html}
<article>
<h1>${esc(g.name)}: what the research says</h1>
<p class="lede">Also known as ${esc(g.aka)}.</p>
<p>${chip(g)} ${esc(g.name)} is ${STATUS_TEXT[g.status] || esc(g.status)}.</p>
<h2>Key facts</h2>
<dl class="facts">${g.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.text)}</dd></div>`).join("")}</dl>
${g.dopingStatus ? `<h2>Anti-doping (WADA) status</h2>\n<p>${esc(g.dopingStatus)}</p>` : ""}
${g.nepalRegulatoryStatus ? `<h2>Status in Nepal</h2>\n<p>${esc(g.nepalRegulatoryStatus)}</p>` : ""}
<h2>Sources</h2>
<ul class="sources">${g.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title)}</a></li>`).join("")}</ul>
<p class="note">This page explains research. It is not a recommendation to use ${esc(g.name)}. Talk to a doctor before using any medicine.</p>
</article>
${related.length ? `<h2>Instagram posts about ${esc(g.name)}</h2>\n${related.map(postCard).join("\n")}` : ""}
<h2>Other guides</h2>
${guides.filter((x) => x !== g).map(guideCard).join("\n")}`;
  write(path, page({
    path, title, description, type: "article", active: "/guides/", body,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${SITE}${path}#article`,
        headline: `${g.name}: what the research says`,
        description,
        url: `${SITE}${path}`,
        mainEntityOfPage: `${SITE}${path}`,
        inLanguage: "en",
        image: `${SITE}/og-image.png`,
        about: { "@type": "Thing", name: g.name, alternateName: g.aka.split(",").map((s) => s.trim()) },
        citation: g.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
        author: ORG,
        publisher: ORG,
        isPartOf: { "@type": "CollectionPage", "@id": `${SITE}/guides/`, name: "Peptide guides" },
      },
      bc.schema,
    ],
  }));
  urls.push([path]);
}

// ── /guides/ ───────────────────────────────────────────────────────────────
{
  const path = "/guides/";
  const description = `Plain-language guides to ${guides.map((g) => g.name).join(", ")}: what the research shows, evidence and anti-doping status, and the studies to read. For people in Nepal.`;
  const body = `<h1>Peptide guides</h1>
<p class="lede">Plain-language summaries of the peptides people in Nepal ask about most: what they are, what the research shows, their status with the World Anti-Doping Agency, and the studies you can read yourself.</p>
<dl class="facts">
<div><dt><span class="chip approved">Approved</span></dt><dd>A licensed medicine, prescribed by a doctor.</dd></div>
<div><dt><span class="chip trials">In trials</span></dt><dd>Being tested in people. Not approved anywhere yet.</dd></div>
<div><dt><span class="chip not">Not approved</span></dt><dd>Mostly animal or lab studies.</dd></div>
</dl>
${guides.map(guideCard).join("\n")}
<h2>More to read</h2>
<a class="card" href="/myth-or-fact/"><h3>Myth or fact</h3><p>${quiz.length} common claims about peptides, checked against the evidence.</p></a>
<a class="card" href="/posts/"><h3>All Instagram posts</h3><p>${P.length} posts from @peptidesnepal, with full captions and sources.</p></a>`;
  write(path, page({
    path, title: "Peptide guides: BPC-157, semaglutide, tirzepatide and more | Peptides Nepal", description: clip(description, 158), active: path, body,
    schema: [{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE}${path}`,
      name: "Peptide guides",
      description: clip(description, 158),
      url: `${SITE}${path}`,
      inLanguage: "en",
      publisher: ORG,
      mainEntity: { "@type": "ItemList", itemListElement: guides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/guides/${guideSlug(g)}/`, name: g.name })) },
    }],
  }));
  urls.unshift([path]);
}

// ── /posts/<title>/ ────────────────────────────────────────────────────────
P.forEach((p, i) => {
  const path = `/posts/${p.slug}/`;
  const newer = P[i - 1];
  const older = P[i + 1];
  const relatedGuides = guides.filter((g) => mentions(p.caption, g));
  const alt = (k) => (p.alts && p.alts[k]) || `Slide ${k + 1} of ${p.images.length}: ${p.title}`;
  const slides = p.images.map((u, k) => isVideo(u)
    ? `<figure><video controls preload="none" playsinline${p.poster ? ` poster="${esc(p.poster)}"` : ""} src="${esc(u)}" aria-label="${esc(alt(k))}"></video></figure>`
    : `<figure><img src="${esc(u)}" alt="${esc(alt(k))}" width="1080" height="1350" ${k === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></figure>`).join("");
  const bc = crumbs([["Posts", "/posts/"], [clip(p.title, 60), path]]);
  const description = p.excerpt || clip(p.title, 155);
  const body = `${bc.html}
<article>
<time datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
<h1>${esc(p.title)}</h1>
${p.images.length ? `<div class="slides" tabindex="0" aria-label="${p.images.length} slide${p.images.length === 1 ? "" : "s"}">${slides}</div>` : ""}
${paragraphs(p.body)}
${p.firstComment ? `<h2>Sources</h2>\n${paragraphs(p.firstComment)}` : ""}
<p><a href="${esc(p.url)}" rel="noopener">View this post on Instagram →</a></p>
</article>
${relatedGuides.length ? `<h2>Related guides</h2>\n${relatedGuides.map(guideCard).join("\n")}` : ""}
<nav class="pager" aria-label="More posts"><span>${newer ? `<a href="/posts/${newer.slug}/">← ${esc(clip(newer.title, 50))}</a>` : ""}</span><span>${older ? `<a href="/posts/${older.slug}/">${esc(clip(older.title, 50))} →</a>` : ""}</span></nav>`;
  const images = p.images.filter((u) => !isVideo(u));
  const video = p.images.find(isVideo);
  write(path, page({
    path, title: p.title.length <= 46 ? `${p.title} | Peptides Nepal` : clip(p.title, 65), description, image: p.cover, type: "article", active: "/posts/", body,
    extraHead: `<meta property="article:published_time" content="${esc(p.date)}">\n`,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${SITE}${path}#article`,
        headline: clip(p.title, 110),
        description,
        url: `${SITE}${path}`,
        mainEntityOfPage: `${SITE}${path}`,
        datePublished: p.date,
        inLanguage: "en",
        ...(images.length ? { image: images } : p.poster ? { image: [p.poster] } : {}),
        ...(video ? { video: { "@type": "VideoObject", name: p.title, description, contentUrl: video, uploadDate: p.date, thumbnailUrl: p.poster || `${SITE}/og-image.png` } } : {}),
        keywords: p.tags.join(", "),
        isBasedOn: p.url,
        author: ORG,
        publisher: ORG,
      },
      bc.schema,
    ],
  }));
  urls.push([path, p.date.slice(0, 10)]);
});

// ── /posts/ ────────────────────────────────────────────────────────────────
{
  const path = "/posts/";
  const description = `All ${P.length} posts from @peptidesnepal: peptide science in plain language, with full captions, every slide and the sources.`;
  write(path, page({
    path, title: "Instagram posts: peptide science in plain language | Peptides Nepal", description, active: path,
    body: `<h1>Posts from @peptidesnepal</h1>\n<p class="lede">Every post, newest first, with the full caption, every slide and the sources.</p>\n${P.map(postCard).join("\n")}`,
    schema: [{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${SITE}${path}`,
      name: "Posts from @peptidesnepal",
      description,
      url: `${SITE}${path}`,
      inLanguage: "en",
      publisher: ORG,
      mainEntity: { "@type": "ItemList", itemListElement: P.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/posts/${p.slug}/`, name: p.title })) },
    }],
  }));
  urls.push([path, P[0]?.date.slice(0, 10)]);
}

// ── /myth-or-fact/ ─────────────────────────────────────────────────────────
{
  const path = "/myth-or-fact/";
  const description = clip(`Myth or fact? ${quiz.length} common claims about peptides, checked against the evidence: ${quiz.map((q) => q.statement).join(" ")}`, 158);
  const body = `<h1>Myth or fact?</h1>
<p class="lede">Common claims about peptides, and what the evidence says.</p>
${quiz.map((q, i) => `<section class="card" id="${esc(q.id)}"><h2 style="margin-top:0;font-size:20px">${i + 1}. ${esc(q.statement)}</h2><p class="answer ${q.answer}">${q.answer === "myth" ? "Myth" : "Fact"}</p><p>${esc(q.explanation)}</p><p><small>Reference: ${esc(q.reference)}</small></p></section>`).join("\n")}
<h2>Read more</h2>
${guides.map(guideCard).join("\n")}`;
  write(path, page({
    path, title: "Peptide myths and facts, checked against the evidence | Peptides Nepal", description, active: path, body,
    schema: [{ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}${path}`, name: "Myth or fact?", description, url: `${SITE}${path}`, inLanguage: "en", publisher: ORG }],
  }));
  urls.push([path]);
}

// ── /about/ ────────────────────────────────────────────────────────────────
{
  const path = "/about/";
  const description = "Who runs Peptides Nepal, how every guide and post is fact-checked, and how to report a mistake.";
  const body = `<h1>About Peptides Nepal</h1>
<p class="lede">Peptides Nepal explains peptide science in plain language for people in Nepal, with the source for every claim. It started on Instagram as <a href="${IG}" rel="me noopener">@peptidesnepal</a> in September 2026.</p>

<h2>Who runs it</h2>
<p>Peptides Nepal is run by <a href="https://anup-katuwal.com.np/" rel="author">Anup Katuwal</a>, based in Kathmandu. Anup has a background in computer information systems and data analysis (MCIS, NCIT, Pokhara University; BSc, Columbia College, Denver) and competes in men's physique.</p>
<p><strong>Anup is not a doctor or a pharmacist.</strong> The guides summarize published research and official rules. They are not medical advice.</p>

<h2>Why this page exists</h2>
<p>Much of what people hear about peptides comes from gym talk, sellers and social media. This page tries to show what the research and the regulators actually say, including when the honest answer is "we don't know yet".</p>

<h2>How we check facts</h2>
<ol>
<li>Every claim comes from an official or peer-reviewed source: regulators such as the FDA and EMA, anti-doping bodies such as WADA and USADA, or published studies (for example on PubMed).</li>
<li>The sources are listed on every guide, and in the first comment of every Instagram post.</li>
<li>We say clearly when results come only from animal or lab studies, and we give placebo results next to trial numbers.</li>
<li>Posts and guides are researched and drafted with the help of AI tools, then checked against the original sources before they go up.</li>
<li>When we get something wrong, we fix it. In October 2026 we re-checked every guide and Myth-or-fact card and corrected the mistakes we found.</li>
</ol>

<h2>What we don't do</h2>
<ul>
<li>No medical advice, no dosing and no "how to use" instructions in the guides or posts.</li>
<li>No health promises. If a claim isn't supported by good evidence, we say so.</li>
</ul>
<p class="note">Please be aware: this website also has a shop. The guides and posts do not recommend any product, and nothing on these pages is a reason to buy or use one. Talk to a doctor before using any medicine.</p>

<h2>Found a mistake?</h2>
<p>Email <a href="mailto:contact@anup-katuwal.com.np">contact@anup-katuwal.com.np</a> or send a DM to <a href="${IG}" rel="noopener">@peptidesnepal</a> with the page and the source. We'll check it and correct the page if we got it wrong.</p>`;
  write(path, page({
    path, title: "About Peptides Nepal: who we are and how we check facts", description, active: path, body,
    schema: [{
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${SITE}${path}`,
      name: "About Peptides Nepal",
      description,
      url: `${SITE}${path}`,
      inLanguage: "en",
      mainEntity: ORG,
    }],
  }));
  urls.push([path]);
}

// ── /privacy/ and /terms/ (static, so platform reviewers and crawlers can read them without JavaScript) ──
{
  const UPDATED = "23 October 2026";
  const CONTACT = `<a href="mailto:katuwalanup@gmail.com">katuwalanup@gmail.com</a> or WhatsApp <a href="https://wa.me/9779808318864" rel="noopener">+977 9808318864</a>`;

  const privacyBody = `<h1>Privacy Policy</h1>
<p class="lede">Peptides Nepal (operated by Anup Katuwal). Website: ${SITE}. Last updated: ${UPDATED}.</p>

<h2>1. Who we are</h2>
<p>Peptides Nepal publishes educational content about fitness, bodybuilding, weight management, peptide and compound research, and harm reduction. This website also has a shop. Shop orders are fulfilled by a third-party supplier. This policy explains what personal information we collect through the website and our social media channels, why, and your choices.</p>

<h2>2. Information we collect</h2>
<p><strong>Information you give us</strong></p>
<ul>
<li>Order details: name, delivery address, phone number, email, items ordered, and payment confirmation details (for example a transaction reference).</li>
<li>Account details if you create an account: email and sign-in details. Accounts are handled by Google Firebase.</li>
<li>Messages you send us by email or WhatsApp, including your name and contact details.</li>
</ul>
<p><strong>Collected automatically</strong></p>
<ul>
<li>Device and usage data such as browser type, pages viewed, referring page (for example Instagram), approximate location and time of visit.</li>
<li>Local storage on your device that keeps your shopping cart, theme and sign-in session.</li>
<li>Campaign data from links we share on social media (UTM parameters such as source and campaign).</li>
</ul>
<p><strong>From social platforms.</strong> When you interact with our posts on Instagram, TikTok or YouTube, those platforms give us aggregated analytics (views, watch time, likes, comments). We do not receive your private account data.</p>
<p>We do not ask for health conditions or medical history. The products you order may suggest health-related interests. We use that only to fulfil your order and never for advertising. Please do not send us medical information.</p>

<h2>3. Payments</h2>
<p>Payment is taken in advance by eSewa, Khalti, Fonepay, direct bank transfer, Indian UPI/IMPS, another wallet transfer, or cash in advance. Cash on delivery is not available. Wallet and bank providers process payments under their own policies. We never see or store your MPIN, wallet password, bank credentials or card numbers.</p>

<h2>4. How we use information</h2>
<ul>
<li>To take, fulfil, ship and support orders, and to prevent fraud.</li>
<li>To run and secure the website and answer your messages.</li>
<li>To understand which content and pages are useful, and improve them.</li>
<li>To meet legal obligations.</li>
</ul>
<p>We do not sell your personal information to advertisers or data brokers.</p>

<h2>5. Who we share it with</h2>
<ul>
<li><strong>Fulfilment partners:</strong> orders are dispatched from our supplier Apex Supplements Muscle (Noida, India) and its partner company in Delhi. We share the name, delivery address, phone number, email and items ordered that are needed to deliver your order, and the supplier handles these under its own policies. Couriers and customs authorities also process these details during cross-border shipping.</li>
<li><strong>Payment providers:</strong> eSewa, Khalti, Fonepay and your bank, for payments you make.</li>
<li><strong>Hosting and domain:</strong> Vercel hosts the site. Mercantile provides the .com.np domain.</li>
<li><strong>Accounts and order records:</strong> Google Firebase.</li>
<li><strong>Analytics:</strong> Vercel Web Analytics and the Metricool visitor tracker.</li>
<li><strong>Social platforms:</strong> Instagram (Meta), TikTok and YouTube (Google), where you interact with us there.</li>
</ul>
<p>We may also disclose information if the law requires it or to protect our rights and safety.</p>

<h2>6. Cookies and local storage</h2>
<p>We use local storage on your device to keep your cart, theme and sign-in session. To count visits and see which links bring people to the site, we use Vercel Web Analytics and the Metricool tracker. You can block or delete cookies and site data in your browser settings; some parts of the site may stop working if you do.</p>

<h2>7. YouTube API Services</h2>
<p>Our tools use YouTube API Services to publish our own videos and read performance statistics for our own channel. By using features linked to YouTube you agree to the <a href="https://www.youtube.com/t/terms" rel="noopener">YouTube Terms of Service</a>. Google's handling of data is described in the <a href="http://www.google.com/policies/privacy" rel="noopener">Google Privacy Policy</a>. You can revoke access to your Google data at any time on the <a href="https://security.google.com/settings/security/permissions" rel="noopener">Google security settings page</a>. We only access data from channels we own. We do not collect or store viewers' personal data through the API, and access tokens are stored securely and used only for our own accounts.</p>

<h2>8. Data retention</h2>
<p>We keep order records as long as needed for fulfilment, refunds, accounting and legal requirements. Server and analytics logs are kept for between 30 and 90 days. After that we delete or anonymise personal information.</p>

<h2>9. Security</h2>
<p>We use reasonable technical and organisational measures (HTTPS, access controls). No system is perfectly secure, so we cannot guarantee absolute security.</p>

<h2>10. Your rights</h2>
<p>Depending on where you live (including under Nepal's Privacy Act, 2075 (2018), the EU/UK GDPR, or similar laws), you may have the right to access, correct, delete or restrict use of your personal information, to object to processing, and to withdraw consent. Contact us at ${CONTACT} and we will respond within 30 days.</p>

<h2>11. Children</h2>
<p>Our content and shop are for adults. We do not knowingly collect information from anyone under 18. If you think a child has given us information, contact us and we will delete it.</p>

<h2>12. International transfers</h2>
<p>Your information is processed in Nepal, India and by providers in other countries (such as Vercel and Google). Where required, we rely on appropriate safeguards.</p>

<h2>13. Changes</h2>
<p>We may update this policy. The "Last updated" date shows the latest version.</p>

<h2>14. Contact</h2>
<p>Peptides Nepal (operated by Anup Katuwal)<br>${CONTACT}</p>
<p>See also our <a href="/terms/">Terms of Use, Shipping and Returns</a>.</p>`;

  const termsBody = `<h1>Terms of Use, Shipping and Returns</h1>
<p class="lede">Peptides Nepal (operated by Anup Katuwal). Website: ${SITE}. Last updated: ${UPDATED}.</p>
<p>By using this website or placing an order you agree to these terms. If you do not agree, do not use the site.</p>

<h2>1. Education, not medical advice</h2>
<p>The guides, posts and videos are general information and education. They are not medical advice, diagnosis or treatment and do not replace a qualified healthcare professional. Research on many compounds discussed is early, limited or based on animal or lab studies. Do not start, stop or change any treatment without talking to a qualified clinician. We make no claim that any product treats, cures or prevents any condition.</p>

<h2>2. Research use and legality</h2>
<p>Items listed under research categories are sold for in-vitro laboratory research, chemical characterization and analytical reference. They are not intended for unprescribed human consumption or self-administration. Some products are regulated, prescription-only or restricted in some countries. You are responsible for checking that buying, importing, possessing and using a product is lawful where you live, and for making your own informed decision, including reading the scientific literature, before you buy. We do not encourage anyone to use any substance. We may refuse or cancel any order we believe is unlawful or unsafe.</p>

<h2>3. Who can order</h2>
<p>You must be at least 18 years old and able to enter a binding contract, and the information you give must be accurate.</p>

<h2>4. Orders and fulfilment</h2>
<p>Orders are fulfilled and shipped by our supplier Apex Supplements Muscle (Noida, India) and its partner company in Delhi. An order is accepted only when we confirm it to you. We may decline or cancel an order, for example for stock, pricing errors, suspected fraud or legal concerns, and will refund any payment already made for it.</p>

<h2>5. Prices and payment</h2>
<p>Prices are shown in Nepalese rupees, with other currencies for reference only. Payment is taken in full in advance by eSewa, Khalti, Fonepay, direct bank transfer, Indian UPI/IMPS, another wallet transfer, or cash in advance. Cash on delivery is not available. We do not dispatch until payment is verified. Prices may change without notice, but not for orders we have already confirmed.</p>

<h2>6. Shipping</h2>
<ul>
<li><strong>Shipping fee:</strong> a flat fee of ₹4,500 INR per order (roughly NPR 7,200 to 7,500 depending on the exchange rate), covering cross-border customs handling and temperature-controlled logistics.</li>
<li><strong>Delivery time:</strong> at least 10 days and typically within 14 days of payment verification. This is an estimate, not a guarantee.</li>
<li><strong>Packaging:</strong> insulated packaging with cold packs where the product needs it.</li>
<li><strong>Customs:</strong> parcels pass through couriers and customs. Delay, inspection or seizure can happen and is outside our control. Any duties, taxes or fees charged on delivery are your responsibility.</li>
<li><strong>Address:</strong> give a complete, correct delivery address and phone number. We are not responsible for delay or loss caused by wrong details.</li>
</ul>

<h2>7. Returns and refunds</h2>
<p>Products ship sealed from a third party and may be temperature- or health-sensitive, so we do not accept returns of opened or used items. We handle claims in two cases only.</p>
<p><strong>Damaged or accident-affected items.</strong> Contact us within 10 days of receiving the parcel. You must send an unedited, continuous video of the outer parcel being opened that shows the product already damaged, or showing the accident that occurred, together with your order details. Where the product has a manufacturer scratch-off security code, the video should also show the code being scratched and entered. Claims without that video will not be accepted. If the claim is approved, we will arrange a refund or replacement.</p>
<p><strong>Authenticity claims.</strong> If you believe a product is not genuine, you must send us, within 3 weeks of receiving the parcel, a Certificate of Analysis (COA) from a reputable independent laboratory for the product you received, showing the batch number and the test results that support your claim. If the COA supports your claim, we will refund your order and send you a replacement product at no charge. Claims without a COA within that period will not be accepted.</p>
<p>If a parcel is seized by customs or never arrives, contact us and we will work with the supplier to resolve it. Refunds are made to the original payment method or another method we agree with you.</p>

<h2>8. Product information</h2>
<p>Product descriptions, purity and batch information come from the supplier and may change. They are not guarantees of results. Store products as the supplier directs and keep them away from children.</p>

<h2>9. Responsibility and liability</h2>
<p>You are responsible for how you purchase, handle, store and use any product. To the extent the law allows, we are not liable for indirect or consequential loss, or for harm from using products or relying on site content. Nothing in these terms limits liability that cannot be limited by law.</p>

<h2>10. Intellectual property</h2>
<p>The site's text, graphics and design belong to Peptides Nepal or its licensors. Do not copy or reuse them without our written permission.</p>

<h2>11. Third-party links</h2>
<p>The site may link to other websites we do not control. We are not responsible for their content or practices.</p>

<h2>12. Privacy</h2>
<p>How we handle your personal information is described in our <a href="/privacy/">Privacy Policy</a>.</p>

<h2>13. Governing law</h2>
<p>These terms are governed by the laws of Nepal, and disputes are subject to the courts of Nepal, unless the law of your country gives you other rights.</p>

<h2>14. Changes</h2>
<p>We may update these terms. The "Last updated" date shows the latest version. Continued use after a change means you accept it.</p>

<h2>15. Contact</h2>
<p>Peptides Nepal (operated by Anup Katuwal)<br>${CONTACT}</p>`;

  for (const [path, title, description, body] of [
    ["/privacy/", "Privacy Policy | Peptides Nepal", "How Peptides Nepal collects, uses and shares personal information, and your choices.", privacyBody],
    ["/terms/", "Terms of Use, Shipping and Returns | Peptides Nepal", "Terms of use, payment, shipping, returns and refunds for Peptides Nepal.", termsBody],
  ]) {
    write(path, page({
      path, title, description, active: path, body,
      schema: [{ "@context": "https://schema.org", "@type": "WebPage", "@id": `${SITE}${path}`, name: title, url: `${SITE}${path}`, inLanguage: "en" }],
    }));
    urls.push([path]);
  }
}

// ── /sitemap.xml ───────────────────────────────────────────────────────────
const all = [["/"], ...urls];
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(([p, lm]) => `  <url><loc>${SITE}${p}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`);

// ── /llms.txt (a plain map of the site for AI assistants) ──────────────────
writeFileSync(join(out, "llms.txt"), `# Peptides Nepal

> Peptide science in plain language, with the sources, for people in Nepal. From the @peptidesnepal Instagram account. Education only, not medical advice.

## Guides
${guides.map((g) => `- [${g.name}](${SITE}/guides/${guideSlug(g)}/): ${clip(g.facts[0]?.text || g.aka, 140)}`).join("\n")}

## About
- [About Peptides Nepal](${SITE}/about/): who runs the site and how facts are checked.

## Myth or fact
- [Myth or fact?](${SITE}/myth-or-fact/): ${quiz.length} common claims about peptides, checked against the evidence.

## Instagram posts
${P.map((p) => `- [${p.title}](${SITE}/posts/${p.slug}/)${p.excerpt ? `: ${p.excerpt}` : ""}`).join("\n")}
`);

console.log(`learn: ${guides.length} guides, ${P.length} posts, myth-or-fact, sitemap (${all.length} URLs), llms.txt → ${out}`);
