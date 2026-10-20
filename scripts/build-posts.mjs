#!/usr/bin/env node
// Keeps data/posts.json in step with @peptidesnepal on Instagram.
//
//   node scripts/build-posts.mjs instagram.json       merge a saved Instagram Graph API /media
//                                                     reply (see mergeInstagram) into data/posts.json
//   node scripts/build-posts.mjs metricool.json       merge a saved Metricool getScheduledPosts
//                                                     response into data/posts.json
//
// Only posts Metricool reports as PUBLISHED on Instagram are added. Existing
// posts are never removed and their captions are never changed (a post deleted
// on Instagram must be removed from data/posts.json by hand). Posts already
// known only gain fields they were missing: the first comment (where the
// sources usually are), the image alt text and a reel's cover image. Output is deterministic.
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
const SITE = "https://peptides.anup-katuwal.com.np";
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
  if (!items) fail(`Reply has no "data" list (got: ${JSON.stringify(raw).slice(0, 200)}). Nothing was changed.`);
  const known = new Set(posts.map((p) => p.url));
  const byUrl = new Map(posts.map((p) => [p.url, p]));
  // An Instagram Graph API /media reply (items carry "permalink") is handled
  // by mergeInstagram below; anything else is treated as Metricool.
  if (items.some((it) => it && typeof it.permalink === "string")) {
    ({ added, enriched } = mergeInstagram(items, known, byUrl, skipped));
  } else {
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
}

// ── Instagram Graph API mode ────────────────────────────────────────────────
// Input: the JSON body of GET /<ig-user-id>/media with fields
//   id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,alt_text,
//   children{media_url,media_type,alt_text},comments{username,text,timestamp}
// Instagram's own image links expire after a few weeks, so the files of each
// NEW post are downloaded into public/media/<shortcode>/ and served from this
// site. Existing posts are never re-downloaded or re-captioned.
function mergeInstagram(items, known, byUrl, skipped) {
  let added = 0, enriched = 0;
  const OWNER = "peptidesnepal";
  const firstComment = (it) => {
    const own = (it.comments?.data || []).filter((c) => c.username === OWNER && typeof c.text === "string" && c.text.trim());
    own.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return own[0]?.text.trim();
  };
  const parts = (it) => (it.media_type === "CAROUSEL_ALBUM" ? it.children?.data || [] : [it]);
  const ktm = (ts) => {
    const t = new Date(String(ts).replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
    if (Number.isNaN(t.getTime())) return null;
    return new Date(t.getTime() + 345 * 60000).toISOString().slice(0, 19) + "+05:45";
  };
  const download = (src, dest, kind) => {
    if (!httpsOn(src, ["cdninstagram.com", "fbcdn.net"])) throw new Error(`not an Instagram CDN link: ${String(src).slice(0, 80)}`);
    mkdirSync(dirname(dest), { recursive: true });
    const type = execFileSync("curl", ["-sSfL", "--max-time", "120", "--max-filesize", "80000000", "-o", dest, "-w", "%{content_type}", src], { encoding: "utf8" });
    if (!type.startsWith(kind) || statSync(dest).size < 1000) throw new Error(`unexpected download (${type}, ${statSync(dest).size} bytes)`);
  };
  for (const it of items) {
    const url = it.permalink;
    if (!httpsOn(url, POST_HOSTS)) { skipped.push(`${it.id}: link not on instagram.com (${url})`); continue; }
    const kids = parts(it);
    if (known.has(url)) {
      const p = byUrl.get(url);
      let changed = false;
      const fc = firstComment(it);
      if (p && p.firstComment === undefined && fc) { p.firstComment = fc; changed = true; }
      const alts = kids.map((k) => (typeof k.alt_text === "string" ? k.alt_text.trim() : ""));
      if (p && p.alts === undefined && alts.length === p.images.length && alts.some(Boolean)) { p.alts = alts; changed = true; }
      if (changed) enriched++;
      continue;
    }
    const date = ktm(it.timestamp);
    if (!date) { skipped.push(`${it.id}: bad date ${it.timestamp}`); continue; }
    const code = (url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/) || [])[1];
    if (!code) { skipped.push(`${it.id}: no shortcode in ${url}`); continue; }
    const dir = join(root, "public/media", code);
    const site = `${SITE}/media/${code}`;
    const images = [];
    const alts = [];
    let poster;
    try {
      kids.forEach((k, i) => {
        const video = k.media_type === "VIDEO";
        const name = `${i + 1}.${video ? "mp4" : "jpg"}`;
        download(k.media_url, join(dir, name), video ? "video/" : "image/");
        images.push(`${site}/${name}`);
        alts.push(typeof k.alt_text === "string" ? k.alt_text.trim() : "");
      });
      if (it.media_type === "VIDEO" && it.thumbnail_url) {
        download(it.thumbnail_url, join(dir, "poster.jpg"), "image/");
        poster = `${site}/poster.jpg`;
      }
    } catch (e) {
      rmSync(dir, { recursive: true, force: true });
      skipped.push(`${it.id}: could not download media (${e.message.split("\n")[0]})`);
      continue;
    }
    if (!images.length) { skipped.push(`${it.id}: no media`); continue; }
    const post = { id: String(it.id), url, date, caption: it.caption || "", images };
    const fc = firstComment(it);
    if (fc) post.firstComment = fc;
    if (alts.some(Boolean)) post.alts = alts;
    if (poster) post.poster = poster;
    posts.push(post);
    known.add(url);
    byUrl.set(url, post);
    added++;
  }
  return { added, enriched };
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
