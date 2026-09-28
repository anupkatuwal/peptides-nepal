import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import ProductCard from "@/components/ProductCard";
import ShopControls from "@/components/ShopControls";
import { getCategories, getProducts } from "@/lib/api";
import { cn } from "@/lib/format";

type SearchParams = Promise<{ category?: string; q?: string; sort?: string; page?: string }>;

const PAGE_SIZE = 12;
const SORTS = new Set(["newest", "price_asc", "price_desc", "name"]);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category } = await searchParams;
  const categories = await getCategories();
  const current = categories.find((c) => c.slug === category);
  return {
    title: current ? `${current.name} peptides` : "Shop all peptides",
    description: current?.description ?? "Browse research peptides by category. Purity and lab report on every product.",
  };
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const category = sp.category && /^[a-z0-9-]{1,80}$/.test(sp.category) ? sp.category : undefined;
  const q = sp.q?.slice(0, 80) || undefined;
  const sort = sp.sort && SORTS.has(sp.sort) ? sp.sort : undefined;
  const page = Math.max(1, Math.min(1000, Number.parseInt(sp.page ?? "1", 10) || 1));

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({ category, q, sort, page, pageSize: PAGE_SIZE }),
  ]);
  const current = categories.find((c) => c.slug === category);
  const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  const hrefWith = (changes: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { category, q, sort, ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-mist to-paper">
        <div className="container py-14 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-500">
            <Link href="/" className="hover:text-ink-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink-800">{current ? current.name : "Shop"}</span>
          </nav>
          <h1 className="mt-4 font-display text-display-lg text-ink-950">{current ? current.name : "All peptides"}</h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            {current?.description ?? "Every product lists its HPLC purity and links to the batch’s Certificate of Analysis."}
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Categories">
            <li>
              <Link href={hrefWith({ category: undefined, page: undefined })} className={cn("chip whitespace-nowrap", !category && "chip-active")}>
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={hrefWith({ category: c.slug, page: undefined })}
                  className={cn("chip whitespace-nowrap", category === c.slug && "chip-active")}
                >
                  {c.name}
                  <span className={cn("ml-2 text-xs", category === c.slug ? "text-ink-200" : "text-ink-400")}>{c.product_count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Suspense>
            <ShopControls />
          </Suspense>
        </div>

        {result === null ? (
          <EmptyState title="The shop is temporarily unavailable" text="We couldn’t load products. Please refresh in a moment." />
        ) : result.items.length === 0 ? (
          <EmptyState
            title="No products found"
            text={q ? `Nothing matches “${q}”. Try another name.` : "There are no products in this category yet."}
            action={<Link href="/shop" className="btn-secondary mt-6">Clear filters</Link>}
          />
        ) : (
          <>
            <p className="mt-8 text-sm text-ink-500">
              {result.total} {result.total === 1 ? "product" : "products"}
              {q && <> for “{q}”</>}
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={hrefWith({ page: n === 1 ? undefined : String(n) })}
                    aria-current={n === page ? "page" : undefined}
                    className={cn("chip min-w-10 justify-center", n === page && "chip-active")}
                  >
                    {n}
                  </Link>
                ))}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
      <h2 className="font-display text-2xl text-ink-900">{title}</h2>
      <p className="mt-2 max-w-md text-ink-600">{text}</p>
      {action}
    </div>
  );
}
