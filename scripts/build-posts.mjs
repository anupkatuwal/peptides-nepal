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

// ── 1. Optional merge of a Metricool response ──────────────────────────────
const input = process.argv[2];
let added = 0;
if (input) {
  const raw = JSON.parse(readFileSync(input, "utf8"));
  const items = Array.isArray(raw) ? raw : raw.data || [];
  const known = new Set(posts.map((p) => p.url));
  for (const it of items) {
    const ig = (it.providers || []).find((p) => p.network === "instagram" && p.status === "PUBLISHED" && p.publicUrl);
    if (!ig || known.has(ig.publicUrl)) continue;
    const d = it.publicationDate || {};
    if (d.timezone && d.timezone !== "Asia/Kathmandu") {
      throw new Error(`Unexpected timezone ${d.timezone} on post ${it.id}; ask getScheduledPosts for Asia/Kathmandu`);
    }
    posts.push({
      id: String(it.id),
      url: ig.publicUrl,
      date: `${d.dateTime}+05:45`,
      caption: it.text || "",
      images: it.media || [],
    });
    known.add(ig.publicUrl);
    added++;
  }
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));
writeFileSync(POSTS, JSON.stringify(posts, null, 2) + "\n");

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
  const img = p.images[0];
  const slides = p.images.length;
  return `        <article class="post">
          <a class="post-media" href="${esc(p.url)}" rel="noopener" aria-label="Open this post on Instagram (${slides} slide${slides === 1 ? "" : "s"})">${img ? `<img src="${esc(img)}" alt="First slide of the post: ${esc(title)}" loading="lazy" width="1080" height="1350" />` : ""}</a>
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
  ? `\n        <div class="posts">\n${posts.slice(0, SHOW).map(render).join("\n")}\n        </div>\n        `
  : `\n        <p>New posts will appear here.</p>\n        `;

const html = readFileSync(INDEX, "utf8");
const m = html.match(START);
const endAt = html.indexOf(END);
if (!m || endAt < 0 || endAt < m.index) throw new Error("POSTS markers not found in index.html");
const out = html.slice(0, m.index + m[0].length) + block + html.slice(endAt);
if (out !== html) writeFileSync(INDEX, out);
console.log(`posts: ${posts.length} total, ${added} new; index.html ${out !== html ? "updated" : "unchanged"}`);
