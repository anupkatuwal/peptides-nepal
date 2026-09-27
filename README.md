# Peptides Nepal — website

Static site for [@peptidesnepal](https://instagram.com/peptidesnepal). No build step: Vercel serves the files as they are.

- `index.html` — the page. The peptide guide cards are written by hand. The `<head>` holds the SEO tags (title, description, canonical, Open Graph / Twitter card) and JSON-LD (Organization, WebSite, WebPage).
- `styles.css` — Matcha theme (colours, spacing, radii from the Astryx Matcha theme), light and dark.
- `app.js` — the live parts: guide filter + search, swipeable post slides with arrows and a "2 / 7" counter, "New" tags and "3 days ago" dates, the "New on Instagram" strip in the hero, counting-up numbers, the Myth or fact quiz (4 random cards at a time), fade-in on scroll, the jump buttons, the image fallback and the email link. Everything it touches is already in the HTML, so the page still works with JavaScript off, and motion is skipped for visitors who ask for reduced motion.
- `data/posts.json` — every Instagram post the site knows about (from Metricool).
- `scripts/build-posts.mjs` — writes the newest 9 posts (every slide of each) into `index.html` between the `POSTS:START` / `POSTS:END` markers, plus the total post count (`data-total`). The hero strip and the post counter read from that block, so a sync only ever changes the block and `data/posts.json`.
- `404.html` — shown by Vercel for any missing URL.
- `robots.txt`, `sitemap.xml`, `og-image.png` (1200×630 share image) — for search engines and link previews.
- `ac2bc0a7d86395eca9eff18b691bd343.txt` — IndexNow key. It proves to Bing (and other IndexNow engines) that pings for this site come from us. After a change, ping: `https://api.indexnow.org/indexnow?url=https://peptides.anup-katuwal.com.np/&key=ac2bc0a7d86395eca9eff18b691bd343`. Don't delete or rename it.
- `googlebe5c6877a9634ad2.txt` — Google Search Console ownership proof, served at `/googlebe5c6877a9634ad2.html` by a rewrite in `vercel.json` (a real `.html` file would be redirected by `cleanUrls`, and Google needs that exact URL to answer 200). Don't delete it, or Search Console access is lost.
- `vercel.json` — security headers (CSP, HSTS, X-Frame-Options, COOP, …), font caching, and image optimization settings.

The quiz answers use only facts already on the page or in a post. Add a new card by copying a `.q` block in `index.html` and setting `data-answer` to `myth` or `fact`.

## Images

Post images live on Metricool's CDN (`static.metricool.com`). The page loads them through Vercel Image Optimization (`/_vercel/image`, configured under `images` in `vercel.json`), which fetches each original once and serves a cached AVIF/WebP at the width the device needs.

If that fails (for example the Hobby plan's 5,000 transformations a month are used up), `app.js` switches the image to the Metricool original. If the original is gone too, the slide shows "Image unavailable. Open on Instagram →" instead of a broken image.

## Updating the Instagram posts

1. Save a Metricool `getScheduledPosts` response (brand 7048982, timezone Asia/Kathmandu) to a file.
2. `node scripts/build-posts.mjs that-file.json` — adds new PUBLISHED Instagram posts, skips ones already there, rebuilds the section.
3. Commit and push; Vercel redeploys.

The script refuses to change anything, and exits with code 1 and a message, when the file isn't valid JSON or has no `data` list (an error or rate-limit reply from Metricool). A post whose link isn't on instagram.com, or whose date is missing, is skipped with a warning, and images not on static.metricool.com are dropped.

Posts made directly in the Instagram app (not through Metricool) don't appear in Metricool, so they won't be picked up.

## Domain

The site lives at **https://peptides.anup-katuwal.com.np** (a subdomain of anup-katuwal.com.np, whose DNS is on Vercel). `vercel.json` permanently redirects the old `peptides-nepal.vercel.app` address there; preview deployments are unaffected.

To move to another domain later, replace `https://peptides.anup-katuwal.com.np` in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt`, `sitemap.xml` and the redirect in `vercel.json`.
