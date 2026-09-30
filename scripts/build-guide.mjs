#!/usr/bin/env node
// Writes data/guide.json from the peptide guide cards and the Myth-or-fact
// cards in index.html, so the mobile app shows exactly what the site shows.
//
//   node scripts/build-guide.mjs
//
// index.html stays the one place to edit the guide. Run this after changing a
// card (the daily post sync runs it too). The app reads
// https://<site>/data/guide.json and /data/posts.json.
//
// Output is deterministic: running it twice leaves data/guide.json unchanged.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = join(root, "index.html");
const OUT = join(root, "data/guide.json");
const fail = (msg) => { console.error(`build-guide: ${msg}`); process.exit(1); };

const html = readFileSync(INDEX, "utf8");

const decode = (s) => s
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ").trim();
const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/\([^)]*\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const all = (re, s) => [...s.matchAll(re)];

// ── Peptide cards ─────────────────────────────────────────────────────────
const cardBlocks = all(/<article class="card" data-status="([a-z-]+)">([\s\S]*?)<\/article>/g, html);
if (!cardBlocks.length) fail("no guide cards found in index.html; nothing was changed.");

const STATUS = {
  approved: "Approved",
  trials: "In trials",
  "not-approved": "Not approved",
};

const peptides = cardBlocks.map(([, status, body]) => {
  if (!STATUS[status]) fail(`unknown data-status "${status}"`);
  const name = decode(body.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? "");
  if (!name) fail("a guide card has no <h3> name");
  const aka = decode(body.match(/<p class="sub">([\s\S]*?)<\/p>/)?.[1] ?? "");
  const badge = decode(body.match(/<span class="badge[^"]*">([\s\S]*?)<\/span>/)?.[1] ?? STATUS[status]);
  const facts = all(/<div><dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd><\/div>/g, body)
    .map(([, label, text]) => ({ label: decode(label), text: decode(text) }));
  const sources = all(/<li><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/li>/g, body)
    .map(([, url, title]) => ({ title: decode(title), url: decode(url) }))
    .filter((s) => s.url.startsWith("https://"));
  if (!sources.length) fail(`"${name}" has no sources; every card must list at least one.`);
  return { id: slugify(name), name, aka, status, statusLabel: badge, facts, sources };
});

const ids = new Set();
for (const p of peptides) {
  if (ids.has(p.id)) fail(`two cards share the id "${p.id}"`);
  ids.add(p.id);
}

// ── Myth or fact ──────────────────────────────────────────────────────────
const quiz = all(/<article class="q" data-answer="(myth|fact)">([\s\S]*?)<\/article>/g, html)
  .map(([, answer, body], i) => {
    const statement = decode(body.match(/<p class="q-text">([\s\S]*?)<\/p>/)?.[1] ?? "").replace(/^["“]|["”]$/g, "");
    const explanation = decode(body.match(/<details>[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1] ?? "")
      .replace(/^(Myth|Fact)\.\s*/, "");
    if (!statement || !explanation) fail(`quiz card ${i + 1} is missing its text or answer`);
    return { id: `q${i + 1}`, statement, answer, explanation };
  });

// ── Legend + notice (short copy the app reuses) ──────────────────────────
const legend = all(/<li><span class="badge badge-(approved|trials|no)">[\s\S]*?<\/span><span>([\s\S]*?)<\/span><\/li>/g, html)
  .map(([, key, text]) => ({ status: key === "no" ? "not-approved" : key, text: decode(text) }));
const reviewed = decode(html.match(/Last reviewed:\s*([^·<]+)/)?.[1] ?? "");

const out = JSON.stringify({ lastReviewed: reviewed, legend, peptides, quiz }, null, 2) + "\n";
let prev = "";
try { prev = readFileSync(OUT, "utf8"); } catch {}
if (prev !== out) writeFileSync(OUT, out);
console.log(`guide: ${peptides.length} peptides, ${quiz.length} quiz cards; data/guide.json ${prev !== out ? "updated" : "unchanged"}`);
