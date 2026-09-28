/* eslint-disable @next/next/no-img-element -- COA images may be hosted on any HTTPS host */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import AddToCart from "@/components/AddToCart";
import { DocumentIcon, FlaskIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import ProductImage from "@/components/ProductImage";
import PurityBadge from "@/components/PurityBadge";
import { getProduct } from "@/lib/api";
import { formatPrice, formatPurity } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 60;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);
  if (!product) return { title: "Product not found" };
  const purity = formatPurity(product.purity_percentage);
  return {
    title: product.name,
    description: `${product.name}${purity ? ` — ${purity} HPLC purity` : ""}. ${product.description.slice(0, 140)}`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.name, images: product.image_url ? [product.image_url] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const purity = product.purity_percentage;
  const isPdf = product.coa_image_url?.toLowerCase().endsWith(".pdf");
  const lowStock = product.stock_level > 0 && product.stock_level <= 5;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url ? new URL(product.image_url, site.url).toString() : undefined,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price.toFixed(2),
      availability: product.stock_level > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${site.url}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="container pt-8">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
          <Link href="/" className="hover:text-ink-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink-900">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-800">{product.name}</span>
        </nav>
      </div>

      <section className="container grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        {/* Image */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-line bg-gradient-to-br from-mist via-white to-sage-50">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-60" />
            <ProductImage src={product.image_url} alt={product.name} className="relative h-full w-full object-contain p-14" />
            <div className="absolute left-5 top-5">
              <PurityBadge purity={purity} />
            </div>
          </div>
        </div>

        {/* Buy box */}
        <div>
          <p className="eyebrow">{product.category.name}</p>
          <h1 className="mt-3 font-display text-display-lg text-ink-950">{product.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-semibold text-ink-900">{formatPrice(product.price)}</p>
            {product.stock_level > 0 ? (
              <span className="rounded-full bg-sage-50 px-3 py-1 text-sm font-medium text-sage-700">
                {lowStock ? `Only ${product.stock_level} left` : "In stock"}
              </span>
            ) : (
              <span className="rounded-full bg-ink-100 px-3 py-1 text-sm font-medium text-ink-700">Sold out</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-ink-700">{product.description}</p>

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          <ul className="mt-8 grid gap-3 border-t border-line pt-8 text-sm text-ink-700 sm:grid-cols-2">
            {[
              { icon: FlaskIcon, text: purity !== null ? `${formatPurity(purity)} purity by HPLC` : "Purity result pending for this batch" },
              { icon: DocumentIcon, text: product.coa_image_url ? "Certificate of Analysis below" : "COA will be posted when ready" },
              { icon: ShieldIcon, text: "Pay with eSewa, Khalti or COD" },
              { icon: TruckIcon, text: `Delivery inside ${site.deliveryArea} only` },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mist text-ink-700">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lab results */}
      <section id="lab-results" className="container scroll-mt-32 py-10">
        <div className="card overflow-hidden">
          <div className="flex flex-col justify-between gap-4 border-b border-line bg-mist/60 px-6 py-6 sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="eyebrow">Lab results</p>
              <h2 className="mt-2 font-display text-2xl text-ink-900">Certificate of Analysis — current batch</h2>
            </div>
            <Link href="/guides/how-to-read-a-coa" className="text-sm font-medium text-sage-700 hover:text-sage-800">
              How to read a COA →
            </Link>
          </div>

          <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium text-ink-500">HPLC purity</p>
              {purity !== null ? (
                <>
                  <p className="mt-2 font-sans text-6xl font-semibold tabular-nums tracking-tight text-ink-950">
                    {purity.toFixed(2)}
                    <span className="text-3xl text-ink-400">%</span>
                  </p>
                  <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-ink-100" role="meter" aria-valuenow={purity} aria-valuemin={0} aria-valuemax={100} aria-label="HPLC purity">
                    <div className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-600" style={{ width: `${purity}%` }} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-ink-600">
                    The main peak made up {formatPurity(purity)} of all material the detector saw. Match the batch number on
                    the report with the one on your vial.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 font-display text-3xl text-ink-400">Pending</p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-600">
                    This batch hasn’t been published yet. The purity figure and report appear here as soon as the lab
                    returns them.
                  </p>
                </>
              )}
            </div>

            <div>
              {product.coa_image_url ? (
                isPdf ? (
                  <a
                    href={product.coa_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-mist p-8 text-center transition hover:border-sage-400 hover:bg-sage-50"
                  >
                    <DocumentIcon className="h-10 w-10 text-ink-500" />
                    <span className="font-medium text-ink-900">Open the full COA (PDF)</span>
                  </a>
                ) : (
                  <a href={product.coa_image_url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-2xl border border-line bg-white">
                    <img
                      src={product.coa_image_url}
                      alt={`Certificate of Analysis for ${product.name}`}
                      className="max-h-[32rem] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <span className="block border-t border-line px-4 py-3 text-center text-sm font-medium text-ink-700 group-hover:text-ink-950">
                      Open full-size report ↗
                    </span>
                  </a>
                )
              ) : (
                <div className="flex h-full min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-mist/50 p-8 text-center">
                  <DocumentIcon className="h-10 w-10 text-ink-300" />
                  <p className="mt-3 font-medium text-ink-700">Lab report pending</p>
                  <p className="mt-1 max-w-xs text-sm text-ink-500">
                    <Link href="/contact" className="underline underline-offset-4 hover:text-ink-800">Ask us</Link> to be told when it’s posted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
