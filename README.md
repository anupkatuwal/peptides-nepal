# Peptides Nepal — website

Static site for [@peptidesnepal](https://instagram.com/peptidesnepal). No build step: Vercel serves the files as they are.

- `index.html` — the page. The peptide guide cards are written by hand.
- `styles.css` — Matcha theme (colours, spacing, radii from the Astryx Matcha theme), light and dark.
- `app.js` — the live parts: guide filter + search, swipeable post slides with arrows and a "2 / 7" counter, "New" tags and "3 days ago" dates, the "New on Instagram" strip in the hero, counting-up numbers, the Myth or fact quiz (4 random cards at a time), fade-in on scroll, and the jump buttons. Everything it touches is already in the HTML, so the page still works with JavaScript off, and motion is skipped for visitors who ask for reduced motion.
- `data/posts.json` — every Instagram post the site knows about (from Metricool).
- `scripts/build-posts.mjs` — writes the newest 9 posts (every slide of each) into `index.html` between the `POSTS:START` / `POSTS:END` markers, plus the total post count (`data-total`). The hero strip and the post counter read from that block, so a sync only ever changes the block and `data/posts.json`.

The quiz answers use only facts already on the page or in a post. Add a new card by copying a `.q` block in `index.html` and setting `data-answer` to `myth` or `fact`.

## Updating the Instagram posts

1. Save a Metricool `getScheduledPosts` response (brand 7048982, timezone Asia/Kathmandu) to a file.
2. `node scripts/build-posts.mjs that-file.json` — adds new PUBLISHED Instagram posts, skips ones already there, rebuilds the section.
3. Commit and push; Vercel redeploys.

Posts made directly in the Instagram app (not through Metricool) don't appear in Metricool, so they won't be picked up.
