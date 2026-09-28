import Link from "next/link";

import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

import ProductImage from "./ProductImage";
import PurityBadge from "./PurityBadge";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const soldOut = product.stock_level <= 0;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-ring transition-all duration-300 hover:-translate-y-1 hover:border-ink-100 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3.4] overflow-hidden bg-gradient-to-b from-mist to-white">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3">
          <PurityBadge purity={product.purity_percentage} />
        </div>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-ink-900 px-2.5 py-1 text-[0.7rem] font-medium text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-line p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-sage-600">{product.category.name}</p>
        <h3 className="font-display text-lg leading-snug text-ink-900">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-lg font-semibold text-ink-900">{formatPrice(product.price)}</p>
          <span className="text-sm font-medium text-ink-500 transition-colors group-hover:text-sage-700">
            View details <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
