"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { cn, formatDate, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";

import { useAuth } from "./Providers";

const statusStyle: Record<OrderStatus, string> = {
  Pending: "bg-amber-50 text-amber-800 border-amber-200",
  Paid: "bg-sage-50 text-sage-800 border-sage-200",
  Processing: "bg-ink-50 text-ink-700 border-ink-200",
  Shipped: "bg-ink-50 text-ink-800 border-ink-200",
  Delivered: "bg-sage-100 text-sage-900 border-sage-300",
  Cancelled: "bg-red-50 text-red-800 border-red-200",
};

export default function AccountView() {
  const router = useRouter();
  const params = useSearchParams();
  const placed = params.get("order");
  const { user, token, ready, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/account");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Order[]>("/api/orders/me", { token })
      .then(setOrders)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn’t load your orders."));
  }, [token]);

  if (!ready || !user) return <div className="container py-24 text-center text-ink-500">Loading…</div>;

  const wa = placed ? whatsappLink(`Hi Peptides Nepal, I just placed order #${placed}.`) : null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-3 font-display text-display-lg text-ink-950">Namaste, {user.full_name.split(" ")[0]}</h1>
          <p className="mt-2 text-ink-600">{user.email}</p>
        </div>
        <div className="flex gap-2">
        {user.role === "Admin" && (
          <Link href="/admin" className="btn-primary">
            Admin dashboard
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="btn-secondary"
        >
          Sign out
        </button>
        </div>
      </div>

      {placed && (
        <div className="alert-success mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="status">
          <span>
            <strong>Order #{placed} placed.</strong> We’ll call to confirm delivery and, for eSewa or Khalti, send payment details.
          </span>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="shrink-0 font-medium underline underline-offset-4">
              Message us on WhatsApp
            </a>
          )}
        </div>
      )}

      <h2 className="mt-12 font-display text-2xl text-ink-900">Orders</h2>
      {error && <p className="alert-error mt-4">{error}</p>}
      {orders === null && !error && <p className="mt-4 text-ink-500">Loading orders…</p>}
      {orders?.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
          <p className="text-ink-600">No orders yet.</p>
          <Link href="/shop" className="btn-primary mt-5">
            Start shopping
          </Link>
        </div>
      )}
      <ul className="mt-4 space-y-4">
        {orders?.map((o) => (
          <li key={o.id} className={cn("card overflow-hidden", String(o.id) === placed && "ring-2 ring-sage-300")}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist/50 px-6 py-4 text-sm">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="font-mono font-medium text-ink-900">#{o.id}</span>
                <span className="text-ink-600">{formatDate(o.order_date)}</span>
                <span className="text-ink-600">{o.payment_method === "COD" ? "Cash on delivery" : o.payment_method}</span>
              </div>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", statusStyle[o.status])}>{o.status}</span>
            </div>
            <ul className="divide-y divide-line px-6">
              {o.items.map((i) => (
                <li key={i.product_id} className="flex justify-between gap-4 py-3 text-sm">
                  <Link href={`/products/${i.product_slug}`} className="text-ink-800 hover:text-sage-700">
                    {i.product_name} <span className="text-ink-400">× {i.quantity}</span>
                  </Link>
                  <span className="text-ink-900">{formatPrice(i.unit_price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-between gap-2 border-t border-line px-6 py-4 text-sm">
              <span className="text-ink-500">
                To {o.shipping_name}, {o.city}
                {o.delivery_fee > 0 && <> · Delivery {formatPrice(o.delivery_fee)}</>}
              </span>
              <span className="font-semibold text-ink-950">{formatPrice(o.total_price)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
