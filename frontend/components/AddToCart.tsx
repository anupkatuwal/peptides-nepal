"use client";

import Link from "next/link";
import { useState } from "react";

import type { ProductDetail } from "@/lib/types";

import { CheckIcon } from "./icons";
import { useCart } from "./Providers";

export default function AddToCart({ product }: { product: ProductDetail }) {
  const { add, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const max = Math.max(0, Math.min(product.stock_level, 20) - inCart);
  const soldOut = product.stock_level <= 0;

  if (soldOut) {
    return (
      <div className="rounded-2xl border border-line bg-mist px-5 py-4 text-sm text-ink-700">
        Sold out for now. <Link href="/contact" className="font-medium text-ink-900 underline underline-offset-4">Ask us</Link> when the next batch arrives.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="inline-flex h-[3.25rem] items-center rounded-full border border-line bg-white">
        <button
          type="button"
          className="grid h-full w-12 place-items-center rounded-l-full text-lg text-ink-700 hover:bg-mist disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center font-mono text-ink-900" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          className="grid h-full w-12 place-items-center rounded-r-full text-lg text-ink-700 hover:bg-mist disabled:opacity-40"
          onClick={() => setQty((q) => Math.min(max, q + 1))}
          disabled={qty >= max}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={max === 0}
        onClick={() => {
          add(
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              imageUrl: product.image_url,
              maxQuantity: product.stock_level,
            },
            qty,
          );
          setQty(1);
          setAdded(true);
          setTimeout(() => setAdded(false), 2200);
        }}
        className="btn-primary h-[3.25rem] flex-1"
      >
        {added ? (
          <>
            <CheckIcon className="h-5 w-5" /> Added to cart
          </>
        ) : max === 0 ? (
          "Maximum in cart"
        ) : (
          "Add to cart"
        )}
      </button>
      {inCart > 0 && (
        <Link href="/cart" className="btn-secondary h-[3.25rem]">
          View cart ({inCart})
        </Link>
      )}
    </div>
  );
}
