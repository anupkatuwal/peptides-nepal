"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { AdminHeading, useAdminApi } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { cn, formatDate, formatPrice } from "@/lib/format";
import type { AdminOrder, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<p className="text-ink-500">Loading…</p>}>
      <Orders />
    </Suspense>
  );
}

function Orders() {
  const api = useAdminApi();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter = (params.get("status") as OrderStatus | null) ?? null;

  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    setOrders(null);
    api<AdminOrder[]>(`/api/orders${filter ? `?status=${filter}` : ""}`)
      .then(setOrders)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load orders."));
  }, [api, filter]);

  useEffect(load, [load]);

  async function setStatus(order: AdminOrder, status: OrderStatus) {
    if (status === "Cancelled" && !window.confirm(`Cancel order #${order.id}? Its stock goes back on the shelf. This can't be undone.`)) return;
    setError("");
    try {
      const updated = await api<AdminOrder>(`/api/orders/${order.id}/status`, { method: "PATCH", body: { status } });
      setOrders((list) => list?.map((o) => (o.id === updated.id ? updated : o)) ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Couldn’t update the order.");
    }
  }

  return (
    <>
      <AdminHeading title="Orders" />
      <div className="mb-6 flex flex-wrap gap-2">
        {[null, ...STATUSES].map((s) => (
          <button
            key={s ?? "all"}
            type="button"
            onClick={() => router.push(s ? `${pathname}?status=${s}` : pathname)}
            className={cn("chip", filter === s && "chip-active")}
          >
            {s ?? "All"}
          </button>
        ))}
      </div>

      {error && <p className="alert-error mb-4">{error}</p>}
      {orders === null && !error && <p className="text-ink-500">Loading…</p>}
      {orders?.length === 0 && <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-ink-500">No orders here.</p>}

      <ul className="space-y-3">
        {orders?.map((o) => (
          <li key={o.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(open === o.id ? null : o.id)}
              aria-expanded={open === o.id}
              className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left text-sm hover:bg-mist/50"
            >
              <span className="font-mono font-medium text-ink-900">#{o.id}</span>
              <span className="text-ink-600">{formatDate(o.order_date)}</span>
              <span className="min-w-0 flex-1 truncate text-ink-800">{o.customer_name}</span>
              <span className="text-ink-600">
                {o.payment_method === "COD" ? "COD" : o.payment_method}
                {o.payment_method !== "COD" && (
                  <span className={cn("ml-1.5", o.payment_status === "Paid" ? "text-sage-700" : "text-amber-700")}>· {o.payment_status}</span>
                )}
              </span>
              <span className="font-semibold text-ink-950">{formatPrice(o.total_price)}</span>
              <StatusPill status={o.status} />
            </button>

            {open === o.id && (
              <div className="grid gap-6 border-t border-line p-5 text-sm md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Items</h3>
                  <ul className="mt-2 divide-y divide-line">
                    {o.items.map((i) => (
                      <li key={i.product_id} className="flex justify-between py-2">
                        <Link href={`/products/${i.product_slug}`} className="text-ink-800 hover:underline" target="_blank">
                          {i.product_name} × {i.quantity}
                        </Link>
                        <span>{formatPrice(i.unit_price * i.quantity)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between py-2 text-ink-600">
                      <span>Delivery</span>
                      <span>{o.delivery_fee === 0 ? "Free" : formatPrice(o.delivery_fee)}</span>
                    </li>
                  </ul>
                  {o.payment_reference && (
                    <p className="mt-3 text-xs text-ink-500">
                      Payment ref: <span className="font-mono">{o.payment_reference}</span>
                      {o.paid_at && <> · paid {formatDate(o.paid_at)}</>}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">Deliver to</h3>
                  <p className="mt-2 text-ink-800">
                    {o.shipping_name}
                    <br />
                    {o.shipping_address}, {o.city}
                    <br />
                    <a href={`tel:${o.phone}`} className="font-mono text-ink-900 underline">{o.phone}</a>
                  </p>
                  <p className="mt-2 text-ink-600">
                    Account: <a href={`mailto:${o.customer_email}`} className="underline">{o.customer_email}</a>
                  </p>
                  {o.notes && <p className="mt-2 rounded-lg bg-mist p-3 text-ink-700">“{o.notes}”</p>}

                  {o.status !== "Cancelled" && (
                    <div className="mt-5">
                      <label htmlFor={`status-${o.id}`} className="field-label">Change status</label>
                      <select
                        id={`status-${o.id}`}
                        value={o.status}
                        onChange={(e) => setStatus(o, e.target.value as OrderStatus)}
                        className="field max-w-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const style: Record<OrderStatus, string> = {
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Paid: "bg-sage-50 text-sage-800 border-sage-200",
    Processing: "bg-ink-50 text-ink-700 border-ink-200",
    Shipped: "bg-ink-50 text-ink-800 border-ink-200",
    Delivered: "bg-sage-100 text-sage-900 border-sage-300",
    Cancelled: "bg-red-50 text-red-800 border-red-200",
  };
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", style[status])}>{status}</span>;
}
