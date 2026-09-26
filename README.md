# Peptides Nepal — website

Static site for [@peptidesnepal](https://instagram.com/peptidesnepal). No build step: Vercel serves the files as they are.

- `index.html` — the page. The peptide guide cards are written by hand.
- `styles.css` — Matcha theme (colours, spacing, radii from the Astryx Matcha theme), light and dark.
- `app.js` — status filter for the guide cards.
- `data/posts.json` — every Instagram post the site knows about (from Metricool).
- `scripts/build-posts.mjs` — writes the newest 9 posts into `index.html` between the `POSTS:START` / `POSTS:END` markers.

## Updating the Instagram posts

1. Save a Metricool `getScheduledPosts` response (brand 7048982, timezone Asia/Kathmandu) to a file.
2. `node scripts/build-posts.mjs that-file.json` — adds new PUBLISHED Instagram posts, skips ones already there, rebuilds the section.
3. Commit and push; Vercel redeploys.

Posts made directly in the Instagram app (not through Metricool) don't appear in Metricool, so they won't be picked up.
