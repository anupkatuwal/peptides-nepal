"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth, useCart } from "@/components/Providers";
import { ApiError, apiFetch } from "@/lib/api";
import { cn, formatPrice } from "@/lib/format";
import type { DeliveryOptions, DeliveryZone, Order, PaymentMethod } from "@/lib/types";

const METHODS: { value: PaymentMethod; label: string; note: string }[] = [
  { value: "COD", label: "Cash on delivery", note: "Pay in cash when the parcel arrives." },
  { value: "eSewa", label: "eSewa", note: "We send payment details after confirming your order." },
  { value: "Khalti", label: "Khalti", note: "We send payment details after confirming your order." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const { lines, subtotal, clear } = useCart();

  const [form, setForm] = useState({ shipping_name: "", phone: "", shipping_address: "", city: "", notes: "" });
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [zone, setZone] = useState<DeliveryZone>("inside_valley");
  const [delivery, setDelivery] = useState<DeliveryOptions | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/checkout");
  }, [ready, user, router]);

  useEffect(() => {
    apiFetch<DeliveryOptions>("/api/orders/delivery-options").then(setDelivery).catch(() => setDelivery(null));
  }, []);

  useEffect(() => {
    if (user) setForm((f) => (f.shipping_name ? f : { ...f, shipping_name: user.full_name }));
  }, [user]);

  if (!ready || !user) {
    return <div className="container py-24 text-center text-ink-500">Loading…</div>;
  }

  if (lines.length === 0) {
    return (
      <section className="container py-24 text-center">
        <h1 className="font-display text-display-md text-ink-900">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-6">
          Go to the shop
        </Link>
      </section>
    );
  }

  // Mirrors the server's rule; the server's figure is what gets charged.
  const freeDelivery = delivery?.free_delivery_threshold != null && subtotal >= delivery.free_delivery_threshold;
  const zoneFee = delivery?.options.find((o) => o.zone === zone)?.fee ?? 0;
  const deliveryFee = freeDelivery ? 0 : zoneFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const order = await apiFetch<Order>("/api/orders", {
        method: "POST",
        token,
        body: {
          ...form,
          notes: form.notes.trim() || undefined,
          payment_method: method,
          delivery_zone: zone,
          items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
        },
      });
      clear();
      router.push(`/account?order=${order.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn’t reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section className="container py-12 md:py-16">
      <h1 className="font-display text-display-lg text-ink-950">Checkout</h1>

      <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <div role="group" aria-labelledby="delivery-heading" className="card space-y-5 p-6 sm:p-8">
            <h2 id="delivery-heading" className="font-display text-xl text-ink-900">Delivery details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="shipping_name" className="field-label">Full name</label>
                <input id="shipping_name" required minLength={2} maxLength={120} autoComplete="name" className="field" value={form.shipping_name} onChange={set("shipping_name")} />
              </div>
              <div>
                <label htmlFor="phone" className="field-label">Mobile number</label>
                <input id="phone" required type="tel" inputMode="tel" pattern="\+?[0-9\s\-]{7,20}" maxLength={20} autoComplete="tel" placeholder="98XXXXXXXX" className="field" value={form.phone} onChange={set("phone")} />
              </div>
            </div>
            <div>
              <label htmlFor="shipping_address" className="field-label">Address</label>
              <input id="shipping_address" required minLength={5} maxLength={300} autoComplete="street-address" placeholder="Street, tole, ward no." className="field" value={form.shipping_address} onChange={set("shipping_address")} />
            </div>
            <div>
              <label htmlFor="city" className="field-label">City</label>
              <input id="city" required minLength={2} maxLength={80} autoComplete="address-level2" placeholder="Kathmandu" className="field" value={form.city} onChange={set("city")} />
            </div>
            <div>
              <label htmlFor="notes" className="field-label">
                Notes <span className="font-normal text-ink-400">(optional)</span>
              </label>
              <textarea id="notes" rows={3} maxLength={500} className="field" value={form.notes} onChange={set("notes")} placeholder="Landmark, best time to call…" />
            </div>
          </div>

          <div role="radiogroup" aria-labelledby="delivery-zone-heading" className="card p-6 sm:p-8">
            <h2 id="delivery-zone-heading" className="font-display text-xl text-ink-900">Delivery area</h2>
            {delivery?.free_delivery_threshold != null && (
              <p className="mt-1 text-sm text-ink-500">Free delivery on orders over {formatPrice(delivery.free_delivery_threshold)}.</p>
            )}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(delivery?.options ?? [
                { zone: "inside_valley" as const, label: "Inside Kathmandu Valley", fee: 0 },
                { zone: "outside_valley" as const, label: "Outside Kathmandu Valley", fee: 0 },
              ]).map((o) => (
                <label
                  key={o.zone}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition",
                    zone === o.zone ? "border-ink-900 bg-ink-50 ring-1 ring-ink-900" : "border-line hover:border-ink-200",
                  )}
                >
                  <input type="radio" name="zone" value={o.zone} checked={zone === o.zone} onChange={() => setZone(o.zone)} className="sr-only" />
                  <span className="font-medium text-ink-900">{o.label}</span>
                  <span className="text-sm text-ink-600">{freeDelivery || o.fee === 0 ? "Free" : formatPrice(o.fee)}</span>
                </label>
              ))}
            </div>
          </div>

          <div role="radiogroup" aria-labelledby="payment-heading" className="card p-6 sm:p-8">
            <h2 id="payment-heading" className="mb-5 font-display text-xl text-ink-900">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {METHODS.map((m) => (
                <label
                  key={m.value}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition",
                    method === m.value ? "border-ink-900 bg-ink-50 ring-1 ring-ink-900" : "border-line hover:border-ink-200",
                  )}
                >
                  <input type="radio" name="payment" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} className="sr-only" />
                  <span className="block font-medium text-ink-900">{m.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-500">{m.note}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-32">
          <h2 className="font-display text-xl text-ink-900">Your order</h2>
          <ul className="mt-5 divide-y divide-line text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-4 py-3">
                <span className="text-ink-700">
                  {l.name} <span className="text-ink-400">× {l.quantity}</span>
                </span>
                <span className="font-medium text-ink-900">{formatPrice(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-600">Subtotal</dt>
              <dd className="text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-600">Delivery</dt>
              <dd className="text-ink-900">{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-medium text-ink-900">Total</span>
            <span className="text-xl font-semibold text-ink-950">{formatPrice(subtotal + deliveryFee)}</span>
          </div>
          {error && <p className="alert-error mt-5" role="alert">{error}</p>}
          <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-4 text-center text-xs text-ink-500">Signed in as {user.email}</p>
        </aside>
      </form>
    </section>
  );
}
