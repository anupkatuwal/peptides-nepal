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
- `ac2bc0a7d86395eca9eff18b691bd343.txt` — IndexNow key. It proves to Bing (and other IndexNow engines) that pings for this site come from us. After a change, ping: `https://api.indexnow.org/indexnow?url=https://peptides.anup-katuwal.com.np/&key=ac2bc0a7d86395eca9eff18b691bd343`. Don't delete or rename it.
- `googlebe5c6877a9634ad2.html` — Google Search Console ownership proof. Google needs `/googlebe5c6877a9634ad2.html` to answer 200 with no redirect, which is why `cleanUrls` is off in `vercel.json` (it redirected every `.html` URL). Don't delete it, or Search Console access is lost.
- `vercel.json` — security headers (CSP, HSTS, X-Frame-Options, COOP, …), font caching, and image optimization settings.

The quiz answers use only facts already on the page or in a post. Add a new card by copying a `.q` block in `index.html` and setting `data-answer` to `myth` or `fact`.

## Images

Post images live on Metricool's CDN (`static.metricool.com`). The page loads them through Vercel Image Optimization (`/_vercel/image`, configured under `images` in `vercel.json`), which fetches each original once and serves a cached AVIF/WebP at the width the device needs.

If that fails (for example the Hobby plan's 5,000 transformations a month are used up), `app.js` switches the image to the Metricool original. If the original is gone too, the slide shows "Image unavailable. Open on Instagram →" instead of a broken image.

## Education pages (for search engines)

`npm run build` runs `vite build`, then `scripts/build-learn.mjs`, which writes plain pre-rendered HTML pages into `dist/` so Google, Bing and AI search tools can read them without running JavaScript:

- `/guides/` and `/guides/<peptide>/` from `src/data/education.json` (the same guide cards the app shows)
- `/posts/` and `/posts/<title>/` from `data/posts.json` (full caption, every slide, the sources from the first comment)
- `/myth-or-fact/` from the Myth-or-fact cards in `src/data/education.json`
- `/sitemap.xml` and `/llms.txt`

Each page has its own title, description, canonical link, Open Graph tags and JSON-LD (Article / CollectionPage, BreadcrumbList). `vercel.json` routes those paths to the static files; everything else goes to the app. Edit the data files, never the generated pages.

## Updating the Instagram posts

1. Save a Metricool `getScheduledPosts` response (brand 7048982, timezone Asia/Kathmandu) to a file.
2. `node scripts/build-posts.mjs that-file.json` adds new PUBLISHED Instagram posts to `data/posts.json` (and its served copy `public/data/posts.json`) and skips ones already there. Known posts only gain missing sources, alt text or a reel cover; captions are never changed.
3. Commit and push; Vercel rebuilds the `/posts/` pages and the sitemap.

## Domain

The site lives at **https://peptides.anup-katuwal.com.np** (a subdomain of anup-katuwal.com.np, whose DNS is on Vercel). `vercel.json` permanently redirects the old `peptides-nepal.vercel.app` address there; preview deployments are unaffected.

To move to another domain later, replace `https://peptides.anup-katuwal.com.np` in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD), `privacy.html`, `support.html`, `robots.txt`, `sitemap.xml`, the redirect in `vercel.json`, and `SITE_URL` in the app's `src/lib/config.ts`.

## The mobile app

The Peptides Nepal app (separate repo, `peptides-nepal-app`) reads two files from this site: `/data/posts.json` and `/data/guide.json`. So a post synced here, or a guide card edited in `index.html` (then `node scripts/build-guide.mjs`), shows up in the app without an app update. `vercel.json` lets any origin read `/data/*` (needed by the app's web version) and caches it for 5 minutes. The app links to `/privacy.html` and `/support.html` (with `.html`, because `cleanUrls` is off).

Keep the ids stable: the app uses each peptide's id (made from its name, e.g. `bpc-157`) for saved items and links. Renaming a card's `<h3>` changes its id.
