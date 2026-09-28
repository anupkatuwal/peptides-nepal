"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminHeading, useAdminApi } from "@/components/admin/AdminShell";
import { ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { AdminSummary, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOverview() {
  const api = useAdminApi();
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<AdminSummary>("/api/admin/summary")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Couldn’t load the summary."));
  }, [api]);

  if (error) return <p className="alert-error">{error}</p>;
  if (!data) return <p className="text-ink-500">Loading…</p>;

  const needsAction = (data.orders_by_status.Pending ?? 0) + (data.orders_by_status.Paid ?? 0);

  return (
    <>
      <AdminHeading title="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders to handle" value={String(needsAction)} href="/admin/orders?status=Pending" note="Pending + paid" />
        <Stat label="Revenue, last 30 days" value={formatPrice(data.revenue_30d)} note={`${data.orders_30d} orders, excl. cancelled`} />
        <Stat label="Unread messages" value={String(data.unread_messages)} href="/admin/messages" />
        <Stat
          label="Products without lab results"
          value={String(data.missing_lab_results)}
          href="/admin/products"
          note="Missing purity or COA"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-xl text-ink-900">Orders by status</h2>
          <ul className="mt-4 divide-y divide-line text-sm">
            {STATUSES.map((s) => (
              <li key={s}>
                <Link href={`/admin/orders?status=${s}`} className="flex justify-between py-2.5 hover:text-ink-950">
                  <span className="text-ink-700">{s}</span>
                  <span className="font-mono text-ink-900">{data.orders_by_status[s] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-xl text-ink-900">Low stock</h2>
          {data.low_stock.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">Every product has more than 5 in stock.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line text-sm">
              {data.low_stock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex justify-between py-2.5 hover:text-ink-950">
                    <span className="text-ink-700">{p.name}</span>
                    <span className={p.stock_level === 0 ? "font-medium text-red-700" : "font-mono text-amber-700"}>
                      {p.stock_level === 0 ? "Sold out" : `${p.stock_level} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-ink-950">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-500">{note}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      {body}
    </Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}
