#!/usr/bin/env node
// Keeps data/posts.json in step with @peptidesnepal on Instagram.
//
//   node scripts/build-posts.mjs metricool.json       merge a saved Metricool getScheduledPosts
//                                                     response into data/posts.json
//
// Only posts Metricool reports as PUBLISHED on Instagram are added. Existing
// posts are never removed and their captions are never changed (a post deleted
// on Instagram must be removed from data/posts.json by hand). Posts already
// known only gain fields they were missing: the first comment (where the
// sources usually are), the image alt text and a reel's cover image. Output is deterministic.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = join(root, "data/posts.json");
const PUBLIC_POSTS = join(root, "public/data/posts.json");

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
let enriched = 0;
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
  const byUrl = new Map(posts.map((p) => [p.url, p]));
  // Alt text is kept only when it lines up one-to-one with the images kept.
  const altsFor = (it, images) => {
    const media = it.media || [];
    const alts = it.mediaAltText || [];
    const out = media.map((m, i) => (httpsOn(m, IMAGE_HOSTS) ? (typeof alts[i] === "string" ? alts[i].trim() : "") : null)).filter((a) => a !== null);
    return out.length === images.length && out.some(Boolean) ? out : undefined;
  };
  for (const it of items) {
    const ig = (it.providers || []).find((p) => p.network === "instagram" && p.status === "PUBLISHED" && p.publicUrl);
    if (!ig) continue;
    if (known.has(ig.publicUrl)) {
      const p = byUrl.get(ig.publicUrl);
      let changed = false;
      if (p && p.firstComment === undefined && typeof it.firstCommentText === "string" && it.firstCommentText.trim()) {
        p.firstComment = it.firstCommentText.trim(); changed = true;
      }
      const alts = p && p.alts === undefined ? altsFor(it, p.images) : undefined;
      if (alts) { p.alts = alts; changed = true; }
      if (p && p.poster === undefined && httpsOn(it.videoThumbnailUrl, IMAGE_HOSTS)) { p.poster = it.videoThumbnailUrl; changed = true; }
      if (changed) enriched++;
      continue;
    }
    const d = it.publicationDate || {};
    if (d.timezone && d.timezone !== "Asia/Kathmandu") {
      fail(`Unexpected timezone ${d.timezone} on post ${it.id}; ask getScheduledPosts for Asia/Kathmandu`);
    }
    const date = `${d.dateTime}+05:45`;
    if (!d.dateTime || Number.isNaN(new Date(date).getTime())) { skipped.push(`${it.id}: bad date ${d.dateTime}`); continue; }
    if (!httpsOn(ig.publicUrl, POST_HOSTS)) { skipped.push(`${it.id}: link not on instagram.com (${ig.publicUrl})`); continue; }
    const images = (it.media || []).filter((m) => httpsOn(m, IMAGE_HOSTS));
    if (images.length !== (it.media || []).length) skipped.push(`${it.id}: dropped ${(it.media || []).length - images.length} image(s) not on static.metricool.com`);
    const post = { id: String(it.id), url: ig.publicUrl, date, caption: it.text || "", images };
    if (typeof it.firstCommentText === "string" && it.firstCommentText.trim()) post.firstComment = it.firstCommentText.trim();
    const alts = altsFor(it, images);
    if (alts) post.alts = alts;
    // Cover image of a reel, so the site has a picture to show for a video.
    if (httpsOn(it.videoThumbnailUrl, IMAGE_HOSTS)) post.poster = it.videoThumbnailUrl;
    posts.push(post);
    known.add(ig.publicUrl);
    added++;
  }
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// ── 2. Write ───────────────────────────────────────────────────────────────
// The site pages that show posts (/posts/ and the Instagram strip) are built
// from data/posts.json by scripts/build-learn.mjs during `npm run build`, so a
// sync only ever changes data/posts.json and its served copy in public/data/.
const out = JSON.stringify(posts, null, 2) + "\n";
const prev = readFileSync(POSTS, "utf8");
if (out !== prev) {
  writeFileSync(POSTS, out);
}
writeFileSync(PUBLIC_POSTS, out);
for (const s of skipped) console.warn(`build-posts: skipped ${s}`);
console.log(`posts: ${posts.length} total, ${added} new, ${enriched} given sources/alt text; data/posts.json ${out !== prev ? "updated" : "unchanged"}`);
