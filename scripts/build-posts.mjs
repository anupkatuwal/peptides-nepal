#!/usr/bin/env node
// Keeps the "Latest from Instagram" section in step with @peptidesnepal.
//
//   node scripts/build-posts.mjs                      rebuild index.html from data/posts.json
//   node scripts/build-posts.mjs metricool.json       merge a saved Metricool getScheduledPosts
//                                                     response first, then rebuild
//
// Only posts Metricool reports as PUBLISHED on Instagram are added. Existing
// posts are never removed (a post deleted on Instagram must be removed from
// data/posts.json by hand). Output is deterministic: running it twice with the
// same data leaves index.html byte-for-byte unchanged.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = join(root, "data/posts.json");
const INDEX = join(root, "index.html");
const START = /<!-- POSTS:START[^>]*-->/;
const END = "<!-- POSTS:END -->";

const posts = JSON.parse(readFileSync(POSTS, "utf8"));
const fail = (msg) => { console.error(`build-posts: ${msg}`); process.exit(1); };

// Only links to Instagram and images on Metricool's CDN are accepted. The CSP
// in vercel.json only allows images from static.metricool.com anyway, and
// this stops a javascript: or look-alike URL ever reaching the page.
const httpsOn = (url, hosts) => {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch { return false; }
};
const POST_HOSTS = ["instagram.com"];
const IMAGE_HOSTS = ["static.metricool.com"];

// ── 1. Optional merge of a Metricool response ──────────────────────────────
const input = process.argv[2];
let added = 0;
const skipped = [];
if (input) {
  let raw;
  try { raw = JSON.parse(readFileSync(input, "utf8")); }
  catch (e) { fail(`${input} is not valid JSON (${e.message}). The Metricool call probably failed; nothing was changed.`); }
  // An error or rate-limit reply has no "data" array. Treat that as a failed
  // sync, not as "no new posts", so the daily task reports it.
  const items = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;
  if (!items) fail(`Metricool reply has no "data" list (got: ${JSON.stringify(raw).slice(0, 200)}). Nothing was changed.`);
  const known = new Set(posts.map((p) => p.url));
  for (const it of items) {
    const ig = (it.providers || []).find((p) => p.network === "instagram" && p.status === "PUBLISHED" && p.publicUrl);
    if (!ig || known.has(ig.publicUrl)) continue;
    const d = it.publicationDate || {};
    if (d.timezone && d.timezone !== "Asia/Kathmandu") {
      fail(`Unexpected timezone ${d.timezone} on post ${it.id}; ask getScheduledPosts for Asia/Kathmandu`);
    }
    const date = `${d.dateTime}+05:45`;
    if (!d.dateTime || Number.isNaN(new Date(date).getTime())) { skipped.push(`${it.id}: bad date ${d.dateTime}`); continue; }
    if (!httpsOn(ig.publicUrl, POST_HOSTS)) { skipped.push(`${it.id}: link not on instagram.com (${ig.publicUrl})`); continue; }
    const images = (it.media || []).filter((m) => httpsOn(m, IMAGE_HOSTS));
    if (images.length !== (it.media || []).length) skipped.push(`${it.id}: dropped ${(it.media || []).length - images.length} image(s) not on static.metricool.com`);
    posts.push({ id: String(it.id), url: ig.publicUrl, date, caption: it.text || "", images });
    known.add(ig.publicUrl);
    added++;
  }
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// ── 2. Render ──────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kathmandu" });
};
// Hashtag-only lines are dropped from what the page shows.
const clean = (caption) => caption.split("\n").filter((l) => !/^\s*(#\S+\s*)+$/.test(l)).join("\n").trim();

function render(p) {
  const text = clean(p.caption);
  const paras = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const title = paras[0] ? paras[0].split("\n")[0] : "Instagram post";
  const restOfFirst = paras[0] ? paras[0].split("\n").slice(1).join(" ") : "";
  let excerpt = [restOfFirst, ...paras.slice(1)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (excerpt.length > 170) excerpt = excerpt.slice(0, 170).replace(/\s+\S*$/, "") + "…";
  const slides = p.images.length;
  // Every slide of the carousel, in order. CSS scroll-snap makes the strip
  // swipeable on its own; app.js adds arrows and the "2 / 7" counter.
  // Images go through Vercel Image Optimization (vercel.json "images"): it
  // fetches the Metricool original once, then serves a cached AVIF/WebP at
  // the width the phone needs. data-orig is the fallback app.js switches to
  // if the optimizer ever fails (for example over the monthly Hobby limit).
  const opt = (src, w) => `/_vercel/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;
  const media = slides
    ? p.images.map((src, i) => `<a class="slide" href="${esc(p.url)}" rel="noopener" tabindex="-1"><img src="${opt(src, 640)}" srcset="${opt(src, 360)} 360w, ${opt(src, 640)} 640w, ${opt(src, 1080)} 1080w" sizes="(max-width: 760px) calc(100vw - 36px), 360px" data-orig="${esc(src)}" alt="${i === 0 ? `First slide of the post: ${esc(title)}` : `Slide ${i + 1} of ${slides}: ${esc(title)}`}" loading="lazy" decoding="async" width="1080" height="1350" /></a>`).join("")
    : "";
  return `        <article class="post">
          <div class="post-media" role="group" aria-roledescription="carousel" aria-label="${slides} slide${slides === 1 ? "" : "s"}: ${esc(title)}" data-slides="${slides}">
            <div class="slides" tabindex="0">${media}</div>
          </div>
          <div class="post-body">
            <time class="post-date" datetime="${esc(p.date)}">${fmtDate(p.date)}</time>
            <h3>${esc(title)}</h3>
            ${excerpt ? `<p class="post-excerpt">${esc(excerpt)}</p>` : ""}
            <details><summary>Read full caption</summary><p>${esc(text)}</p></details>
            <a class="post-link" href="${esc(p.url)}" rel="noopener">View on Instagram →</a>
          </div>
        </article>`;
}

const SHOW = 9; // latest posts shown on the page; all are kept in data/posts.json
const block = posts.length
  ? `\n        <div class="posts" data-total="${posts.length}">\n${posts.slice(0, SHOW).map(render).join("\n")}\n        </div>\n        `
  : `\n        <p>New posts will appear here.</p>\n        `;

const html = readFileSync(INDEX, "utf8");
const m = html.match(START);
const endAt = html.indexOf(END);
if (!m || endAt < 0 || endAt < m.index) fail("POSTS markers not found in index.html; nothing was changed.");
const out = html.slice(0, m.index + m[0].length) + block + html.slice(endAt);
// Write only after everything above succeeded, so a failure never leaves
// data/posts.json and index.html out of step.
writeFileSync(POSTS, JSON.stringify(posts, null, 2) + "\n");
if (out !== html) writeFileSync(INDEX, out);
for (const s of skipped) console.warn(`build-posts: skipped ${s}`);
console.log(`posts: ${posts.length} total, ${added} new; index.html ${out !== html ? "updated" : "unchanged"}`);
