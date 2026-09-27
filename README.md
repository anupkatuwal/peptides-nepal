# Peptides Nepal — website

Static site for [@peptidesnepal](https://instagram.com/peptidesnepal). No build step: Vercel serves the files as they are.

- `index.html` — the page. The peptide guide cards are written by hand. The `<head>` holds the SEO tags (title, description, canonical, Open Graph / Twitter card) and JSON-LD (Organization, WebSite, WebPage).
- `styles.css` — Matcha theme (colours, spacing, radii from the Astryx Matcha theme), light and dark.
- `app.js` — the live parts: guide filter + search, swipeable post slides with arrows and a "2 / 7" counter, "New" tags and "3 days ago" dates, the "New on Instagram" strip in the hero, counting-up numbers, the Myth or fact quiz (4 random cards at a time), fade-in on scroll, the jump buttons, the image fallback and the email link. Everything it touches is already in the HTML, so the page still works with JavaScript off, and motion is skipped for visitors who ask for reduced motion.
- `data/posts.json` — every Instagram post the site knows about (from Metricool).
- `data/guide.json` — the guide cards and Myth-or-fact cards as data, for the mobile app. Made from `index.html` by `scripts/build-guide.mjs`; don't edit it by hand.
- `privacy.html`, `support.html` — privacy policy and support page (the App Store and Google Play need both links).
- `scripts/build-posts.mjs` — writes the newest 9 posts (every slide of each) into `index.html` between the `POSTS:START` / `POSTS:END` markers, plus the total post count (`data-total`). The hero strip and the post counter read from that block, so a sync only ever changes the block and `data/posts.json`.
- `404.html` — shown by Vercel for any missing URL.
- `robots.txt`, `sitemap.xml`, `og-image.png` (1200×630 share image) — for search engines and link previews.
- `vercel.json` — security headers (CSP, HSTS, X-Frame-Options, COOP, …), font caching, and image optimization settings.

The quiz answers use only facts already on the page or in a post. Add a new card by copying a `.q` block in `index.html` and setting `data-answer` to `myth` or `fact`.

## Images

Post images live on Metricool's CDN (`static.metricool.com`). The page loads them through Vercel Image Optimization (`/_vercel/image`, configured under `images` in `vercel.json`), which fetches each original once and serves a cached AVIF/WebP at the width the device needs.

If that fails (for example the Hobby plan's 5,000 transformations a month are used up), `app.js` switches the image to the Metricool original. If the original is gone too, the slide shows "Image unavailable. Open on Instagram →" instead of a broken image.

## Updating the Instagram posts

1. Save a Metricool `getScheduledPosts` response (brand 7048982, timezone Asia/Kathmandu) to a file.
2. `node scripts/build-posts.mjs that-file.json` — adds new PUBLISHED Instagram posts, skips ones already there, rebuilds the section.
3. `node scripts/build-guide.mjs` — refreshes `data/guide.json` if a guide or quiz card changed.
4. Commit and push; Vercel redeploys.

The script refuses to change anything, and exits with code 1 and a message, when the file isn't valid JSON or has no `data` list (an error or rate-limit reply from Metricool). A post whose link isn't on instagram.com, or whose date is missing, is skipped with a warning, and images not on static.metricool.com are dropped.

Posts made directly in the Instagram app (not through Metricool) don't appear in Metricool, so they won't be picked up.

## If the site moves to its own domain

Replace `https://peptides-nepal.vercel.app` in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `robots.txt` and `sitemap.xml`.

## The mobile app

The Peptides Nepal app (separate repo, `peptides-nepal-app`) reads two files from this site: `/data/posts.json` and `/data/guide.json`. So a post synced here, or a guide card edited in `index.html` (then `node scripts/build-guide.mjs`), shows up in the app without an app update. `vercel.json` lets any origin read `/data/*` (needed by the app's web version) and caches it for 5 minutes.

Keep the ids stable: the app uses each peptide's id (made from its name, e.g. `bpc-157`) for saved items and links. Renaming a card's `<h3>` changes its id.
