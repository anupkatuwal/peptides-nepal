import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Global basic security headers compatible with AI Studio iframe
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Cache & CORS headers matching vercel.json
app.use('/data', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
  next();
});

app.use('/fonts', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// Vercel image optimization proxy/redirect for local dev & preview
app.get('/_vercel/image', (req, res) => {
  // Only forward to the image CDN the site uses, never to any address in the query
  // (an open redirect would let phishing links borrow this site's name).
  let target;
  try {
    target = new URL(String(req.query.url || ''));
  } catch {
    return res.status(400).send('Missing or invalid url parameter');
  }
  if (target.protocol !== 'https:' || target.hostname !== 'static.metricool.com') {
    return res.status(400).send('Image host not allowed');
  }
  res.redirect(302, target.toString());
});

// Serve static directory with .html extension support (e.g. /privacy -> privacy.html)
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html',
}));

// Fallback 404 page
app.use((req, res) => {
  res.status(404).sendFile(join(__dirname, '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
