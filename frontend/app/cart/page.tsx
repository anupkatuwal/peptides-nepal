"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductImage from "@/components/ProductImage";
import { useCart } from "@/components/Providers";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { DeliveryOptions } from "@/lib/types";

export default function CartPage() {
  const { lines, subtotal, setQuantity, remove } = useCart();
  const [delivery, setDelivery] = useState<DeliveryOptions | null>(null);

  useEffect(() => {
    apiFetch<DeliveryOptions>("/api/orders/delivery-options").then(setDelivery).catch(() => setDelivery(null));
  }, []);

  // Only one area is offered today (Kathmandu); with several, the customer picks at checkout.
  const single = delivery?.options.length === 1 ? delivery.options[0] : null;
  const free = delivery?.free_delivery_threshold != null && subtotal >= delivery.free_delivery_threshold;
  const shipping = single ? (free ? 0 : single.fee) : null;

  return (
    <section className="container py-12 md:py-16">
      <h1 className="font-display text-display-lg text-ink-950">Your cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-20 text-center">
          <p className="font-display text-2xl text-ink-900">Your cart is empty</p>
          <p className="mt-2 text-ink-600">Browse the shop and check each product’s lab report.</p>
          <Link href="/shop" className="btn-primary mt-6">
            Go to the shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <ul className="card divide-y divide-line">
            {lines.map((l) => (
              <li key={l.productId} className="flex gap-4 p-5 sm:gap-6 sm:p-6">
                <Link href={`/products/${l.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-mist">
                  <ProductImage src={l.imageUrl} alt={l.name} className="h-full w-full object-contain p-2" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/products/${l.slug}`} className="font-display text-lg leading-snug text-ink-900 hover:text-sage-700">
                      {l.name}
                    </Link>
                    <p className="font-semibold text-ink-900">{formatPrice(l.price * l.quantity)}</p>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">{formatPrice(l.price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center rounded-full border border-line">
                      <button type="button" className="h-9 w-9 rounded-l-full text-ink-700 hover:bg-mist" onClick={() => setQuantity(l.productId, l.quantity - 1)} aria-label={`Decrease ${l.name}`}>
                        −
                      </button>
                      <span className="w-8 text-center font-mono text-sm">{l.quantity}</span>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-r-full text-ink-700 hover:bg-mist disabled:opacity-40"
                        onClick={() => setQuantity(l.productId, l.quantity + 1)}
                        disabled={l.quantity >= Math.min(l.maxQuantity, 20)}
                        aria-label={`Increase ${l.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="text-sm text-ink-500 underline-offset-4 hover:text-red-700 hover:underline" onClick={() => remove(l.productId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="card h-fit p-6 lg:sticky lg:top-32">
            <h2 className="font-display text-xl text-ink-900">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">
                  Shipping & handling
                  {single && <span className="block text-xs text-ink-400">Inside {single.label} only</span>}
                </dt>
                <dd className="text-ink-900">{shipping === null ? "At checkout" : shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-between border-t border-line pt-5">
              <span className="font-medium text-ink-900">{shipping === null ? "Subtotal" : "Total"}</span>
              <span className="text-xl font-semibold text-ink-950">{formatPrice(subtotal + (shipping ?? 0))}</span>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              Continue to checkout
            </Link>
            <p className="mt-4 text-center text-xs text-ink-500">Prices and stock are checked again when you place the order.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
