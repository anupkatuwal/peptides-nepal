// Writes one crawlable page per product at /products/<slug>/, after
// `vite build` and build-learn.mjs have run.
//
// Each page is the app's own dist/index.html with the product's title,
// description, canonical link, Open Graph tags and Product JSON-LD, plus the
// product details as plain HTML inside #root. Search engines read that HTML;
// in a browser the app starts, replaces #root and opens the same product.
// The product URLs are also added to /sitemap.xml and /llms.txt.
//
// The catalogue comes from src/data/initialData.ts (loaded through Vite, so
// the TypeScript and image imports resolve the same way as in the app).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, process.argv[2] || "dist");
const SITE = "https://peptides.anup-katuwal.com.np";
const NPR_PER_INR = 1.6;

if (!existsSync(join(out, "index.html"))) {
  console.error(`build-products: ${out}/index.html does not exist. Run vite build first.`);
  process.exit(1);
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const clip = (s, n) => {
  s = String(s).replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "") + "…";
};
const npr = (p) => p.priceNpr || Math.round(p.priceInr * NPR_PER_INR);

const vite = await createServer({ root, logLevel: "silent", server: { middlewareMode: true }, appType: "custom" });
let products;
try {
  const { INITIAL_PRODUCTS } = await vite.ssrLoadModule("/src/data/initialData.ts");
  const { withProductPhoto } = await vite.ssrLoadModule("/src/assets/productImages.ts");
  const { applyCatalogueFixes } = await vite.ssrLoadModule("/src/data/catalogueFixes.ts");
  products = applyCatalogueFixes(INITIAL_PRODUCTS).map(withProductPhoto);
} finally {
  await vite.close();
}

// Only real product photos (served from /assets/products/) are used as the
// share image; products without one use the site's share image.
const imageFor = (p) => (p.image && p.image.startsWith("/assets/products/") ? `${SITE}${p.image}` : `${SITE}/og-image.png`);

const template = readFileSync(join(out, "index.html"), "utf8");

const setHead = (html, { title, description, url, image }) => html
  .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
  .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(description)}" />`)
  .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`)
  .replace(/<meta property="og:type" content="[^"]*"\s*\/?>/, `<meta property="og:type" content="product" />`)
  .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`)
  .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${esc(title)}" />`)
  .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${esc(description)}" />`)
  .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${image}" />`)
  .replace(/\s*<meta property="og:image:(width|height)" content="[^"]*"\s*\/?>/g, "")
  .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/?>/, `<meta property="og:image:alt" content="${esc(title)}" />`)
  .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${esc(title)}" />`)
  .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${esc(description)}" />`)
  .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${image}" />`)
  // The home page's JSON-LD describes the home page; swap in the product's.
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, "");

const urls = [];
for (const p of products) {
  const path = `/products/${p.slug}/`;
  const url = `${SITE}${path}`;
  const image = imageFor(p);
  const price = npr(p);
  const title = `${p.name} in Nepal: रू ${price.toLocaleString("en-IN")} | Peptides Nepal`;
  const description = clip(`${p.name}${p.brand ? ` by ${p.brand}` : ""}. ${p.shortDesc} ${p.purityPercent}% HPLC purity, batch ${p.batchNumber}. Delivery across Nepal in 10–14 days.`, 160);

  const jsonLd = ld({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: p.name,
        description: clip(p.description || p.shortDesc, 500),
        image,
        sku: p.id,
        ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
        category: p.categoryLabel,
        offers: {
          "@type": "Offer",
          url,
          price: String(price),
          priceCurrency: "NPR",
          availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@id": `${SITE}/#org` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Peptides Nepal", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE}/#shop` },
          { "@type": "ListItem", position: 3, name: p.name, item: url },
        ],
      },
    ],
  });

  const body = `<div id="root">
    <main style="max-width:720px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;color:#10241E">
      <p><a href="/">Peptides Nepal</a> › <a href="/#shop">Shop</a> › ${esc(p.categoryLabel)}</p>
      <h1>${esc(p.name)}</h1>
      ${image.endsWith("/og-image.png") ? "" : `<img src="${esc(p.image)}" alt="${esc(p.name)}" width="480" style="max-width:100%;height:auto" />`}
      <p><strong>रू ${price.toLocaleString("en-IN")}</strong> (₹${p.priceInr.toLocaleString("en-IN")} INR) · ${p.inStock ? "In stock" : "Out of stock"}</p>
      ${p.brand ? `<p>Brand: ${esc(p.brand)}</p>` : ""}
      <p>HPLC purity: ${esc(p.purityPercent)}% · Batch: ${esc(p.batchNumber)}</p>
      <p>${esc(p.shortDesc)}</p>
      ${p.description ? `<p>${esc(p.description)}</p>` : ""}
      ${p.highlights?.length ? `<ul>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
      <p>Delivery across Nepal in 10–14 days. Payment by eSewa, Khalti or bank transfer before dispatch.</p>
      <p><a href="/#product/${esc(p.slug)}">View and order</a></p>
    </main>
  </div>`;

  const html = setHead(template, { title, description, url, image })
    .replace("</head>", `  ${jsonLd}\n</head>`)
    .replace(/<div id="root"><\/div>/, body);

  const dir = join(out, "products", p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
  urls.push(path);
}

// Add the product pages to the sitemap and llms.txt written by build-learn.mjs.
const sitemapPath = join(out, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const entries = urls.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join("\n");
  writeFileSync(sitemapPath, readFileSync(sitemapPath, "utf8").replace("</urlset>", `${entries}\n</urlset>`));
}
const llmsPath = join(out, "llms.txt");
if (existsSync(llmsPath)) {
  const list = products.map((p) => `- [${p.name}](${SITE}/products/${p.slug}/): रू ${npr(p).toLocaleString("en-IN")}, ${p.categoryLabel}`).join("\n");
  writeFileSync(llmsPath, `${readFileSync(llmsPath, "utf8").trimEnd()}\n\n## Products\n\n${list}\n`);
}

console.log(`products: ${urls.length} product pages, added to sitemap and llms.txt → ${out}`);
